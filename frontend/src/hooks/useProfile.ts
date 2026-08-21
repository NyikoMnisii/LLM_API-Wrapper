import { useCallback, useEffect, useState } from "react";
import { fetchMyProfile, updateProfile } from "../api/supabase/profiles";
import type { Profile, ProfileUpdate } from "../api/supabase/types";
import { useAuth } from "./useAuth";

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProfile(await fetchMyProfile(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (patch: ProfileUpdate) => {
      if (!userId) return;
      const updated = await updateProfile(userId, patch);
      setProfile(updated);
    },
    [userId]
  );

  return { profile, loading, refresh, save };
}
