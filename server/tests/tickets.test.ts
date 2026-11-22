import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { pool } from "../src/db.js";

const app = createApp();

afterAll(async () => {
  await pool.end();
});

const goodTicket = {
  title: "Wi-Fi keeps dropping",
  description: "Since this morning, everyone in Lab B loses connection every few minutes.",
  category: "network",
  priority: "high",
};

describe("POST /api/tickets", () => {
  it("creates a ticket and sends it back", async () => {
    const res = await request(app).post("/api/tickets").send(goodTicket);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: goodTicket.title,
      category: "network",
      priority: "high",
      status: "open",
      requesterName: "Demo Employee",
      assigneeName: null,
      resolvedAt: null,
    });
    expect(typeof res.body.id).toBe("number");
  });

  it("actually saves the ticket in the database", async () => {
    const res = await request(app).post("/api/tickets").send(goodTicket);

    const { rows } = await pool.query("select title, status from tickets where id = $1", [
      res.body.id,
    ]);
    expect(rows[0]).toEqual({ title: goodTicket.title, status: "open" });
  });

  it("uses medium priority when none is given", async () => {
    const { priority, ...withoutPriority } = goodTicket;
    const res = await request(app).post("/api/tickets").send(withoutPriority);

    expect(res.status).toBe(201);
    expect(res.body.priority).toBe("medium");
  });

  it("trims extra spaces around the title", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .send({ ...goodTicket, title: "   Printer jammed   " });

    expect(res.body.title).toBe("Printer jammed");
  });

  it("rejects a ticket without a title", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .send({ ...goodTicket, title: "   " });

    expect(res.status).toBe(400);
    expect(res.body.fields.title).toBeDefined();
  });

  it("rejects a category that doesn't exist", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .send({ ...goodTicket, category: "coffee machine" });

    expect(res.status).toBe(400);
    expect(res.body.fields.category).toBeDefined();
  });

  it("rejects a body that isn't valid JSON", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Content-Type", "application/json")
      .send("{not json");

    expect(res.status).toBe(400);
  });
});
