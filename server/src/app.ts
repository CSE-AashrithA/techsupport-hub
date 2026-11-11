import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

/**
 * Builds the Express app without starting it, so tests can send
 * requests to it directly.
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  // Lets hosting platforms (and us) check that the API is up.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express 5 sends errors thrown in async route handlers here.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
