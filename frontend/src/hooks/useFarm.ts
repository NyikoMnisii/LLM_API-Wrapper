import { useCallback, useEffect, useState } from "react";
import { fetchMyFarms } from "../api/supabase/farms";
import type { Farm } from "../api/supabase/types";
import { useAuth } from "./useAuth";

// Single-farm-per-user MVP assumption: the schema supports multi-farm
// membership via farm_members, but there's no farm-switcher UI anywhere in
// this app, so this hook just takes the first farm a user owns. Revisit if
// multi-farm ever gets a real UI.
export function useFarm() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setFarm(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const farms = await fetchMyFarms();
      setFarm(farms[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your farm right now.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { farm, loading, error, refresh, hasFarm: !loading && farm !== null };
}
