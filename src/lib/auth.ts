import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";

if (
  !process.env.BETTER_AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET.length < 32
) {
  throw new Error(
    "Configurá BETTER_AUTH_SECRET con al menos 32 caracteres aleatorios.",
  );
}
if (!process.env.BETTER_AUTH_URL) {
  throw new Error("Falta la variable de entorno BETTER_AUTH_URL.");
}

export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  appName: "Home Expenses",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: googleEnabled,
      disableSignUp: true,
      prompt: "select_account",
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, input: false },
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      // Solo Google con email verificado puede vincularse a una cuenta precargada.
      trustedProviders: [],
      requireLocalEmailVerified: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: false },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  disabledPaths: ["/sign-up/email"],
  databaseHooks: {
    user: {
      create: {
        before: async () => false,
      },
    },
  },
  onAPIError: { errorURL: "/login" },
});
