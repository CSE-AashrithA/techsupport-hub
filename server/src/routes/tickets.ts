import { Router } from "express";
import { pool } from "../db.js";
import {
  parseId,
  parseTicketFilters,
  validateNewComment,
  validateNewTicket,
} from "../validation.js";

export const ticketsRouter = Router();

// what the client gets back for a ticket, renamed to camelCase
const TICKET_FIELDS = `
  t.id, t.title, t.description, t.category, t.priority, t.status,
  t.created_at as "createdAt", t.updated_at as "updatedAt", t.resolved_at as "resolvedAt",
  r.name as "requesterName", a.name as "assigneeName"
`;

// TEMPORARY until login exists: every ticket is reported by the demo employee
async function demoEmployeeId() {
  const { rows } = await pool.query<{ id: number }>(
    "select id from users where lower(email) = 'employee@techsupport.local'",
  );
  if (!rows[0]) throw new Error("demo employee is missing. run: npm run db:setup -w server");
  return rows[0].id;
}

// GET /api/tickets?status=open&priority=urgent  (both filters are optional)
ticketsRouter.get("/", async (req, res) => {
  const filters = parseTicketFilters(req.query);
  if (!filters.ok) {
    res.status(400).json({ error: "Unknown filter", fields: filters.errors });
    return;
  }

  const { rows } = await pool.query(
    `select ${TICKET_FIELDS}
     from tickets t
     join users r on r.id = t.requester_id
     left join users a on a.id = t.assignee_id
     where ($1::text is null or t.status = $1)
       and ($2::text is null or t.priority = $2)
     order by t.created_at desc, t.id desc`,
    [filters.value.status, filters.value.priority],
  );

  res.json(rows);
});

// GET /api/tickets/:id  (the ticket plus its comments, oldest comment first)
ticketsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: "Ticket id must be a positive number" });
    return;
  }

  const ticket = await pool.query(
    `select ${TICKET_FIELDS}
     from tickets t
     join users r on r.id = t.requester_id
     left join users a on a.id = t.assignee_id
     where t.id = $1`,
    [id],
  );
  if (ticket.rows.length === 0) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const comments = await pool.query(
    `select c.id, c.body, c.created_at as "createdAt",
            u.name as "authorName", u.role as "authorRole"
     from ticket_comments c
     join users u on u.id = c.author_id
     where c.ticket_id = $1
     order by c.created_at, c.id`,
    [id],
  );

  res.json({ ...ticket.rows[0], comments: comments.rows });
});

// POST /api/tickets  { title, description, category, priority? }
ticketsRouter.post("/", async (req, res) => {
  const result = validateNewTicket(req.body);
  if (!result.ok) {
    res.status(400).json({ error: "Some fields need fixing", fields: result.errors });
    return;
  }

  const { title, description, category, priority } = result.value;
  const requesterId = await demoEmployeeId();

  const { rows } = await pool.query(
    `with created as (
       insert into tickets (title, description, category, priority, requester_id)
       values ($1, $2, $3, $4, $5)
       returning *
     )
     select ${TICKET_FIELDS}
     from created t
     join users r on r.id = t.requester_id
     left join users a on a.id = t.assignee_id`,
    [title, description, category, priority, requesterId],
  );

  res.status(201).json(rows[0]);
});

// POST /api/tickets/:id/comments  { body }
ticketsRouter.post("/:id/comments", async (req, res) => {
  const ticketId = parseId(req.params.id);
  if (ticketId === null) {
    res.status(400).json({ error: "Ticket id must be a positive number" });
    return;
  }

  const result = validateNewComment(req.body);
  if (!result.ok) {
    res.status(400).json({ error: "Some fields need fixing", fields: result.errors });
    return;
  }

  // TEMPORARY until login exists: updates are posted as the demo employee
  const authorId = await demoEmployeeId();

  // in one statement: add the comment (only if the ticket exists) and bump the ticket's
  // updated_at, so "last update" on the ticket stays accurate
  const { rows } = await pool.query(
    `with created as (
       insert into ticket_comments (ticket_id, author_id, body)
       select $1, $2, $3
       where exists (select 1 from tickets where id = $1)
       returning *
     ),
     touched as (
       update tickets set updated_at = now()
       where id = $1 and exists (select 1 from created)
     )
     select c.id, c.body, c.created_at as "createdAt",
            u.name as "authorName", u.role as "authorRole"
     from created c
     join users u on u.id = c.author_id`,
    [ticketId, authorId, result.value.body],
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.status(201).json(rows[0]);
});
