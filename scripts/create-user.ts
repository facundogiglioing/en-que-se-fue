import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { isRole, ROLES } from "../src/lib/roles";
import { account, user } from "../src/lib/schema";

async function main() {
  const [rawEmail, name, role = ROLES.ADMIN] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name?.trim()) {
    throw new Error(
      'Uso: yarn auth:create-user "email" "nombre" [rol]. Enviá la contraseña por stdin.',
    );
  }
  if (!isRole(role)) {
    throw new Error(
      `Rol inválido. Roles disponibles: ${Object.values(ROLES).join(", ")}.`,
    );
  }
  if (process.stdin.isTTY) {
    throw new Error(
      "La contraseña se recibe por stdin, no como argumento ni en texto visible. Consultá el README.",
    );
  }
  const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
  if (password.length < 12 || password.length > 128) {
    throw new Error("La contraseña debe tener entre 12 y 128 caracteres.");
  }
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  if (existing) throw new Error("Ya existe un usuario con ese email.");

  const id = randomUUID();
  const hashedPassword = await hashPassword(password);
  await db.batch([
    db.insert(user).values({
      id,
      email,
      name: name.trim(),
      role,
    }),
    db.insert(account).values({
      id: randomUUID(),
      userId: id,
      providerId: "credential",
      accountId: id,
      password: hashedPassword,
    }),
  ]);
  console.log("Usuario creado correctamente.");
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "No se pudo crear el usuario.",
  );
  process.exitCode = 1;
});
