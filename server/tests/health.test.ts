import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { pool } from "../src/db.js";

afterAll(async () => {
  await pool.end();
});

describe("GET /api/health", () => {
  it("reports that the API is up, plus whether the database answers", async () => {
    const res = await request(createApp()).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(["up", "down"]).toContain(res.body.database);
  });
});

describe("unknown routes", () => {
  it("return a JSON 404", async () => {
    const res = await request(createApp()).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});
