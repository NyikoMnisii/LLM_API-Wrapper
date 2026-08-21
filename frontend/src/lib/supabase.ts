import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import type { Database } from "../api/supabase/types";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — set them in frontend/.env"
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Supabase's token auto-refresh timer runs on an interval regardless of
// whether the app is in the foreground; on native, tie it to AppState so it
// doesn't keep refreshing a token nobody's using while backgrounded.
//
// Native only — react-native-web's AppState shim doesn't reliably mirror the
// native lifecycle (per Supabase's own docs, this pattern "is not
// web-compatible"). Wiring it up on web risked an early/spurious non-"active"
// event calling stopAutoRefresh() and permanently canceling the refresh timer
// that `autoRefreshToken: true` had already started on its own — silently
// breaking auth after the first access token expired, with every request
// then failing 401 until a manual sign-out/in. Web's own refresh handling
// (driven by `autoRefreshToken: true` alone) needs no extra wiring here.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
