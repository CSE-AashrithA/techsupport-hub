-- techsupport hub database schema
-- safe to run more than once (it skips anything that already exists)

-- people who use the app: employees report issues, admins fix them
create table if not exists users (
  id            bigint generated always as identity primary key,
  name          text        not null check (char_length(name) between 1 and 100),
  email         text        not null check (position('@' in email) > 1),
  -- filled in once login is added
  password_hash text,
  role          text        not null default 'employee'
                            check (role in ('employee', 'admin')),
  created_at    timestamptz not null default now()
);

-- one account per email, no matter how it's capitalized
create unique index if not exists users_email_lower_key on users (lower(email));

create table if not exists tickets (
  id           bigint generated always as identity primary key,
  title        text        not null check (char_length(title) between 1 and 200),
  description  text        not null check (char_length(description) between 1 and 5000),
  category     text        not null
               check (category in ('hardware', 'software', 'network', 'account', 'other')),
  priority     text        not null default 'medium'
               check (priority in ('low', 'medium', 'high', 'urgent')),
  status       text        not null default 'open'
               check (status in ('open', 'in_progress', 'resolved', 'closed')),
  requester_id bigint      not null references users (id) on delete restrict,
  assignee_id  bigint      references users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  -- a ticket is marked resolved exactly when it's resolved or closed
  check ((status in ('resolved', 'closed')) = (resolved_at is not null))
);

-- postgres doesn't index foreign keys on its own, so we do it here
create index if not exists tickets_requester_id_idx on tickets (requester_id);
create index if not exists tickets_assignee_id_idx  on tickets (assignee_id);
-- the dashboard lists tickets by status, newest first
create index if not exists tickets_status_created_idx on tickets (status, created_at desc);

-- updates and replies on a ticket
create table if not exists ticket_comments (
  id         bigint generated always as identity primary key,
  ticket_id  bigint      not null references tickets (id) on delete cascade,
  author_id  bigint      not null references users (id) on delete restrict,
  body       text        not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists ticket_comments_ticket_id_idx on ticket_comments (ticket_id, created_at);
create index if not exists ticket_comments_author_id_idx on ticket_comments (author_id);

-- keep tickets.updated_at current automatically on every change
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tickets_set_updated_at on tickets;
create trigger tickets_set_updated_at
  before update on tickets
  for each row execute function set_updated_at();
