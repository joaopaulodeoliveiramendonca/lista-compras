export type Item = {
  id: string
  name: string
  quantity: number
  done: boolean
  createdAt: string
  updatedAt: string
}

export type ItemCreate = {
  name: string
  quantity: number
  done?: boolean
}

export type ItemUpdate = Partial<ItemCreate>

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// Faz fetch, trata erro e tenta parsear JSON se existir corpo.
// Se for 204 ou corpo vazio, retorna undefined (sem quebrar).
async function http<T>(url: string, init?: RequestInit): Promise<T | undefined> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  })

  const text = await res.text().catch(() => "")

  if (!res.ok) {
    // Se o backend devolveu mensagem, use-a; senão, HTTP <status>
    throw new Error(text || ("HTTP " + res.status))
  }

  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return undefined as T
  }
}

export const api = {
  list(search?: string, onlyOpen?: boolean) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (typeof onlyOpen === "boolean") params.set("onlyOpen", String(onlyOpen))
    const qs = params.toString()
    return http<{ data: Item[] }>(BASE_URL + "/items" + (qs ? "?" + qs : ""))
  },
  create(body: ItemCreate) {
    return http<Item>(BASE_URL + "/items", { method: "POST", body: JSON.stringify(body) })
  },
  // Use PATCH (muito comum para updates parciais). Se seu backend só aceitar PUT,
  // a gente troca aqui depois. Por enquanto PATCH resolve o 404.
  update(id: string, body: ItemUpdate) {
    return http<Item>(BASE_URL + "/items/" + id, { method: "PATCH", body: JSON.stringify(body) })
  },
  // DELETE pode devolver 204 sem corpo. Nosso http() já trata isso.
  remove(id: string) {
    return http<{ ok: true }>(BASE_URL + "/items/" + id, { method: "DELETE" })
  },
}
