import { supabase } from "../../lib/supabase";
import type { Crop, CropInsert, CropType, CropWithType } from "./types";

export async function fetchCrops(farmId: string): Promise<CropWithType[]> {
  const { data, error } = await supabase
    .from("crops")
    .select("*, crop_types(*)")
    .eq("farm_id", farmId)
    .order("planted_on", { ascending: false });
  if (error) throw error;
  return data as CropWithType[];
}

export async function fetchCropTypes(): Promise<CropType[]> {
  const { data, error } = await supabase.from("crop_types").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data;
}

// farm_id is deliberately not part of CropInsert — it's synced server-side
// from field_id via trigger (see supabase/migrations), never set client-side.
export async function createCrop(input: CropInsert): Promise<Crop> {
  const { data, error } = await supabase.from("crops").insert(input).select().single();
  if (error) throw error;
  return data;
}
