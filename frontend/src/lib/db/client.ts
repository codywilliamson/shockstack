import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  import.meta.env.DATABASE_URL || "postgres://localhost:5432/shockstack";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
