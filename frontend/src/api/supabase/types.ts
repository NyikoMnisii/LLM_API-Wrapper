// Generated via `mcp__supabase__generate_typescript_types` against the live
// project (supabase/migrations/20260810120000_init_schema.sql). Regenerate
// this file (don't hand-edit) whenever the schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"];
          created_at: string;
          crop_id: string | null;
          farm_id: string;
          field_id: string | null;
          icon: string | null;
          id: string;
          is_read: boolean;
          message: string;
          read_at: string | null;
          severity: Database["public"]["Enums"]["alert_severity"];
          source: string;
          title: string;
        };
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"];
          created_at?: string;
          crop_id?: string | null;
          farm_id: string;
          field_id?: string | null;
          icon?: string | null;
          id?: string;
          is_read?: boolean;
          message: string;
          read_at?: string | null;
          severity?: Database["public"]["Enums"]["alert_severity"];
          source?: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
        Relationships: [];
      };
      chat_conversations: {
        Row: {
          created_at: string;
          farm_id: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          farm_id?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_conversations"]["Insert"]>;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          is_farming_related: boolean | null;
          recommendations: string[] | null;
          role: Database["public"]["Enums"]["chat_role"];
          sustainability_note: string | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          is_farming_related?: boolean | null;
          recommendations?: string[] | null;
          role: Database["public"]["Enums"]["chat_role"];
          sustainability_note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: [];
      };
      crop_types: {
        Row: {
          category: string | null;
          created_at: string;
          emoji: string | null;
          id: number;
          name: string;
          typical_days_to_maturity: number | null;
        };
        // Not client-writable (see supabase/migrations) — but supabase-js's
        // GenericTable constraint requires Insert/Update to be object shapes,
        // not `never`; using `never` here collapsed insert()/update() typing
        // to `never[]` for every OTHER table in this Database type too, not
        // just this one. Real (if unused) shapes avoid that trap.
        Insert: {
          category?: string | null;
          created_at?: string;
          emoji?: string | null;
          id?: never;
          name: string;
          typical_days_to_maturity?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["crop_types"]["Insert"]>;
        Relationships: [];
      };
      crops: {
        Row: {
          actual_harvest_date: string | null;
          created_at: string;
          crop_type_id: number | null;
          expected_harvest_date: string | null;
          farm_id: string;
          field_id: string;
          id: string;
          notes: string | null;
          planted_on: string;
          status: Database["public"]["Enums"]["crop_status"];
          updated_at: string;
          variety: string | null;
        };
        Insert: {
          actual_harvest_date?: string | null;
          created_at?: string;
          crop_type_id?: number | null;
          expected_harvest_date?: string | null;
          // farm_id intentionally omitted — synced server-side from field_id via trigger.
          field_id: string;
          id?: string;
          notes?: string | null;
          planted_on: string;
          status?: Database["public"]["Enums"]["crop_status"];
          updated_at?: string;
          variety?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["crops"]["Insert"]>;
        // Needed so the typed query builder can resolve the `crop_types(*)`
        // embedded select in src/api/supabase/crops.ts — without this it
        // can't find the join and the select() return type breaks.
        Relationships: [
          {
            foreignKeyName: "crops_crop_type_id_fkey";
            columns: ["crop_type_id"];
            isOneToOne: false;
            referencedRelation: "crop_types";
            referencedColumns: ["id"];
          },
        ];
      };
      farm_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"];
          created_at: string;
          crop_id: string | null;
          description: string | null;
          farm_id: string;
          field_id: string | null;
          id: string;
          logged_by: string | null;
          occurred_at: string;
          quantity: number | null;
          unit: string | null;
        };
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"];
          created_at?: string;
          crop_id?: string | null;
          description?: string | null;
          farm_id: string;
          field_id?: string | null;
          id?: string;
          logged_by?: string | null;
          occurred_at?: string;
          quantity?: number | null;
          unit?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["farm_activities"]["Insert"]>;
        Relationships: [];
      };
      farm_members: {
        Row: {
          farm_id: string;
          id: string;
          invited_by: string | null;
          joined_at: string;
          role: Database["public"]["Enums"]["farm_member_role"];
          user_id: string;
        };
        // Not client-writable directly (seeded by the handle_new_farm
        // trigger) — see the crop_types comment above for why this is a
        // real shape rather than `never`.
        Insert: {
          farm_id: string;
          id?: string;
          invited_by?: string | null;
          joined_at?: string;
          role?: Database["public"]["Enums"]["farm_member_role"];
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["farm_members"]["Insert"]>;
        Relationships: [];
      };
      farms: {
        Row: {
          created_at: string;
          established_on: string | null;
          farm_type: string | null;
          id: string;
          latitude: number | null;
          location_label: string | null;
          longitude: number | null;
          name: string;
          owner_id: string;
          photo_url: string | null;
          status: Database["public"]["Enums"]["farm_status"];
          total_hectares: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          established_on?: string | null;
          farm_type?: string | null;
          id?: string;
          latitude?: number | null;
          location_label?: string | null;
          longitude?: number | null;
          name: string;
          owner_id: string;
          photo_url?: string | null;
          status?: Database["public"]["Enums"]["farm_status"];
          total_hectares?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["farms"]["Insert"]>;
        Relationships: [];
      };
      fields: {
        Row: {
          created_at: string;
          farm_id: string;
          hectares: number | null;
          id: string;
          name: string;
          notes: string | null;
          soil_type: string | null;
          status: Database["public"]["Enums"]["field_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          farm_id: string;
          hectares?: number | null;
          id?: string;
          name: string;
          notes?: string | null;
          soil_type?: string | null;
          status?: Database["public"]["Enums"]["field_status"];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fields"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          notify_email: boolean;
          notify_push: boolean;
          notify_sms: boolean;
          phone: string | null;
          updated_at: string;
        };
        // Row is trigger-created on signup (handle_new_user), not
        // client-inserted — see the crop_types comment above for why this is
        // a real shape rather than `never`.
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          notify_email?: boolean;
          notify_push?: boolean;
          notify_sms?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          notify_email?: boolean;
          notify_push?: boolean;
          notify_sms?: boolean;
          phone?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      farm_monthly_weather_insights: {
        Row: {
          any_frost_warning: boolean | null;
          any_fungal_risk: boolean | null;
          avg_humidity_pct: number | null;
          avg_max_temp_c: number | null;
          farm_id: string | null;
          month: string | null;
          total_rainfall_mm: number | null;
        };
        Relationships: [];
      };
      farm_summary: {
        Row: {
          active_crop_count: number | null;
          days_active: number | null;
          distinct_crop_types: number | null;
          established_on: string | null;
          farm_id: string | null;
          field_count: number | null;
          name: string | null;
          status: Database["public"]["Enums"]["farm_status"] | null;
          total_hectares: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      activity_type:
        | "irrigation"
        | "spraying"
        | "fertilizing"
        | "planting"
        | "harvest"
        | "scouting"
        | "soil_test"
        | "other";
      alert_severity: "info" | "warning" | "critical";
      alert_type: "weather" | "pest" | "disease" | "harvest" | "frost" | "fungal_risk" | "system" | "other";
      chat_role: "user" | "model";
      crop_status: "healthy" | "at_risk" | "needs_attention" | "harvested";
      device_platform: "ios" | "android" | "web";
      farm_member_role: "owner" | "manager" | "worker" | "viewer";
      farm_status: "active" | "inactive" | "archived";
      field_status: "active" | "fallow" | "harvested";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];

export type Farm = Tables["farms"]["Row"];
export type FarmInsert = Tables["farms"]["Insert"];
export type FarmUpdate = Tables["farms"]["Update"];

export type Field = Tables["fields"]["Row"];
export type FieldInsert = Tables["fields"]["Insert"];

export type CropType = Tables["crop_types"]["Row"];
export type Crop = Tables["crops"]["Row"];
export type CropInsert = Tables["crops"]["Insert"];
export type CropWithType = Crop & { crop_types: CropType | null };

export type FarmActivity = Tables["farm_activities"]["Row"];
export type FarmActivityInsert = Tables["farm_activities"]["Insert"];

export type Alert = Tables["alerts"]["Row"];

export type ChatConversation = Tables["chat_conversations"]["Row"];
export type ChatConversationInsert = Tables["chat_conversations"]["Insert"];
export type ChatMessage = Tables["chat_messages"]["Row"];
export type ChatMessageInsert = Tables["chat_messages"]["Insert"];

export type Profile = Tables["profiles"]["Row"];
export type ProfileUpdate = Tables["profiles"]["Update"];

export type FarmSummary = Views["farm_summary"]["Row"];
export type FarmMonthlyWeatherInsight = Views["farm_monthly_weather_insights"]["Row"];

export type ActivityType = Database["public"]["Enums"]["activity_type"];
