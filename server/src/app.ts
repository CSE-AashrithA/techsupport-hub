import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { databaseIsUp } from "./db.js";
import { ticketsRouter } from "./routes/tickets.js";

/**
 * Builds the Express app without starting it, so tests can send
 * requests to it directly.
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  // Lets hosting platforms (and us) check that the API is up.
  app.get("/api/health", async (_req, res) => {
    res.json({ status: "ok", database: (await databaseIsUp()) ? "up" : "down" });
  });

  app.use("/api/tickets", ticketsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express 5 sends errors thrown in async route handlers here.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // body that isn't valid JSON
    if ((err as { type?: string }).type === "entity.parse.failed") {
      res.status(400).json({ error: "Request body must be valid JSON" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
