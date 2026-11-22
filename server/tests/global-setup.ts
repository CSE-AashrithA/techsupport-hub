import pg from "pg";
import { setupDatabase } from "../src/setup-database.js";

// runs once before all tests: builds the test database and empties the ticket tables
export default async function () {
  const url = process.env.DATABASE_URL!;
  try {
    await setupDatabase(url, () => {});
  } catch (err) {
    if ((err as { code?: string }).code === "ECONNREFUSED") {
      throw new Error("the tests need PostgreSQL running. open Postgres.app and try again.");
    }
    throw err;
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("truncate ticket_comments, tickets restart identity");
  } finally {
    await client.end();
  }
}
