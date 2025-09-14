import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Item, type ItemCreate, type ItemUpdate } from "../api/client";
import { toast } from "sonner";

export default function ItemsPage() {
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const listQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => api.list(),
  });

  const createMut = useMutation({
    mutationFn: (body: ItemCreate) => api.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); setName(""); setQuantity(1); toast.success("Item criado"); },
    onError: (e: any) => toast.error(e.message || "Erro ao criar"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ItemUpdate }) => api.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); toast.success("Item removido"); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover"),
  });

  const items = listQuery.data?.data ?? [];

  function create() {
    const trimmed = name.trim();
    if (!trimmed) { toast.message("Nome é obrigatório"); return; }
    createMut.mutate({ name: trimmed, quantity: Number(quantity) || 1 });
  }

  function toggleDone(item: Item) {
    updateMut.mutate({ id: item.id, body: { done: !item.done } });
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <label>Nome:&nbsp;</label>
        <input
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 8px", marginRight: 8 }}
          placeholder="Ex: Arroz"
        />
        <label>Qtd:&nbsp;</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.currentTarget.value || 1))}
          style={{ width: 80, border: "1px solid #ccc", borderRadius: 6, padding: "6px 8px", marginRight: 8 }}
        />
        <button onClick={create} style={{ padding: "6px 10px", border: "1px solid #333", borderRadius: 6 }}>
          Criar
        </button>
      </div>

      {listQuery.isLoading && <p>Carregando…</p>}
      {listQuery.error && <p style={{ color: "tomato" }}>Erro ao carregar</p>}
      {!listQuery.isLoading && items.length === 0 && <p>Sem itens</p>}

      <ul style={{ lineHeight: "1.9" }}>
        {items.map((it) => (
          <li key={it.id}>
            <input type="checkbox" checked={it.done} onChange={() => toggleDone(it)} />
            &nbsp;<strong>{it.name}</strong> &nbsp; x{it.quantity}
            &nbsp;&nbsp;
            <button
              onClick={() => { if (confirm("Remover este item?")) deleteMut.mutate(it.id); }}
              style={{ padding: "2px 8px", marginLeft: 8 }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
