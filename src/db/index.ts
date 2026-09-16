import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.example) — a free Neon project works."
  );
}

const globalForDb = globalThis as unknown as { __matchpointSql?: ReturnType<typeof postgres> };

const sql = globalForDb.__matchpointSql ?? postgres(connectionString, { max: 1 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__matchpointSql = sql;
}

let bootstrapped = false;

async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  await sql`
    CREATE TABLE IF NOT EXISTS api_cache (
      key TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS fun_facts (
      id SERIAL PRIMARY KEY,
      subject_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      fact TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_fun_facts_subject ON fun_facts(subject_type, subject)`;
}

const readyPromise = bootstrap();

export async function ensureReady() {
  await readyPromise;
}

export const db = drizzle(sql, { schema });
