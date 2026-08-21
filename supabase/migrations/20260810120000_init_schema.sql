-- ============================================================================
-- AgriLite AI — initial schema
-- ============================================================================
-- Design notes (read before extending):
--
-- - auth.users is managed by Supabase Auth. public.profiles is a 1:1 extension
--   of it, auto-created via trigger on signup.
-- - Farm data is multi-tenant: a farm has one primary owner (farms.owner_id)
--   plus zero or more collaborators via farm_members (owner/manager/worker/
--   viewer). Every farm-scoped table carries a direct farm_id — even where
--   it's technically derivable via a join (crops -> fields -> farms) — so RLS
--   policies and common queries don't need multi-hop joins. crops.farm_id is
--   kept in sync with fields.farm_id via trigger, not left to the client.
-- - RLS is enabled on every table. Supabase exposes tables over the API by
--   default; without RLS, `anon`/`authenticated` grants (or a permissive
--   policy) determine what's exposed, so every table below gets an explicit
--   policy set rather than relying on defaults.
-- - Enums are used for small, closed sets that code branches on (status,
--   severity, role). Free-form descriptive fields (farm_type, crop_types.
--   category) stay `text` — new farm/crop categories shouldn't require a
--   migration.
-- - No soft-delete. A first version with hard-delete + ON DELETE CASCADE is
--   simpler and easier to reason about; add `deleted_at` to `farms` later if
--   "undo delete" becomes an actual product requirement, not before.
-- - Primary keys are `uuid`, not `bigint identity`, despite identity being the
--   generally-preferred choice (sequential, no index fragmentation). These
--   IDs are client-facing (route params like /field/[id], API payloads) in a
--   multi-tenant app, so a non-enumerable ID is worth the fragmentation
--   tradeoff — and `profiles.id` must be `uuid` regardless, to match
--   `auth.users.id`. `crop_types`, a global lookup table never exposed as a
--   client-facing entity ID, uses `identity` instead. If insert volume ever
--   makes UUIDv4 fragmentation a measured problem, UUIDv7 (time-ordered) is
--   the upgrade path — not adopted now since it needs the non-default
--   `pg_uuidv7` extension.
-- - RLS helper functions live in `private`, not `public` — `public` is what
--   PostgREST exposes over the API by default, so keeping them in a schema
--   that's never exposed means they're only reachable from inside policy
--   definitions, not callable directly as `/rest/v1/rpc/is_farm_member`.
-- - Deliberately NOT modeled yet (per backend/docs/PRD.md's "don't build
--   ahead of scope" discipline): soil test results, IoT sensor readings,
--   satellite imagery, market prices. Add these as their own migration with
--   their own mini-scope when a feature actually needs them — the pattern
--   here (a `<domain>` table scoped by farm_id/field_id/crop_id, RLS via
--   `is_farm_member`) is the template to follow.
--
-- IMPORTANT — this introduces persistence where the backend currently has
-- none. backend/docs/PRD.md §6 states "No persistence layer exists... the
-- client resends full chat history on every /chat call." Adopting
-- chat_conversations/chat_messages here is a real scope change (chat history
-- moving server-side) — treat it as a PRD diff + backend work item, not an
-- automatic wire-up. Nothing in the FastAPI backend reads from this schema
-- yet.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()

-- Not exposed to PostgREST (only `public` is, by default) — houses the RLS
-- helper functions below so they can't be invoked directly as RPCs.
--
-- Supabase's project bootstrap grants USAGE on `public` to anon/authenticated
-- automatically; it has no idea this schema exists, so that grant has to be
-- explicit here — otherwise every policy that calls private.is_farm_member()
-- fails with "permission denied for schema private" for real app traffic.
-- (EXECUTE on the functions themselves doesn't need a separate grant: Postgres
-- grants EXECUTE on new functions to PUBLIC by default.)
create schema if not exists private;
grant usage on schema private to authenticated, anon;


-- ----------------------------------------------------------------------------
-- Enum types
-- ----------------------------------------------------------------------------
create type public.farm_member_role as enum ('owner', 'manager', 'worker', 'viewer');
create type public.farm_status      as enum ('active', 'inactive', 'archived');
create type public.field_status     as enum ('active', 'fallow', 'harvested');
create type public.crop_status      as enum ('healthy', 'at_risk', 'needs_attention', 'harvested');
create type public.activity_type    as enum ('irrigation', 'spraying', 'fertilizing', 'planting', 'harvest', 'scouting', 'soil_test', 'other');
create type public.alert_type       as enum ('weather', 'pest', 'disease', 'harvest', 'frost', 'fungal_risk', 'system', 'other');
create type public.alert_severity   as enum ('info', 'warning', 'critical');
create type public.chat_role        as enum ('user', 'model');
create type public.device_platform  as enum ('ios', 'android', 'web');


-- ----------------------------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------------------------

-- Shared "touch updated_at" trigger, reused by every table that has the column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — 1:1 extension of auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  full_name           text,
  phone               text,
  avatar_url          text,
  notify_email        boolean not null default true,
  notify_push         boolean not null default true,
  notify_sms          boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Pure trigger function (references NEW, only valid in trigger context) — not
-- meant to be called directly as /rest/v1/rpc/handle_new_user. Revoke the
-- default PUBLIC execute grant so anon/authenticated can't invoke it as an RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;


-- ----------------------------------------------------------------------------
-- farms
-- ----------------------------------------------------------------------------
create table public.farms (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles (id) on delete cascade,
  name                text not null,
  farm_type           text,                       -- free text: "Mixed Crops", "Orchard", ...
  status              public.farm_status not null default 'active',
  location_label      text,                        -- display string, e.g. "Stellenbosch, South Africa"
  latitude            double precision check (latitude  between -90  and 90),
  longitude           double precision check (longitude between -180 and 180),
  total_hectares      numeric(10, 2) check (total_hectares >= 0),
  established_on      date,
  photo_url           text,                        -- Supabase Storage public URL for the hero photo
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_farms_owner_id on public.farms (owner_id);

create trigger trg_farms_updated_at
  before update on public.farms
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- farm_members — per-farm collaborators & roles
-- ----------------------------------------------------------------------------
create table public.farm_members (
  id                  uuid primary key default gen_random_uuid(),
  farm_id             uuid not null references public.farms (id) on delete cascade,
  user_id             uuid not null references public.profiles (id) on delete cascade,
  role                public.farm_member_role not null default 'worker',
  invited_by          uuid references public.profiles (id) on delete set null,
  joined_at           timestamptz not null default now(),
  unique (farm_id, user_id)
);

create index idx_farm_members_farm_id on public.farm_members (farm_id);
create index idx_farm_members_user_id on public.farm_members (user_id);
create index idx_farm_members_invited_by on public.farm_members (invited_by);

-- Whoever creates a farm is automatically its 'owner' member.
create or replace function public.handle_new_farm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.farm_members (farm_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (farm_id, user_id) do nothing;
  return new;
end;
$$;

create trigger trg_farms_seed_owner_membership
  after insert on public.farms
  for each row execute procedure public.handle_new_farm();

-- Same as handle_new_user above — pure trigger function, not an RPC.
revoke execute on function public.handle_new_farm() from public, anon, authenticated;


-- ----------------------------------------------------------------------------
-- fields
-- ----------------------------------------------------------------------------
create table public.fields (
  id                  uuid primary key default gen_random_uuid(),
  farm_id             uuid not null references public.farms (id) on delete cascade,
  name                text not null,
  hectares            numeric(10, 2) check (hectares >= 0),
  status              public.field_status not null default 'active',
  soil_type           text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_fields_farm_id on public.fields (farm_id);

create trigger trg_fields_updated_at
  before update on public.fields
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------------------------
-- crop_types — shared reference/lookup table (not farm-scoped)
-- ----------------------------------------------------------------------------
create table public.crop_types (
  id                      integer generated always as identity primary key,
  name                    text not null unique,        -- "Maize", "Tomatoes", ...
  emoji                   text,
  category                text,                        -- "grain", "vegetable", "fruit", "legume", ...
  typical_days_to_maturity integer,
  created_at              timestamptz not null default now()
);

insert into public.crop_types (name, emoji, category, typical_days_to_maturity) values
  ('Maize',       '🌽', 'grain',     120),
  ('Tomatoes',    '🍅', 'vegetable', 80),
  ('Spinach',     '🥬', 'vegetable', 45),
  ('Green Beans', '🫛', 'legume',    55);


-- ----------------------------------------------------------------------------
-- crops — a planted instance of a crop type in a field
-- ----------------------------------------------------------------------------
create table public.crops (
  id                      uuid primary key default gen_random_uuid(),
  field_id                uuid not null references public.fields (id) on delete cascade,
  farm_id                 uuid not null references public.farms (id) on delete cascade,  -- kept in sync via trigger, see below
  crop_type_id            integer references public.crop_types (id),
  variety                 text,
  planted_on              date not null,
  expected_harvest_date   date,
  actual_harvest_date     date,
  status                  public.crop_status not null default 'healthy',
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (actual_harvest_date is null or actual_harvest_date >= planted_on)
);

create index idx_crops_field_id on public.crops (field_id);
create index idx_crops_farm_id on public.crops (farm_id);
create index idx_crops_crop_type_id on public.crops (crop_type_id);
create index idx_crops_status on public.crops (status);

create trigger trg_crops_updated_at
  before update on public.crops
  for each row execute procedure public.set_updated_at();

-- farm_id must always match the parent field's farm_id — set server-side so
-- RLS checks and farm-scoped queries never depend on client-supplied data.
create or replace function public.set_crop_farm_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select farm_id into new.farm_id from public.fields where id = new.field_id;
  if new.farm_id is null then
    raise exception 'field % does not exist', new.field_id;
  end if;
  return new;
end;
$$;

create trigger trg_crops_set_farm_id
  before insert or update of field_id on public.crops
  for each row execute procedure public.set_crop_farm_id();


-- ----------------------------------------------------------------------------
-- farm_activities — irrigation/spraying/fertilizing/harvest/scouting log
-- ----------------------------------------------------------------------------
create table public.farm_activities (
  id                  uuid primary key default gen_random_uuid(),
  farm_id             uuid not null references public.farms (id) on delete cascade,
  field_id            uuid references public.fields (id) on delete set null,
  crop_id             uuid references public.crops (id) on delete set null,
  logged_by           uuid references public.profiles (id) on delete set null,
  activity_type       public.activity_type not null,
  description         text,
  quantity            numeric(10, 2),
  unit                text,                        -- "mm", "L", "kg", ...
  occurred_at         timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index idx_farm_activities_farm_id on public.farm_activities (farm_id, occurred_at desc);
create index idx_farm_activities_field_id on public.farm_activities (field_id);
create index idx_farm_activities_crop_id on public.farm_activities (crop_id);
create index idx_farm_activities_logged_by on public.farm_activities (logged_by);


-- ----------------------------------------------------------------------------
-- weather_snapshots — daily forecast/actuals cache per farm
-- ----------------------------------------------------------------------------
-- Populated by the backend after each GET /weather/forecast call for a farm's
-- coordinates. Powers historical/monthly aggregates (e.g. "My Farm" insights:
-- avg temp, avg humidity, rainfall this month) without re-querying Open-Meteo
-- or hardcoding numbers client-side.
create table public.weather_snapshots (
  id                          uuid primary key default gen_random_uuid(),
  farm_id                     uuid not null references public.farms (id) on delete cascade,
  recorded_date               date not null,
  min_temp_c                  numeric(5, 2),
  max_temp_c                  numeric(5, 2),
  precipitation_mm            numeric(6, 2),
  humidity_pct                numeric(5, 2) check (humidity_pct is null or humidity_pct between 0 and 100),
  frost_warning               boolean not null default false,
  high_humidity_fungal_risk   boolean not null default false,
  source                      text not null default 'open-meteo',
  created_at                  timestamptz not null default now(),
  unique (farm_id, recorded_date)
);

create index idx_weather_snapshots_farm_id on public.weather_snapshots (farm_id, recorded_date desc);


-- ----------------------------------------------------------------------------
-- alerts
-- ----------------------------------------------------------------------------
create table public.alerts (
  id                  uuid primary key default gen_random_uuid(),
  farm_id             uuid not null references public.farms (id) on delete cascade,
  field_id            uuid references public.fields (id) on delete set null,
  crop_id             uuid references public.crops (id) on delete set null,
  alert_type          public.alert_type not null,
  severity            public.alert_severity not null default 'info',
  title               text not null,
  message             text not null,
  icon                text,                        -- optional client icon-name hint
  source              text not null default 'system',  -- 'system' | 'ai' | 'manual'
  is_read             boolean not null default false,
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_alerts_farm_id on public.alerts (farm_id, created_at desc);
create index idx_alerts_field_id on public.alerts (field_id);
create index idx_alerts_crop_id on public.alerts (crop_id);
create index idx_alerts_unread on public.alerts (farm_id) where is_read = false;


-- ----------------------------------------------------------------------------
-- chat_conversations / chat_messages
-- ----------------------------------------------------------------------------
-- See the persistence note at the top of this file before wiring these up —
-- this is new server-side state the current stateless backend doesn't have.
create table public.chat_conversations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  farm_id             uuid references public.farms (id) on delete set null,
  title               text,                        -- app-set, e.g. first user message
  latitude            double precision,
  longitude           double precision,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_chat_conversations_user_id on public.chat_conversations (user_id, updated_at desc);
create index idx_chat_conversations_farm_id on public.chat_conversations (farm_id);

create trigger trg_chat_conversations_updated_at
  before update on public.chat_conversations
  for each row execute procedure public.set_updated_at();

create table public.chat_messages (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid not null references public.chat_conversations (id) on delete cascade,
  role                public.chat_role not null,
  content             text not null,
  recommendations     text[],
  sustainability_note text,
  is_farming_related  boolean,
  created_at          timestamptz not null default now(),
  check (
    role = 'model'
    or (recommendations is null and sustainability_note is null and is_farming_related is null)
  )
);

create index idx_chat_messages_conversation_id on public.chat_messages (conversation_id, created_at);

-- Keep the parent conversation's updated_at current as messages are added
-- (drives "Recent Chats" ordering on the home screen).
create or replace function public.touch_conversation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.chat_conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_chat_messages_touch_conversation
  after insert on public.chat_messages
  for each row execute procedure public.touch_conversation();


-- ----------------------------------------------------------------------------
-- attachments — photos of farms/fields/crops (Supabase Storage-backed)
-- ----------------------------------------------------------------------------
create table public.attachments (
  id                  uuid primary key default gen_random_uuid(),
  farm_id             uuid not null references public.farms (id) on delete cascade,
  field_id            uuid references public.fields (id) on delete set null,
  crop_id             uuid references public.crops (id) on delete set null,
  uploaded_by         uuid references public.profiles (id) on delete set null,
  storage_path        text not null,               -- path within the `farm-media` bucket
  file_type           text,
  caption             text,
  created_at          timestamptz not null default now()
);

create index idx_attachments_farm_id on public.attachments (farm_id);
create index idx_attachments_field_id on public.attachments (field_id);
create index idx_attachments_crop_id on public.attachments (crop_id);
create index idx_attachments_uploaded_by on public.attachments (uploaded_by);

insert into storage.buckets (id, name, public)
values ('farm-media', 'farm-media', false)
on conflict (id) do nothing;


-- ----------------------------------------------------------------------------
-- notification_devices — push tokens
-- ----------------------------------------------------------------------------
create table public.notification_devices (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  expo_push_token     text not null unique,
  platform            public.device_platform not null,
  last_active_at      timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index idx_notification_devices_user_id on public.notification_devices (user_id);


-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Centralizes the "is this user allowed to see this farm's data" check so RLS
-- policies stay one-liners. SECURITY DEFINER so it can read farm_members
-- regardless of the caller's own RLS grants on that table (avoids recursive
-- policy evaluation on farm_members itself). search_path is pinned empty and
-- every reference is schema-qualified, so a malicious object earlier in some
-- other search_path can't get resolved into this function by mistake.
create or replace function private.is_farm_member(p_farm_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.farm_members fm
    where fm.farm_id = p_farm_id
      and fm.user_id = (select auth.uid())
  );
$$;

-- Same idea, restricted to roles allowed to write (not just view).
create or replace function private.is_farm_editor(p_farm_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.farm_members fm
    where fm.farm_id = p_farm_id
      and fm.user_id = (select auth.uid())
      and fm.role in ('owner', 'manager', 'worker')
  );
$$;

alter table public.profiles              enable row level security;
alter table public.farms                 enable row level security;
alter table public.farm_members          enable row level security;
alter table public.fields                enable row level security;
alter table public.crop_types            enable row level security;
alter table public.crops                 enable row level security;
alter table public.farm_activities       enable row level security;
alter table public.weather_snapshots     enable row level security;
alter table public.alerts                enable row level security;
alter table public.chat_conversations    enable row level security;
alter table public.chat_messages         enable row level security;
alter table public.attachments           enable row level security;
alter table public.notification_devices  enable row level security;

-- NOTE: every auth.uid()/auth.role() call below is wrapped in `(select ...)`.
-- Unwrapped, Postgres re-evaluates the function per row scanned; wrapped, the
-- planner turns it into an InitPlan evaluated once per query — a documented
-- 5-10x+ difference on RLS-filtered queries at any real scale.

-- profiles: each user manages only their own row.
create policy "profiles_select_own" on public.profiles
  for select using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid()));

-- farms: any member can view; only the owner can insert/delete; owner or
-- manager can update.
create policy "farms_select_members" on public.farms
  for select using (private.is_farm_member(id));
-- INSERT ... RETURNING (the frontend's `.insert().select()` to get the new
-- farm's id back) requires the new row to also satisfy a SELECT policy.
-- farms_select_members alone can't do that here: it depends on a
-- farm_members row that trg_farms_seed_owner_membership (AFTER INSERT) hasn't
-- created yet at RETURNING-evaluation time. This direct owner check doesn't
-- depend on the trigger having run.
create policy "farms_select_own" on public.farms
  for select using (owner_id = (select auth.uid()));
create policy "farms_insert_owner" on public.farms
  for insert with check (owner_id = (select auth.uid()));
create policy "farms_update_owner_manager" on public.farms
  for update using (
    exists (
      select 1 from public.farm_members fm
      where fm.farm_id = farms.id and fm.user_id = (select auth.uid()) and fm.role in ('owner', 'manager')
    )
  );
create policy "farms_delete_owner" on public.farms
  for delete using (owner_id = (select auth.uid()));

-- farm_members: members can see their farm's roster; only owner/manager
-- manage membership.
create policy "farm_members_select_members" on public.farm_members
  for select using (private.is_farm_member(farm_id));
create policy "farm_members_write_owner_manager" on public.farm_members
  for all using (
    exists (
      select 1 from public.farm_members fm
      where fm.farm_id = farm_members.farm_id and fm.user_id = (select auth.uid()) and fm.role in ('owner', 'manager')
    )
  ) with check (
    exists (
      select 1 from public.farm_members fm
      where fm.farm_id = farm_members.farm_id and fm.user_id = (select auth.uid()) and fm.role in ('owner', 'manager')
    )
  );

-- crop_types: readable by any authenticated user; not writable via the API
-- (managed by migrations / service_role only).
create policy "crop_types_select_all" on public.crop_types
  for select using ((select auth.role()) = 'authenticated');

-- Farm-scoped tables: view = any member, write = owner/manager/worker.
create policy "fields_select_members" on public.fields
  for select using (private.is_farm_member(farm_id));
create policy "fields_write_editors" on public.fields
  for all using (private.is_farm_editor(farm_id)) with check (private.is_farm_editor(farm_id));

create policy "crops_select_members" on public.crops
  for select using (private.is_farm_member(farm_id));
create policy "crops_write_editors" on public.crops
  for all using (private.is_farm_editor(farm_id)) with check (private.is_farm_editor(farm_id));

create policy "farm_activities_select_members" on public.farm_activities
  for select using (private.is_farm_member(farm_id));
create policy "farm_activities_write_editors" on public.farm_activities
  for all using (private.is_farm_editor(farm_id)) with check (private.is_farm_editor(farm_id));

create policy "weather_snapshots_select_members" on public.weather_snapshots
  for select using (private.is_farm_member(farm_id));
-- weather_snapshots are written by the backend via service_role (bypasses RLS) — no client write policy.

create policy "alerts_select_members" on public.alerts
  for select using (private.is_farm_member(farm_id));
create policy "alerts_update_members" on public.alerts
  for update using (private.is_farm_member(farm_id));   -- e.g. marking is_read
-- alert creation is server-side (system/AI generated) via service_role — no client insert policy.

create policy "attachments_select_members" on public.attachments
  for select using (private.is_farm_member(farm_id));
create policy "attachments_write_editors" on public.attachments
  for all using (private.is_farm_editor(farm_id)) with check (private.is_farm_editor(farm_id));

-- chat: private to the owning user, not farm-shared.
create policy "chat_conversations_own" on public.chat_conversations
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "chat_messages_own" on public.chat_messages
  for all using (
    exists (
      select 1 from public.chat_conversations c
      where c.id = chat_messages.conversation_id and c.user_id = (select auth.uid())
    )
  );

-- notification_devices: private to the owning user.
create policy "notification_devices_own" on public.notification_devices
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Storage: farm-media bucket objects are namespaced "<farm_id>/...";
-- membership check reuses is_farm_member against that path segment.
create policy "farm_media_select_members" on storage.objects
  for select using (
    bucket_id = 'farm-media'
    and private.is_farm_member((storage.foldername(name))[1]::uuid)
  );
create policy "farm_media_write_editors" on storage.objects
  for insert with check (
    bucket_id = 'farm-media'
    and private.is_farm_editor((storage.foldername(name))[1]::uuid)
  );
create policy "farm_media_delete_editors" on storage.objects
  for delete using (
    bucket_id = 'farm-media'
    and private.is_farm_editor((storage.foldername(name))[1]::uuid)
  );


-- ============================================================================
-- Views — read-side conveniences matching the app's existing UI aggregates
-- ============================================================================

-- Powers "My Farm" stats row (total area / crops grown / fields / days active)
-- via aggregation instead of denormalized counters that could drift.
create view public.farm_summary
  with (security_invoker = true) as
select
  f.id                                              as farm_id,
  f.name,
  f.status,
  f.total_hectares,
  f.established_on,
  (current_date - f.established_on)                 as days_active,
  (select count(*) from public.fields fl where fl.farm_id = f.id)                          as field_count,
  (select count(*) from public.crops c where c.farm_id = f.id and c.actual_harvest_date is null) as active_crop_count,
  (select count(distinct c.crop_type_id) from public.crops c where c.farm_id = f.id)        as distinct_crop_types
from public.farms f;

-- Powers "Farm Insights" (avg temp / humidity / rainfall this month).
create view public.farm_monthly_weather_insights
  with (security_invoker = true) as
select
  ws.farm_id,
  date_trunc('month', ws.recorded_date)::date        as month,
  avg(ws.max_temp_c)::numeric(5, 2)                  as avg_max_temp_c,
  avg(ws.humidity_pct)::numeric(5, 2)                as avg_humidity_pct,
  sum(ws.precipitation_mm)::numeric(7, 2)             as total_rainfall_mm,
  bool_or(ws.frost_warning)                          as any_frost_warning,
  bool_or(ws.high_humidity_fungal_risk)              as any_fungal_risk
from public.weather_snapshots ws
group by ws.farm_id, date_trunc('month', ws.recorded_date);
