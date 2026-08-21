import { useCallback, useEffect, useState } from "react";
import { fetchActivities } from "../api/supabase/activities";
import type { FarmActivity } from "../api/supabase/types";

export function useFarmActivities(farmId: string | undefined) {
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!farmId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setActivities(await fetchActivities(farmId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load activity right now.");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activities, loading, error, refresh };
}
