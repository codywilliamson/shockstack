import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// aspire passes ADO.NET format, postgres.js needs a URL
function parseConnectionString(raw: string): string {
  if (raw.startsWith("postgres://") || raw.startsWith("postgresql://"))
    return raw;

  const params = Object.fromEntries(
    raw.split(";").map((p) => {
      const [k, ...v] = p.split("=");
      return [k?.trim().toLowerCase(), v.join("=").trim()];
    }),
  );

  const host = params.host || "localhost";
  const port = params.port || "5432";
  const user = encodeURIComponent(params.username || params.user || "postgres");
  const pass = encodeURIComponent(params.password || "");
  const db = params.database || "shockstack";

  return `postgres://${user}:${pass}@${host}:${port}/${db}`;
}

const raw =
  import.meta.env.DATABASE_URL ||
  import.meta.env.ConnectionStrings__shockstack ||
  "postgres://localhost:5432/shockstack";

const connectionString = parseConnectionString(raw);
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
