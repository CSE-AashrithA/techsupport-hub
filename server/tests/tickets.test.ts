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

describe("GET /api/tickets", () => {
  it("lists tickets with the newest first", async () => {
    const first = await request(app)
      .post("/api/tickets")
      .send({ ...goodTicket, title: "Older ticket" });
    const second = await request(app)
      .post("/api/tickets")
      .send({ ...goodTicket, title: "Newer ticket" });

    const res = await request(app).get("/api/tickets");
    const ids = res.body.map((t: { id: number }) => t.id);

    expect(res.status).toBe(200);
    expect(ids.indexOf(second.body.id)).toBeLessThan(ids.indexOf(first.body.id));
  });

  it("can show only urgent tickets", async () => {
    const urgent = await request(app)
      .post("/api/tickets")
      .send({ ...goodTicket, priority: "urgent" });

    const res = await request(app).get("/api/tickets?priority=urgent");

    expect(res.status).toBe(200);
    expect(res.body.map((t: { id: number }) => t.id)).toContain(urgent.body.id);
    expect(res.body.every((t: { priority: string }) => t.priority === "urgent")).toBe(true);
  });

  it("can filter by status", async () => {
    const res = await request(app).get("/api/tickets?status=resolved");

    expect(res.status).toBe(200);
    expect(res.body.every((t: { status: string }) => t.status === "resolved")).toBe(true);
  });

  it("rejects a status that doesn't exist", async () => {
    const res = await request(app).get("/api/tickets?status=lost");

    expect(res.status).toBe(400);
    expect(res.body.fields.status).toBeDefined();
  });
});

describe("GET /api/tickets/:id", () => {
  it("returns one ticket with its comments", async () => {
    const created = await request(app).post("/api/tickets").send(goodTicket);

    const res = await request(app).get(`/api/tickets/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.body.id,
      title: goodTicket.title,
      description: goodTicket.description,
      comments: [],
    });
  });

  it("includes comments, oldest first", async () => {
    const created = await request(app).post("/api/tickets").send(goodTicket);
    const { rows } = await pool.query("select id from users where role = 'admin' limit 1");
    await pool.query(
      `insert into ticket_comments (ticket_id, author_id, body)
       values ($1, $2, 'looking into it'), ($1, $2, 'fixed the router')`,
      [created.body.id, rows[0].id],
    );

    const res = await request(app).get(`/api/tickets/${created.body.id}`);

    expect(res.body.comments.map((c: { body: string }) => c.body)).toEqual([
      "looking into it",
      "fixed the router",
    ]);
    expect(res.body.comments[0]).toMatchObject({ authorName: "Demo Admin", authorRole: "admin" });
  });

  it("returns 404 for a ticket that doesn't exist", async () => {
    const res = await request(app).get("/api/tickets/999999");

    expect(res.status).toBe(404);
  });

  it("returns 400 when the id isn't a number", async () => {
    const res = await request(app).get("/api/tickets/abc");

    expect(res.status).toBe(400);
  });
});
