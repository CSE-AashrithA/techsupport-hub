import pg from "pg";

// one shared pool of connections for the whole api.
// it only connects when the first query runs, so tests can load the app without a database.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://localhost:5432/techsupport_hub",
  connectionTimeoutMillis: 2000,
});

// true if the database answers a trivial query
export async function databaseIsUp() {
  try {
    await pool.query("select 1");
    return true;
  } catch {
    return false;
  }
}
