// frontend/lib/api-client.ts
export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: number
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Stats {
  total: number
  todo: number
  doing: number
  done: number
  done_today: number
  productivity_score: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("auth_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      ...options,
      headers,
    })
  } catch (err: any) {
    throw new Error(
      `Network error: ${err?.message || "Failed to fetch"}. Ensure backend is reachable and NEXT_PUBLIC_API_URL is set.`
    )
  }

  if (!res.ok) {
    // try to parse JSON error body for a helpful message
    try {
      const json = await res.json()
      const detail = json?.detail || json?.message || JSON.stringify(json)
      throw new Error(detail || `API error: ${res.status} ${res.statusText}`)
    } catch (parseErr) {
      const text = await res.text().catch(() => "")
      throw new Error(text || `API request failed: ${res.status} ${res.statusText}`)
    }
  }

  // parse JSON body, but surface a clearer error if parsing fails
  try {
    return await res.json()
  } catch (err: any) {
    throw new Error(`Invalid JSON response from API: ${err?.message || "parse error"}`)
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  listTasks: () => request<Task[]>("/tasks"),
  
  createTask: (data: Partial<Task>) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTask: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteTask: (id: string) =>
    request<{ ok: boolean }>(`/tasks/${id}`, {
      method: "DELETE",
    }),

  stats: () => request<Stats>("/stats"),

  oversee: (idea: string) =>
    request<{ approval: string }>("/oversee", {
      method: "POST",
      body: JSON.stringify({ idea }),
    }),
}
