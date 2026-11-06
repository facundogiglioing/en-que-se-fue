import Image from "next/image";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 p-5 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-border-primary bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/assets/logo-md.png"
            alt="Home Expenses"
            width={56}
            height={56}
            priority
          />
          <p className="mt-4 text-xxs font-bold uppercase tracking-[0.2em] text-slate-400">
            Home Expenses
          </p>
          <h1 className="mt-2 text-2xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-500">
            Tu hogar, tus cuentas, en un solo lugar.
          </p>
        </div>
        <LoginForm googleEnabled={googleEnabled} oauthError={Boolean(error)} />
        <p className="mt-6 text-center text-xs text-slate-400">
          Acceso exclusivo para usuarios autorizados.
        </p>
      </section>
    </div>
  );
}
