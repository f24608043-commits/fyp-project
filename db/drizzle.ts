import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres";

// Disable prefetch/prepared statements for compatibility with Supabase connection pooler
const client = postgres(connectionString, {
  prepare: false,
  max: 5, // Reduced connection pool size to prevent exhaustion
  idle_timeout: 20,
  connect_timeout: 60, // Increased to 60 seconds for Tokyo region latency
  max_lifetime: 60 * 30, // 30 minutes
});
const db = drizzle(client, { schema });

export default db;
