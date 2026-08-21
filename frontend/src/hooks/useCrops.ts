import { useCallback, useEffect, useState } from "react";
import { fetchCropTypes, fetchCrops } from "../api/supabase/crops";
import type { CropType, CropWithType } from "../api/supabase/types";

export function useCrops(farmId: string | undefined) {
  const [crops, setCrops] = useState<CropWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!farmId) {
      setCrops([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCrops(await fetchCrops(farmId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load crops right now.");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { crops, loading, error, refresh };
}

// crop_types is a small global lookup table (Maize, Tomatoes, ...) — same
// shape hook so create-forms can list it the same way as everything else.
export function useCropTypes() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCropTypes()
      .then((types) => {
        if (!cancelled) setCropTypes(types);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { cropTypes, loading };
}
