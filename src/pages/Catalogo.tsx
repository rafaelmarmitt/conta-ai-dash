import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Package, Users, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Produto { id: string; nome: string; preco: number; categoria: string; }
interface Cliente { id: string; nome: string; tel: string; compras: number; total: number; }

const Catalogo = () => {
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: "1", nome: "Bolo Decorado 1kg", preco: 180, categoria: "Bolos" },
    { id: "2", nome: "Brigadeiro Gourmet (cento)", preco: 90, categoria: "Doces" },
    { id: "3", nome: "Doce de festa - kit", preco: 450, categoria: "Festas" },
  ]);
  const [clientes] = useState<Cliente[]>([
    { id: "1", nome: "Maria Silva", tel: "(11) 99887-1122", compras: 8, total: 1240 },
    { id: "2", nome: "João Pereira", tel: "(11) 98765-4321", compras: 3, total: 450 },
    { id: "3", nome: "Ana Lima", tel: "(11) 97654-8899", compras: 5, total: 720 },
  ]);
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({ nome: "", preco: "", categoria: "" });

  const adicionar = () => {
    if (!novo.nome || !novo.preco) return toast.error("Preencha nome e preço");
    setProdutos([...produtos, { id: Date.now().toString(), nome: novo.nome, preco: parseFloat(novo.preco), categoria: novo.categoria || "Outros" }]);
    setNovo({ nome: "", preco: "", categoria: "" });
    setOpen(false);
    toast.success("Produto adicionado!");
  };

  const remover = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id));
    toast("Produto removido");
  };

  return (
    <DashboardLayout title="Catálogo & Clientes" subtitle="Tudo que o bot precisa saber sobre seu negócio">
      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="produtos"><Package className="h-4 w-4 mr-2" /> Produtos & Serviços</TabsTrigger>
          <TabsTrigger value="clientes"><Users className="h-4 w-4 mr-2" /> Clientes (CRM)</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card className="p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold">Catálogo</h2>
                <p className="text-xs text-muted-foreground">{produtos.length} itens cadastrados</p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="success"><Plus className="h-4 w-4" /> Novo produto</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Adicionar produto</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="n">Nome</Label>
                      <Input id="n" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Ex: Bolo de chocolate" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p">Preço (R$)</Label>
                      <Input id="p" type="number" value={novo.preco} onChange={(e) => setNovo({ ...novo, preco: e.target.value })} placeholder="120,00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c">Categoria</Label>
                      <Input id="c" value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })} placeholder="Bolos" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="success" onClick={adicionar}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((p) => (
                <Card key={p.id} className="p-4 border-border hover:shadow-glow transition-smooth">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-primary-soft text-primary border-0">{p.categoria}</Badge>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast("Editar em breve")}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remover(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{p.nome}</h3>
                  <p className="text-xl font-bold text-primary">R$ {p.preco.toFixed(2).replace(".", ",")}</p>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold">Clientes</h2>
                <p className="text-xs text-muted-foreground">Quem já comprou via bot</p>
              </div>
              <Badge className="bg-success-soft text-success-foreground border-0">{clientes.length} ativos</Badge>
            </div>
            <div className="space-y-3">
              {clientes.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/40 transition-smooth">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center font-bold">
                    {c.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.tel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{c.compras} compras</p>
                    <p className="font-bold text-primary">R$ {c.total.toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Catalogo;
