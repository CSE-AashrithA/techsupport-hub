import { Router } from "express";
import { pool } from "../db.js";
import { validateNewTicket } from "../validation.js";

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
