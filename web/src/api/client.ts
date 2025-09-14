const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemsCount?: number;
};

export type Item = {
  id: string;
  name: string;
  quantity: number;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId?: string | null;
  category?: Category | null;
};

export type ItemCreate = {
  name: string;
  quantity: number;
  done?: boolean;
  categoryId?: string | null;
};

export type ItemUpdate = Partial<ItemCreate>;

export type Meta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  sortBy: "createdAt" | "updatedAt" | "name" | "quantity" | "done";
  order: "asc" | "desc";
};

export const api = {
  // ITEMS
  async list(params?: {
    search?: string;
    onlyOpen?: boolean;
    page?: number;
    perPage?: number;
    sortBy?: "createdAt" | "updatedAt" | "name" | "quantity" | "done";
    order?: "asc" | "desc";
    categoryId?: string;
  }): Promise<{ data: Item[]; meta?: Meta }> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.onlyOpen !== undefined) qs.set("onlyOpen", String(params.onlyOpen));
    if (params?.page) qs.set("page", String(params.page));
    if (params?.perPage) qs.set("perPage", String(params.perPage));
    if (params?.sortBy) qs.set("sortBy", params.sortBy);
    if (params?.order) qs.set("order", params.order);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);

    const url = `${API_URL}/items${qs.toString() ? "?" + qs.toString() : ""}`;
    return fetchJson(url);
  },

  async create(body: ItemCreate): Promise<Item> {
    return fetchJson(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async update(id: string, body: ItemUpdate): Promise<Item> {
    return fetchJson(`${API_URL}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async remove(id: string): Promise<void> {
    return fetchJson(`${API_URL}/items/${id}`, { method: "DELETE" });
  },

  // CATEGORIES
  async listCategories(): Promise<{ data: Category[] }> {
    return fetchJson(`${API_URL}/categories`);
  },

  async createCategory(name: string): Promise<Category> {
    return fetchJson(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    return fetchJson(`${API_URL}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  },

  async removeCategory(id: string): Promise<void> {
    return fetchJson(`${API_URL}/categories/${id}`, { method: "DELETE" });
  },
};
