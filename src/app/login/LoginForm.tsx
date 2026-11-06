"use client";

import { useState } from "react";
import { Button } from "@/components/base/Button";
import { authClient } from "@/lib/auth-client";

export default function LoginForm({
  googleEnabled,
  oauthError,
}: {
  googleEnabled: boolean;
  oauthError: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(
    oauthError
      ? "No pudimos iniciar sesión con Google. Verificá que tu cuenta esté autorizada e intentá nuevamente."
      : "",
  );

  async function signInEmail(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email")).trim().toLowerCase(),
        password: String(data.get("password")),
      });
      if (result.error) {
        setError(
          result.error.status === 429
            ? "Demasiados intentos. Esperá un minuto antes de volver a intentar."
            : result.error.status >= 500
              ? "No pudimos conectar con el servicio de acceso. Intentá nuevamente."
              : "Email o contraseña incorrectos.",
        );
        return;
      }
      window.location.assign("/");
    } catch (error) {
      console.error("Error de conexión al iniciar sesión.", error);
      setError("No pudimos conectar. Revisá tu conexión e intentá nuevamente.");
    } finally {
      setPending(false);
    }
  }

  async function signInGoogle() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/login?error=google",
      });
      if (result.error) {
        setError("No pudimos iniciar sesión con Google. Intentá nuevamente.");
        setPending(false);
      }
    } catch (error) {
      console.error("Error de conexión con Google.", error);
      setError("No pudimos conectar con Google. Intentá nuevamente.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger p-3 text-sm text-danger-text"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={signInGoogle}
        disabled={pending || !googleEnabled}
        className="flex w-full items-center justify-center rounded-lg border border-border-primary px-4 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continuar con Google
      </button>
      {!googleEnabled && (
        <p className="text-xs text-slate-500">
          El acceso con Google todavía no está configurado.
        </p>
      )}
      <div className="flex items-center gap-3 text-xxs font-bold uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />o con tu email
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form onSubmit={signInEmail} className="space-y-4" aria-busy={pending}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            disabled={pending}
            className="w-full rounded-lg border border-border-primary px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            disabled={pending}
            className="w-full rounded-lg border border-border-primary px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
