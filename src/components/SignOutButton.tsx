"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError("No se pudo cerrar sesión. Reintentá.");
        return;
      }
      window.location.assign("/login");
    } catch (error) {
      console.error("Error al cerrar sesión.", error);
      setError("No se pudo cerrar sesión. Revisá tu conexión.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={
        compact ? "relative flex flex-1" : "relative flex justify-center"
      }
    >
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className={`flex items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 ${compact ? "flex-1 flex-col gap-1 px-1 py-2" : "rounded-lg p-3"}`}
      >
        <LogOut size={20} />
        {compact && (
          <span className="text-xxs font-bold uppercase tracking-wide leading-none">
            Salir
          </span>
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-lg bg-danger p-2 text-xs text-danger-text"
        >
          {error}
        </p>
      )}
    </div>
  );
}
