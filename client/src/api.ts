import type {
  Comment,
  NewTicket,
  Priority,
  Status,
  Ticket,
  TicketWithComments,
} from "./types";

// empty while developing (vite forwards /api to the server). set VITE_API_URL when deployed.
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("Can't reach the IT desk right now. Is the server running?", 0);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    // a 5xx with no json usually means the dev proxy couldn't reach the api at all
    if (!data && res.status >= 500) {
      throw new ApiError("Can't reach the IT desk right now. Is the server running?", res.status);
    }
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status, data?.fields);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listTickets(filters: { status?: Status; priority?: Priority } = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    const query = params.toString();
    return request<Ticket[]>(`/tickets${query ? `?${query}` : ""}`);
  },

  getTicket(id: number) {
    return request<TicketWithComments>(`/tickets/${id}`);
  },

  createTicket(ticket: NewTicket) {
    return request<Ticket>("/tickets", { method: "POST", body: JSON.stringify(ticket) });
  },

  updateStatus(ticketId: number, status: Status) {
    return request<Ticket>(`/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  addComment(ticketId: number, body: string) {
    return request<Comment>(`/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },
};
