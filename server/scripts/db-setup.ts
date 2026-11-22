// creates the database (if it doesn't exist yet) and loads the tables and demo data
// run it with: npm run db:setup -w server
import "dotenv/config";
import { setupDatabase } from "../src/setup-database.js";

try {
  await setupDatabase(process.env.DATABASE_URL ?? "postgres://localhost:5432/techsupport_hub");
  console.log("database is ready");
} catch (err) {
  if ((err as { code?: string }).code === "ECONNREFUSED") {
    console.error("couldn't reach PostgreSQL. is Postgres.app open and running?");
  } else {
    console.error(err);
  }
  process.exit(1);
}
