import { useCallback, useEffect, useState } from "react";
import { fetchFarmMonthlyInsights, fetchFarmSummary } from "../api/supabase/farms";
import type { FarmMonthlyWeatherInsight, FarmSummary } from "../api/supabase/types";

export function useFarmSummary(farmId: string | undefined) {
  const [summary, setSummary] = useState<FarmSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!farmId) {
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setSummary(await fetchFarmSummary(farmId));
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, refresh };
}

export function useFarmInsights(farmId: string | undefined) {
  const [insights, setInsights] = useState<FarmMonthlyWeatherInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setInsights(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchFarmMonthlyInsights(farmId)
      .then((row) => {
        if (!cancelled) setInsights(row);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [farmId]);

  return { insights, loading };
}
