import { supabase } from "../../lib/supabase";
import type { Field, FieldInsert } from "./types";

export async function fetchFields(farmId: string): Promise<Field[]> {
  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createField(input: FieldInsert): Promise<Field> {
  const { data, error } = await supabase.from("fields").insert(input).select().single();
  if (error) throw error;
  return data;
}
