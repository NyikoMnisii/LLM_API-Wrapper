import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import type { ApiErrorBody } from "./types";

/**
 * On a physical device, "localhost" points at the phone, not your dev machine.
 * Set EXPO_PUBLIC_API_BASE_URL to your machine's LAN IP (e.g. http://192.168.1.20:8000)
 * in frontend/.env when testing on a real device. Android emulators use 10.0.2.2 to
 * reach the host machine's localhost.
 */
const DEFAULT_BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://localhost:8000",
});

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function doFetch(url: string, init: RequestInit | undefined, accessToken: string | undefined): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${API_PREFIX}${path}`;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let response: Response;
  try {
    response = await doFetch(url, init, session?.access_token);
  } catch {
    throw new ApiError("Couldn't reach AgriLite AI. Check your connection and try again.", 0);
  }

  // A 401 usually means the access token expired without refreshing in time
  // (e.g. a long-idle tab). Force one refresh and retry before giving up,
  // rather than surfacing an error the user would just fix by reloading.
  if (response.status === 401 && session) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session) {
      try {
        response = await doFetch(url, init, refreshed.session.access_token);
      } catch {
        throw new ApiError("Couldn't reach AgriLite AI. Check your connection and try again.", 0);
      }
    }
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body?.error) detail = body.error;
    } catch {
      // response body wasn't JSON; keep the generic message
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
