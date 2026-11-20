// creates the database (if it doesn't exist yet) and loads the tables and demo data
// run it with: npm run db:setup -w server
import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const databaseUrl = new URL(
  process.env.DATABASE_URL ?? "postgres://localhost:5432/techsupport_hub",
);
const databaseName = databaseUrl.pathname.slice(1);

async function createDatabaseIfMissing() {
  // you can't create a database while connected to it, so connect to the built-in one first
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const existing = await admin.query("select 1 from pg_database where datname = $1", [
      databaseName,
    ]);
    if (existing.rowCount === 0) {
      await admin.query(`create database ${admin.escapeIdentifier(databaseName)}`);
      console.log(`created database "${databaseName}"`);
    } else {
      console.log(`database "${databaseName}" already exists`);
    }
  } finally {
    await admin.end();
  }
}

async function runSqlFile(client: pg.Client, file: string) {
  const sql = await readFile(new URL(`../db/${file}`, import.meta.url), "utf8");
  await client.query(sql);
  console.log(`ran db/${file}`);
}

try {
  await createDatabaseIfMissing();
  const client = new pg.Client({ connectionString: databaseUrl.toString() });
  await client.connect();
  try {
    await runSqlFile(client, "schema.sql");
    await runSqlFile(client, "seed.sql");
  } finally {
    await client.end();
  }
  console.log("database is ready");
} catch (err) {
  const code = (err as { code?: string }).code;
  if (code === "ECONNREFUSED") {
    console.error("couldn't reach PostgreSQL. is Postgres.app open and running?");
  } else {
    console.error(err);
  }
  process.exit(1);
}
