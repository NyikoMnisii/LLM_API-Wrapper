import { supabase } from "../../lib/supabase";
import type { FarmActivity, FarmActivityInsert } from "./types";

export async function fetchActivities(farmId: string): Promise<FarmActivity[]> {
  const { data, error } = await supabase
    .from("farm_activities")
    .select("*")
    .eq("farm_id", farmId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createActivity(input: FarmActivityInsert): Promise<FarmActivity> {
  const { data, error } = await supabase.from("farm_activities").insert(input).select().single();
  if (error) throw error;
  return data;
}
