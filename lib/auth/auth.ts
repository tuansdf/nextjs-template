import { env } from "@/lib/config/env.server";
import { db } from "@/lib/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: env.BASE_URL,
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
    refreshCache: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    storage: "memory",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  appName: "nt",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), nextCookies()],
});
