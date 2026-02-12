"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/app/api/supabase/client";

type DebugStep = {
  time: string;
  step: string;
  detail: string;
  data?: unknown;
};

export default function AuthDebugPanel() {
  const [clientAuth, setClientAuth] = useState<{
    user: { id: string; email?: string } | null;
    error: string | null;
    loading: boolean;
  }>({ user: null, error: null, loading: true });
  const [clientCookies, setClientCookies] = useState<string>("");
  const [serverDebug, setServerDebug] = useState<Record<string, unknown> | null>(null);
  const [favoritesResult, setFavoritesResult] = useState<{
    ok: boolean;
    status: number;
    error?: string;
    body?: unknown;
  } | null>(null);
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [running, setRunning] = useState(false);

  const addStep = useCallback((step: string, detail: string, data?: unknown) => {
    setSteps((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        step,
        detail,
        data,
      },
    ]);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      setClientAuth({
        user: user ? { id: user.id, email: user.email ?? undefined } : null,
        error: error?.message ?? null,
        loading: false,
      });
    });
  }, []);

  useEffect(() => {
    setClientCookies(document.cookie || "(no cookies visible - HttpOnly cookies hidden from JS)");
  }, [steps]);

  const runFavoritesDebug = async () => {
    setRunning(true);
    setSteps([]);
    setFavoritesResult(null);
    setServerDebug(null);

    addStep("1. Before fetch", "Client cookies (document.cookie)", {
      cookieString: document.cookie || "(empty)",
      cookieCount: document.cookie ? document.cookie.split(";").length : 0,
    });

    try {
      addStep("2. Fetch /api/debug/auth", "Requesting server-side auth state...", { credentials: "include" });
      const debugRes = await fetch("/api/debug/auth", { credentials: "include" });
      const debugData = await debugRes.json();
      setServerDebug(debugData);
      addStep("3. Server debug response", `Status ${debugRes.status}`, debugData);

      addStep("4. Fetch /api/favorites", "Requesting favorites...", { credentials: "include" });
      const favRes = await fetch("/api/favorites", { credentials: "include" });
      let favBody: unknown;
      try {
        favBody = await favRes.json();
      } catch {
        favBody = "(non-JSON response)";
      }
      setFavoritesResult({
        ok: favRes.ok,
        status: favRes.status,
        error: !favRes.ok && typeof favBody === "object" && favBody && "error" in favBody ? String((favBody as { error: unknown }).error) : undefined,
        body: favBody,
      });
      addStep("5. Favorites response", `Status ${favRes.status} ${favRes.ok ? "OK" : "FAILED"}`, {
        ok: favRes.ok,
        status: favRes.status,
        body: favBody,
      });
    } catch (err) {
      addStep("ERROR", err instanceof Error ? err.message : String(err), { error: err });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 text-left">
      <h2 className="text-lg font-bold mb-3">Auth & Cookie Debug</h2>

      <div className="grid gap-4 mb-4 text-sm">
        <div>
          <strong>Client auth session:</strong>
          {clientAuth.loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : clientAuth.error ? (
            <p className="text-red-600">{clientAuth.error}</p>
          ) : clientAuth.user ? (
            <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-auto">
              {JSON.stringify(clientAuth.user, null, 2)}
            </pre>
          ) : (
            <p className="text-amber-600">No user (not signed in)</p>
          )}
        </div>

        <div>
          <strong>Client cookies (document.cookie):</strong>
          <p className="text-xs text-gray-500 mt-1">
            Note: HttpOnly cookies are not visible to JavaScript
          </p>
          <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-auto text-xs max-h-24">
            {clientCookies || "(empty)"}
          </pre>
        </div>

        {serverDebug && (
          <div>
            <strong>Server sees (from /api/debug/auth):</strong>
            <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-auto text-xs">
              {JSON.stringify(serverDebug, null, 2)}
            </pre>
          </div>
        )}

        {favoritesResult && (
          <div>
            <strong>Favorites API result:</strong>
            <pre
              className={`mt-1 p-2 rounded overflow-auto text-xs ${
                favoritesResult.ok ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              {JSON.stringify(favoritesResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={runFavoritesDebug}
        disabled={running}
        className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
      >
        {running ? "Running..." : "Run Favorites Debug"}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Click to: fetch /api/debug/auth, then /api/favorites. Shows exactly what the server sees.
      </p>

      {steps.length > 0 && (
        <div className="mt-4">
          <strong>Step log:</strong>
          <ol className="mt-2 space-y-1 text-xs">
            {steps.map((s, i) => (
              <li key={i} className="p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">[{s.time}]</span> {s.step}: {s.detail}
                {s.data != null ? (
                  <pre className="mt-1 overflow-auto max-h-20 text-[10px]">
                    {JSON.stringify(s.data, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
