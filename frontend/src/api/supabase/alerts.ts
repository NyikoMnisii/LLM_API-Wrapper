import { supabase } from "../../lib/supabase";
import type { Alert } from "./types";

export async function fetchAlerts(farmId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// alerts are system/AI-generated only — the alerts table has no client INSERT
// policy (see supabase/migrations). The only client-side mutation allowed is
// marking one read.
export async function markAlertRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("alerts")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchUnreadAlertCount(farmId: string): Promise<number> {
  const { count, error } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("farm_id", farmId)
    .eq("is_read", false);
  if (error) throw error;
  return count ?? 0;
}
