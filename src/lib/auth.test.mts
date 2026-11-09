import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { hashPassword } from "better-auth/crypto";
import { hasRole, isRole, ROLES } from "./roles";

process.env.DATABASE_URL = "postgresql://test:test@localhost/auth_test";
process.env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64");
process.env.BETTER_AUTH_URL = "http://localhost:3000";
const { auth } = await import("./auth");
const origin = "http://localhost:3000";
const email = "admin@example.test";
const password = "test-password-only-123";
const passwordHash = await hashPassword(password);

function fixture() {
  const users = [
    {
      id: "test-admin",
      email,
      name: "Test",
      image: "",
      role: ROLES.ADMIN,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const sessions: Record<string, unknown>[] = [];
  const accounts: Record<string, unknown>[] = [
    {
      id: "test-credential",
      accountId: "test-admin",
      userId: "test-admin",
      providerId: "credential",
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const instance = betterAuth({
    ...auth.options,
    database: memoryAdapter({
      user: users,
      session: sessions,
      account: accounts,
      verification: [],
      rateLimit: [],
    }),
    socialProviders: {
      google: {
        ...auth.options.socialProviders.google,
        enabled: true,
        clientId: "test-client",
        clientSecret: "test-client-secret",
      },
    },
  });
  async function post(
    path: string,
    body: Record<string, unknown>,
    cookie = "",
    requestOrigin = origin,
  ) {
    return instance.handler(
      new Request(`${origin}/api/auth${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: requestOrigin,
          cookie,
        },
        body: JSON.stringify(body),
      }),
    );
  }
  async function signIn() {
    const response = await post("/sign-in/email", { email, password });
    assert.equal(response.status, 200);
    const cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    assert.match(cookie, /session_token=/);
    return cookie;
  }
  return { instance, users, sessions, accounts, post, signIn };
}

async function googleCallback(
  subject: ReturnType<typeof fixture>,
  profileEmail: string,
  emailVerified: boolean,
  profileName = "Google Test",
) {
  const context = await subject.instance.$context;
  const google = context.socialProviders.find(
    (provider) => provider.id === "google",
  );
  assert.ok(google);
  google.validateAuthorizationCode = async () => ({
    accessToken: "mock-google-token",
  });
  google.getUserInfo = async () => ({
    user: {
      name: profileName,
      image: "https://lh3.googleusercontent.com/test-avatar",
      email: profileEmail,
      emailVerified,
    },
    data: {
      sub: "mock-google-id",
      email: profileEmail,
      email_verified: emailVerified,
    },
  });
  const response = await subject.post("/sign-in/social", {
    provider: "google",
    callbackURL: "/",
    errorCallbackURL: "/login?error=google",
    requestSignUp: true,
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  const state = new URL(body.url).searchParams.get("state");
  assert.ok(state);
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  return subject.instance.handler(
    new Request(
      `${origin}/api/auth/callback/google?code=mock-code&state=${encodeURIComponent(state)}`,
      { headers: { cookie } },
    ),
  );
}

test("roles fail closed for unknown roles and empty allowlists", () => {
  assert.equal(isRole("admin"), true);
  assert.equal(isRole("future-role"), false);
  assert.equal(hasRole("admin", [ROLES.ADMIN]), true);
  assert.equal(hasRole("future-role", [ROLES.ADMIN]), false);
  assert.equal(hasRole("admin", []), false);
});

test("a provisioned credential signs in and exposes its persisted role", async () => {
  const { instance, signIn } = fixture();
  const cookie = await signIn();
  const session = await instance.api.getSession({
    headers: new Headers({ cookie }),
  });
  assert.equal(session?.user.email, email);
  assert.equal(session?.user.role, ROLES.ADMIN);
});

test("wrong passwords and unknown users do not create sessions", async () => {
  const { post, sessions, users } = fixture();
  for (const body of [
    { email, password: "wrong-password" },
    { email: "unknown@example.test", password },
  ]) {
    const response = await post("/sign-in/email", body);
    assert.equal(response.status, 401);
  }
  assert.equal(sessions.length, 0);
  assert.equal(users.length, 1);
});

test("public signup cannot create a user or choose an admin role", async () => {
  const { post, users } = fixture();
  const response = await post("/sign-up/email", {
    email: "unknown@example.test",
    password,
    name: "Unknown",
    role: "admin",
  });
  assert.equal(response.status, 404);
  assert.equal(users.length, 1);
  assert.equal(auth.options.socialProviders.google.disableSignUp, true);
  assert.equal(await auth.options.databaseHooks.user.create.before(), false);
});

test("session lookup rejects missing, tampered, and expired sessions", async () => {
  const { instance, sessions, signIn } = fixture();
  assert.equal(await instance.api.getSession({ headers: new Headers() }), null);
  const cookie = await signIn();
  assert.equal(
    await instance.api.getSession({
      headers: new Headers({ cookie: `${cookie}tampered` }),
    }),
    null,
  );
  sessions[0].expiresAt = new Date(Date.now() - 1000);
  assert.equal(
    await instance.api.getSession({ headers: new Headers({ cookie }) }),
    null,
  );
});

test("role changes are effective without issuing a new session", async () => {
  const { instance, users, signIn } = fixture();
  const cookie = await signIn();
  // Simula un rol futuro persistido que todavía no está habilitado en las páginas.
  Object.assign(users[0], { role: "future-role" });
  const session = await instance.api.getSession({
    headers: new Headers({ cookie }),
  });
  assert.equal(session?.user.role, "future-role");
  assert.equal(hasRole(session?.user.role ?? "", [ROLES.ADMIN]), false);
});

test("signout revokes the persisted session", async () => {
  const { instance, post, signIn } = fixture();
  const cookie = await signIn();
  assert.equal((await post("/sign-out", {}, cookie)).status, 200);
  assert.equal(
    await instance.api.getSession({ headers: new Headers({ cookie }) }),
    null,
  );
});

test("clients cannot change their role through the user update endpoint", async () => {
  const { post, users, signIn } = fixture();
  const cookie = await signIn();
  await post("/update-user", { name: "Updated", role: "future-role" }, cookie);
  assert.equal(users[0].role, ROLES.ADMIN);
});

test("password attempts are rate limited across requests", async () => {
  const { post } = fixture();
  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal(
      (await post("/sign-in/email", { email, password: "wrong" })).status,
      401,
    );
  }
  assert.equal(
    (await post("/sign-in/email", { email, password: "wrong" })).status,
    429,
  );
});

test("cross-origin sign-in requests are rejected", async () => {
  const { post, sessions } = fixture();
  const response = await post(
    "/sign-in/email",
    { email, password },
    "",
    "https://untrusted.example",
  );
  assert.equal(response.status, 403);
  assert.equal(sessions.length, 0);
});

test("Google authorization uses the configured callback and OAuth state", async () => {
  const { post } = fixture();
  const response = await post("/sign-in/social", {
    provider: "google",
    callbackURL: "/",
    errorCallbackURL: "/login?error=google",
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  const url = new URL(body.url);
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    `${origin}/api/auth/callback/google`,
  );
  assert.ok(url.searchParams.get("state"));
  assert.ok(url.searchParams.get("code_challenge"));
});

test("verified Google identity links to a provisioned account and preserves its role", async () => {
  const subject = fixture();
  const response = await googleCallback(subject, email, true);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/");
  assert.equal(subject.users.length, 1);
  assert.equal(subject.sessions.length, 1);
  assert.equal(subject.users[0].role, ROLES.ADMIN);
  assert.equal(subject.users[0].name, "Google Test");
  assert.equal(
    subject.users[0].image,
    "https://lh3.googleusercontent.com/test-avatar",
  );
  assert.ok(
    subject.accounts.some(
      (account) =>
        account.providerId === "google" && account.userId === "test-admin",
    ),
  );
});

test("Google cannot register an unknown user, even with an explicit signup request", async () => {
  const subject = fixture();
  const response = await googleCallback(subject, "unknown@example.test", true);
  assert.equal(response.status, 302);
  assert.ok(response.headers.get("location")?.includes("/login?error="));
  assert.equal(subject.users.length, 1);
  assert.equal(subject.sessions.length, 0);
  assert.equal(subject.accounts.length, 1);
});

test("subsequent Google sign-ins refresh the display name and preserve the role", async () => {
  const subject = fixture();
  await googleCallback(subject, email, true);
  const response = await googleCallback(
    subject,
    email,
    true,
    "Updated Google Name",
  );
  assert.equal(response.status, 302);
  assert.equal(subject.users.length, 1);
  assert.equal(subject.users[0].name, "Updated Google Name");
  assert.equal(subject.users[0].role, ROLES.ADMIN);
});

test("unverified Google email cannot link to a provisioned account", async () => {
  const subject = fixture();
  const response = await googleCallback(subject, email, false);
  assert.equal(response.status, 302);
  assert.ok(response.headers.get("location")?.includes("/login?error="));
  assert.equal(subject.sessions.length, 0);
  assert.equal(subject.accounts.length, 1);
  assert.equal(subject.users[0].name, "Test");
  assert.equal(subject.users[0].image, "");
});
