import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** localStorage key where the token is cached. */
const STORAGE_KEY = "hm_google_token";

/**
 * How many seconds before the token's actual expiry we treat it as expired.
 * Default: 5 minutes (300 s). Increase if you see stale-token errors.
 */
const EXPIRY_BUFFER_SECONDS = 300;

/** Google OAuth2 scopes required for Drive + Docs read access. */
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents.readonly",
].join(" ");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoredToken {
  accessToken: string;
  /** Unix timestamp (ms) when the token expires. */
  expiresAt: number;
}

export type AuthState = "checking" | "idle" | "ready" | "error";

export interface UseGoogleAuthReturn {
  /** Call to open the Google sign-in popup. */
  login: () => void;
  /** Current access token, available when authState === "ready". */
  accessToken: string | null;
  authState: AuthState;
  authError: string;
  /** Clear the stored token and reset to idle (sign out). */
  clearToken: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredToken;
    const bufferMs = EXPIRY_BUFFER_SECONDS * 1000;
    if (Date.now() >= stored.expiresAt - bufferMs) return null; // expired / near-expired
    return stored;
  } catch {
    return null;
  }
}

function saveToken(accessToken: string, expiresInSeconds: number): void {
  const stored: StoredToken = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function removeToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [authError, setAuthError] = useState("");

  // On mount: restore a valid cached token automatically.
  useEffect(() => {
    const stored = loadStoredToken();
    if (stored) {
      setAccessToken(stored.accessToken);
      setAuthState("ready");
    } else {
      setAuthState("idle");
    }
  }, []);

  const login = useGoogleLogin({
    scope: SCOPES,
    onSuccess: (response) => {
      const token = response.access_token;
      const expiresIn = response.expires_in ?? 3600;
      saveToken(token, expiresIn);
      setAccessToken(token);
      setAuthError("");
      setAuthState("ready");
    },
    onError: (err) => {
      setAuthError(err.error_description ?? "Google sign-in failed");
      setAuthState("error");
    },
  });

  const clearToken = () => {
    removeToken();
    setAccessToken(null);
    setAuthState("idle");
  };

  return { login, accessToken, authState, authError, clearToken };
}
