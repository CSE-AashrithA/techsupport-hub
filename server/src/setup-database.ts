import { readFile } from "node:fs/promises";
import pg from "pg";

// creates the database if it doesn't exist yet, then loads the tables and demo users.
// used by `npm run db:setup` and by the test setup, so both build the database the same way.
export async function setupDatabase(
  connectionString: string,
  log: (message: string) => void = console.log,
) {
  const url = new URL(connectionString);
  const name = decodeURIComponent(url.pathname.slice(1));

  // you can't create a database while connected to it, so connect to the built-in one first
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const existing = await admin.query("select 1 from pg_database where datname = $1", [name]);
    if (existing.rowCount === 0) {
      await admin.query(`create database ${admin.escapeIdentifier(name)}`);
      log(`created database "${name}"`);
    } else {
      log(`database "${name}" already exists`);
    }
  } finally {
    await admin.end();
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    for (const file of ["schema.sql", "seed.sql"]) {
      const sql = await readFile(new URL(`../db/${file}`, import.meta.url), "utf8");
      await client.query(sql);
      log(`ran db/${file}`);
    }
  } finally {
    await client.end();
  }
}
