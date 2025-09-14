import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Item, type ItemCreate, type ItemUpdate, type Category, type Meta } from "../api/client";
import { itemCreateSchema, itemUpdateSchema } from "@/validation/item";
import { toast } from "sonner";
import {
  Plus, Trash2, Loader2, Check, Pencil, ChevronsUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortBy = Meta["sortBy"];
type Order = Meta["order"];

export default function ItemsPage() {
  const qc = useQueryClient();

  // filtros
  const [search, setSearch] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // paginação/ordenação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [order, setOrder] = useState<Order>("desc");

  // form criação
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [createCategoryId, setCreateCategoryId] = useState<string | undefined>(undefined);

  // edição (dialog)
  const [editing, setEditing] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState<number | "">("");
  const [editCategoryId, setEditCategoryId] = useState<string | undefined>(undefined);

  // categorias
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });
  const categories: Category[] = categoriesQuery.data?.data || [];

  // listar itens
  const listQuery = useQuery({
    queryKey: ["items", { search, onlyOpen, categoryId, page, perPage, sortBy, order }],
    queryFn: () => api.list({ search, onlyOpen, categoryId, page, perPage, sortBy, order }),
    keepPreviousData: true,
  });

  const items = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  // mutations
  const createMut = useMutation({
    mutationFn: (body: ItemCreate) => api.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      setName("");
      setQuantity("");
      setCreateCategoryId(undefined);
      toast.success("Item criado");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao criar"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ItemUpdate }) => api.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item removido");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao remover"),
  });

  // resetar página quando filtros mudarem
  useEffect(() => { setPage(1); }, [search, onlyOpen, categoryId, perPage]);

  function handleCreate() {
    const parsed = itemCreateSchema.safeParse({
      name: name,
      quantity: quantity === "" ? 0 : quantity,
      categoryId: createCategoryId ?? undefined,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Dados inválidos";
      toast.message(msg);
      return;
    }
    createMut.mutate(parsed.data);
  }

  function toggleDone(it: Item) {
    updateMut.mutate({ id: it.id, body: { done: !it.done } });
  }

  function openEdit(it: Item) {
    setEditing(it);
    setEditName(it.name);
    setEditQty(it.quantity);
    setEditCategoryId(it.categoryId ?? undefined);
  }

  function saveEdit() {
    if (!editing) return;
    const parsed = itemUpdateSchema.safeParse({
      name: editName,
      quantity: editQty === "" ? undefined : editQty,
      categoryId: editCategoryId ?? null,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Dados inválidos";
      toast.message(msg);
      return;
    }
    updateMut.mutate(
      { id: editing.id, body: parsed.data },
      { onSuccess: () => { setEditing(null); toast.success("Item atualizado"); } }
    );
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching;

  function toggleSort(col: SortBy) {
    if (sortBy === col) {
      setOrder(o => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  }

  const SortIcon = ({ col }: { col: SortBy }) => {
    if (sortBy !== col) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 inline" />;
    return order === "asc" ? <ArrowUp className="ml-1 h-3.5 w-3.5 inline" /> : <ArrowDown className="ml-1 h-3.5 w-3.5 inline" />;
  };

  return (
    <div className="space-y-6">
      {/* Barra superior */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px_180px] sm:items-center">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        {/* Filtro por categoria (usa sentinela __all) */}
        <Select
          value={categoryId ?? "__all"}
          onValueChange={(v) => setCategoryId(v === "__all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={onlyOpen}
            onCheckedChange={(v) => setOnlyOpen(Boolean(v))}
          />
          Mostrar apenas pendentes
        </label>
      </div>

      {/* Formulário de criação */}
      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_220px_auto]">
          <Input
            placeholder="Ex: Arroz"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Input
            type="number"
            min={1}
            placeholder="Qtd"
            value={quantity}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setQuantity(v === "" ? "" : Number(v));
            }}
          />

          {/* Categoria da criação (usa sentinela __none) */}
          <Select
            value={createCategoryId ?? "__none"}
            onValueChange={(v) => setCreateCategoryId(v === "__none" ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Sem categoria</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="gap-2" onClick={handleCreate} disabled={createMut.isPending}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Nome obrigatório. Quantidade mínima 1.</p>
      </div>

      {/* Lista */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">
                Item <SortIcon col="name" />
              </TableHead>
              <TableHead onClick={() => toggleSort("quantity")} className="w-28 cursor-pointer select-none">
                Qtd <SortIcon col="quantity" />
              </TableHead>
              <TableHead className="w-40">Categoria</TableHead>
              <TableHead onClick={() => toggleSort("createdAt")} className="w-36 cursor-pointer select-none">
                Criado <SortIcon col="createdAt" />
              </TableHead>
              <TableHead className="w-40 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Carregando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum item
                </TableCell>
              </TableRow>
            ) : (
              items.map((it) => (
                <TableRow key={it.id} className={cn(it.done && "opacity-60")}>
                  <TableCell>
                    <Checkbox checked={it.done} onCheckedChange={() => toggleDone(it)} aria-label="concluir" />
                  </TableCell>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell>x{it.quantity}</TableCell>
                  <TableCell>{it.category?.name ?? <span className="text-muted-foreground">Sem</span>}</TableCell>
                  <TableCell>{new Date(it.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={editing?.id === it.id} onOpenChange={(open) => !open && setEditing(null)}>
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(it)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Remover este item?")) deleteMut.mutate(it.id);
                          }}
                          disabled={deleteMut.isPending}
                        >
                          {deleteMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Excluir
                        </Button>
                      </div>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar item</DialogTitle>
                          <DialogDescription>Atualize os campos abaixo.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                          <Input
                            placeholder="Nome"
                            value={editName}
                            onChange={(e) => setEditName(e.currentTarget.value)}
                          />
                          <Input
                            type="number"
                            min={1}
                            placeholder="Quantidade"
                            value={editQty}
                            onChange={(e) => {
                              const v = e.currentTarget.value;
                              setEditQty(v === "" ? "" : Number(v));
                            }}
                          />

                          {/* Categoria da edição (usa sentinela __none) */}
                          <Select
                            value={editCategoryId ?? "__none"}
                            onValueChange={(v) => setEditCategoryId(v === "__none" ? undefined : v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sem categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">Sem categoria</SelectItem>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                          <Button onClick={saveEdit} disabled={updateMut.isPending}>
                            {updateMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Salvar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          {meta
            ? <>Página <b>{meta.page}</b> de <b>{meta.totalPages}</b> — Total: <b>{meta.total}</b></>
            : <>Página 1</>
          }
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Itens/página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / pág</SelectItem>
              <SelectItem value="10">10 / pág</SelectItem>
              <SelectItem value="20">20 / pág</SelectItem>
            </SelectContent>
          </Select>

          <div className="inline-flex gap-2">
            <Button
              variant="outline"
              disabled={!meta || meta.page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={!meta || meta.page >= (meta.totalPages || 1) || isLoading}
              onClick={() => setPage((p) => (meta ? Math.min(meta.totalPages, p + 1) : p + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
