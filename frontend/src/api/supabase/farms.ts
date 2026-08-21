import { supabase } from "../../lib/supabase";
import type { Farm, FarmInsert, FarmMonthlyWeatherInsight, FarmSummary, FarmUpdate } from "./types";

export async function fetchMyFarms(): Promise<Farm[]> {
  const { data, error } = await supabase.from("farms").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createFarm(input: FarmInsert): Promise<Farm> {
  const { data, error } = await supabase.from("farms").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateFarm(id: string, patch: FarmUpdate): Promise<Farm> {
  const { data, error } = await supabase.from("farms").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function fetchFarmSummary(farmId: string): Promise<FarmSummary | null> {
  const { data, error } = await supabase.from("farm_summary").select("*").eq("farm_id", farmId).maybeSingle();
  if (error) throw error;
  return data;
}

// Current calendar month's aggregate — matches the "this month" framing on
// the My Farm insights tiles.
export async function fetchFarmMonthlyInsights(farmId: string): Promise<FarmMonthlyWeatherInsight | null> {
  const now = new Date();
  // Built from local Y/M directly (no toISOString round-trip) so it can't
  // shift a day across the UTC boundary near midnight in timezones west of UTC.
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const { data, error } = await supabase
    .from("farm_monthly_weather_insights")
    .select("*")
    .eq("farm_id", farmId)
    .eq("month", monthKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}
