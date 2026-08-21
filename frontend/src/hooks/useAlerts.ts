import { useCallback, useEffect, useState } from "react";
import { fetchAlerts, fetchUnreadAlertCount, markAlertRead } from "../api/supabase/alerts";
import type { Alert } from "../api/supabase/types";

export function useAlerts(farmId: string | undefined) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!farmId) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAlerts(await fetchAlerts(farmId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load alerts right now.");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(
    async (id: string) => {
      await markAlertRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true, read_at: new Date().toISOString() } : a)));
    },
    []
  );

  return { alerts, loading, error, refresh, markRead };
}

// Lightweight count-only hook for the two badge usages (Home, My Farm) —
// avoids fetching full alert rows just to show a number.
export function useUnreadAlertCount(farmId: string | undefined) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!farmId) {
      setCount(0);
      return;
    }
    try {
      setCount(await fetchUnreadAlertCount(farmId));
    } catch {
      // badge is non-critical UI — silently keep the last known count on failure
    }
  }, [farmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
