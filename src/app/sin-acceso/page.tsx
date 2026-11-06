import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { getSession } from "@/lib/auth-session";

export default async function AccessDeniedPage() {
  if (!(await getSession())) redirect("/login");
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center text-slate-900">
      <h1 className="text-2xl font-bold">Sin acceso</h1>
      <p className="text-sm text-slate-500">
        Tu rol no tiene permiso para ingresar a esta página.
      </p>
      <SignOutButton compact />
    </div>
  );
}
