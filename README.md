# TechSupport Hub

A full-stack internal help desk. Employees report IT issues, and the IT support team manages, prioritizes and resolves them, like the ticketing systems real companies use.

## How it works

1. An employee creates an account and logs in.
2. They submit a support ticket, such as "My laptop cannot connect to Wi-Fi", with a category, priority, details and an optional screenshot.
3. An IT admin sees the ticket on a dashboard, assigns it to a technician, posts updates and marks it resolved.
4. Employees can follow their tickets' status and history.
5. Admins can also track company devices (laptops, monitors, software) and who they are assigned to.

## Main pages

| Page | Purpose |
| --- | --- |
| Login / Sign up | Secure accounts |
| User dashboard | Create tickets and see their status |
| Create ticket | Category, description, priority, optional screenshot |
| Ticket details | Comments, status updates, assigned technician |
| Admin dashboard | Manage all tickets, users and priorities |
| Asset management | Devices, owners, condition and assignment history |

## Tech stack

| Part | Technology |
| --- | --- |
| Front end | React + TypeScript (Vite) |
| Styling | Tailwind CSS |
| Back end | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT with role-based access control |
| Hosting | Vercel (front end), Render (API) |
| Design | Figma |

## Roadmap

- [ ] **1. Tickets:** create, list, filter and view tickets; status updates and comments
- [ ] **2. Accounts:** sign up and log in with JWT; users see their own tickets
- [ ] **3. Admin dashboard:** roles, assigning technicians, managing all tickets and users
- [ ] **4. Asset management:** devices, owners, condition and assignment history

## Project structure

```
client/        React front end (Vite, TypeScript, Tailwind)
  src/
    components/  reusable pieces like the API status pill and dashboard panel
server/        Express API (TypeScript)
  src/         the app and its routes
  tests/       API tests (Vitest + Supertest)
  db/          database schema and demo data
```

## Running it locally

You'll need [Node.js](https://nodejs.org) 20 or newer.

```bash
# install everything for both the client and the server
npm install

# run the API tests
npm test

# start the API on http://localhost:4000
npm run dev:server

# in a second terminal, start the front end on http://localhost:5173
npm run dev:client
```

The front end sends `/api` requests to the server automatically while developing, so run both.
Database setup steps will be added once the API is connected to PostgreSQL.
