import { db } from "./client";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const DEMO_EMAIL = "demo@shockstack.dev";
const DEMO_PASSWORD = "password123";
const DEMO_NAME = "Demo User";

async function seed() {
  console.log("checking for existing demo user...");

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log("demo user already exists, skipping");
    process.exit(0);
  }

  console.log("seeding demo user...");

  // use better auth signup to hash password properly
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:4321";
  const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: DEMO_NAME,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("failed to seed demo user:", body);
    process.exit(1);
  }

  console.log(`demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  process.exit(0);
}

seed().catch((e) => {
  console.error("seed error:", e);
  process.exit(1);
});
