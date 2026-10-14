import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  // Solo hace falta para migrate/studio; generate funciona sin conexión.
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
