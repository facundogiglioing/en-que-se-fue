import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import { hasRole, type Role } from "./roles";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireRoles(allowedRoles: readonly Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasRole(session.user.role, allowedRoles)) redirect("/sin-acceso");
  return session.user;
}
