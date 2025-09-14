import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Category } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Check, Plus } from "lucide-react";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");

  const listQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });
  const categories = listQuery.data?.data ?? [];

  const createMut = useMutation({
    mutationFn: (n: string) => api.createCategory(n),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      toast.success("Categoria criada");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao criar"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, n }: { id: string; n: string }) => api.updateCategory(id, n),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
      toast.success("Categoria atualizada");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => api.removeCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao remover"),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            placeholder="Nome da categoria"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Button
            className="gap-2"
            onClick={() => {
              const n = name.trim();
              if (!n) return toast.message("Nome é obrigatório");
              createMut.mutate(n);
            }}
            disabled={createMut.isPending}
          >
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Crie, edite ou remova categorias.</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-40 text-right">Itens</TableHead>
              <TableHead className="w-56 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Carregando...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma categoria
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">{c.itemsCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={editing?.id === c.id} onOpenChange={(open) => !open && setEditing(null)}>
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(c);
                            setEditName(c.name);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Remover esta categoria? (Itens ficarão sem categoria)")) {
                              removeMut.mutate(c.id);
                            }
                          }}
                          disabled={removeMut.isPending}
                        >
                          {removeMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Excluir
                        </Button>
                      </div>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar categoria</DialogTitle>
                          <DialogDescription>Atualize o nome abaixo.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                          <Input
                            placeholder="Nome"
                            value={editName}
                            onChange={(e) => setEditName(e.currentTarget.value)}
                          />
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                          <Button
                            onClick={() => {
                              const n = editName.trim();
                              if (!n) return toast.message("Nome é obrigatório");
                              updateMut.mutate({ id: c.id, n });
                            }}
                            disabled={updateMut.isPending}
                          >
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
    </div>
  );
}
