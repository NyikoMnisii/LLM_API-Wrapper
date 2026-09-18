import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { fetchMyFarms } from "../api/supabase/farms";
import type { Farm } from "../api/supabase/types";
import { useAuth } from "./useAuth";

// Single-farm-per-user MVP assumption: the schema supports multi-farm
// membership via farm_members, but there's no farm-switcher UI anywhere in
// this app, so this just takes the first farm a user owns. Revisit if
// multi-farm ever gets a real UI.
type FarmContextValue = {
  farm: Farm | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasFarm: boolean;
};

const FarmContext = createContext<FarmContextValue | null>(null);

// A shared context (rather than a plain hook every screen calls
// independently) so that creating a farm on one screen (onboarding) is
// immediately visible to every other consumer - most importantly the root
// layout's Stack.Protected guard, which decides whether to show onboarding
// or the tabs. With independent per-call state, onboarding's own refresh()
// never reached the layout's copy, so the guard never flipped and the app
// looked stuck on a spinner even though the farm was already saved.
export function FarmProvider({ children }: PropsWithChildren) {
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

  const value: FarmContextValue = { farm, loading, error, refresh, hasFarm: !loading && farm !== null };
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within FarmProvider");
  return ctx;
}
