import { useCallback, useEffect, useState } from "react";
import { fetchFields } from "../api/supabase/fields";
import type { Field } from "../api/supabase/types";

export function useFields(farmId: string | undefined) {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!farmId) {
      setFields([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setFields(await fetchFields(farmId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load fields right now.");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { fields, loading, error, refresh };
}
