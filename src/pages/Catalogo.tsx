import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Package, Users, Trash2, Pencil, Search, Phone, MessageCircle, Crown, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";

interface Produto { id: string; nome: string; preco: number; categoria: string; emoji: string; vendas: number; }
interface Cliente { id: string; nome: string; tel: string; compras: number; total: number; ultima: string; vip: boolean; }

const Catalogo = () => {
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: "1", nome: "Bolo Decorado 1kg", preco: 180, categoria: "Bolos", emoji: "🎂", vendas: 28 },
    { id: "2", nome: "Brigadeiro Gourmet (cento)", preco: 90, categoria: "Doces", emoji: "🍫", vendas: 19 },
    { id: "3", nome: "Kit Festa Completo", preco: 450, categoria: "Festas", emoji: "🎉", vendas: 6 },
    { id: "4", nome: "Doce de Leite (pote)", preco: 35, categoria: "Doces", emoji: "🍯", vendas: 12 },
    { id: "5", nome: "Cupcake Personalizado", preco: 12, categoria: "Doces", emoji: "🧁", vendas: 45 },
    { id: "6", nome: "Torta Holandesa", preco: 95, categoria: "Bolos", emoji: "🥧", vendas: 8 },
  ]);
  const [clientes] = useState<Cliente[]>([
    { id: "1", nome: "Maria Silva", tel: "(11) 99887-1122", compras: 8, total: 1240, ultima: "Hoje", vip: true },
    { id: "2", nome: "João Pereira", tel: "(11) 98765-4321", compras: 3, total: 450, ultima: "3 dias", vip: false },
    { id: "3", nome: "Ana Lima", tel: "(11) 97654-8899", compras: 5, total: 720, ultima: "1 semana", vip: false },
    { id: "4", nome: "Carlos Souza", tel: "(11) 96543-7788", compras: 12, total: 2180, ultima: "Ontem", vip: true },
    { id: "5", nome: "Beatriz Costa", tel: "(11) 95432-6677", compras: 2, total: 290, ultima: "2 semanas", vip: false },
  ]);
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({ nome: "", preco: "", categoria: "", emoji: "📦" });
  const [busca, setBusca] = useState("");
  const [buscaCli, setBuscaCli] = useState("");

  const adicionar = () => {
    if (!novo.nome || !novo.preco) return toast.error("Preencha nome e preço");
    setProdutos([...produtos, {
      id: Date.now().toString(),
      nome: novo.nome,
      preco: parseFloat(novo.preco),
      categoria: novo.categoria || "Outros",
      emoji: novo.emoji,
      vendas: 0,
    }]);
    setNovo({ nome: "", preco: "", categoria: "", emoji: "📦" });
    setOpen(false);
    toast.success("Produto adicionado ao catálogo!");
  };

  const remover = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id));
    toast("Produto removido");
  };

  const filtrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));
  const filtrCli = clientes.filter((c) => c.nome.toLowerCase().includes(buscaCli.toLowerCase()));
  const totalReceita = clientes.reduce((s, c) => s + c.total, 0);

  return (
    <DashboardLayout title="Catálogo & Clientes" subtitle="Tudo que o bot precisa saber sobre seu negócio">
      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="mb-5 bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="produtos" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
            <Package className="h-4 w-4 mr-2" /> Produtos & Serviços
          </TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4 mr-2" /> Clientes (CRM)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="mt-0">
          <div className="grid gap-4 md:grid-cols-3 mb-5">
            <Card className="p-4 shadow-card bg-primary-soft/40 border-primary/20">
              <p className="text-xs font-bold uppercase text-primary tracking-wider">Total no catálogo</p>
              <p className="text-3xl font-extrabold text-primary mt-1">{produtos.length}</p>
            </Card>
            <Card className="p-4 shadow-card bg-success-soft/40 border-success/20">
              <p className="text-xs font-bold uppercase text-success-deep tracking-wider">Vendas no mês</p>
              <p className="text-3xl font-extrabold text-success-deep mt-1">{produtos.reduce((s, p) => s + p.vendas, 0)}</p>
            </Card>
            <Card className="p-4 shadow-card gradient-info text-primary-foreground border-0">
              <p className="text-xs font-bold uppercase opacity-90 tracking-wider">Ticket médio</p>
              <p className="text-3xl font-extrabold mt-1">R$ 142</p>
            </Card>
          </div>

          <Card className="p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold">Catálogo</h2>
                <p className="text-xs text-muted-foreground">{filtrados.length} de {produtos.length} itens</p>
              </div>
              <div className="flex gap-2 items-center flex-1 sm:flex-initial sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="pl-9" />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="success" className="rounded-xl shrink-0"><Plus className="h-4 w-4" /> Novo</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar produto</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="emoji">Emoji</Label>
                        <Input id="emoji" value={novo.emoji} onChange={(e) => setNovo({ ...novo, emoji: e.target.value })} maxLength={2} />
                      </div>
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
                      <Button variant="success" onClick={adicionar}>Adicionar ao catálogo</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtrados.map((p, i) => (
                <Card
                  key={p.id}
                  className="relative p-4 border-border hover:border-primary/40 hover-lift overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast("Editar em breve")}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive-soft" onClick={() => remover(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-4xl mb-3">{p.emoji}</div>
                  <Badge className="bg-primary-soft text-primary border-0 mb-2 text-[10px]">{p.categoria}</Badge>
                  <h3 className="font-bold text-sm text-foreground mb-2 leading-tight">{p.nome}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-gradient-primary">R$ {p.preco.toFixed(0)}</p>
                      <p className="text-[11px] text-muted-foreground">{p.vendas} vendidos</p>
                    </div>
                    <CopyButton text={`${p.emoji} ${p.nome} - R$ ${p.preco.toFixed(2).replace(".", ",")}`} className="h-7 w-7" />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="mt-0">
          <div className="grid gap-4 md:grid-cols-4 mb-5">
            <Card className="p-4 shadow-card">
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total clientes</p>
              <p className="text-2xl font-extrabold mt-1">{clientes.length}</p>
            </Card>
            <Card className="p-4 shadow-card bg-warning-soft/40 border-warning/20">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-warning" />
                <p className="text-xs font-bold uppercase text-warning-foreground tracking-wider">VIPs</p>
              </div>
              <p className="text-2xl font-extrabold text-warning-foreground mt-1">{clientes.filter((c) => c.vip).length}</p>
            </Card>
            <Card className="p-4 shadow-card bg-success-soft/40 border-success/20">
              <p className="text-xs font-bold uppercase text-success-deep tracking-wider">Receita total</p>
              <p className="text-2xl font-extrabold text-success-deep mt-1">R$ {totalReceita.toLocaleString("pt-BR")}</p>
            </Card>
            <Card className="p-4 shadow-card gradient-coral text-primary-foreground border-0">
              <p className="text-xs font-bold uppercase opacity-90 tracking-wider">Recompra</p>
              <p className="text-2xl font-extrabold mt-1">68%</p>
            </Card>
          </div>

          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold">Clientes</h2>
                <p className="text-xs text-muted-foreground">Quem já comprou via bot</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={buscaCli} onChange={(e) => setBuscaCli(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              {filtrCli.map((c, i) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-smooth animate-fade-in group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow-glow">
                      {c.nome.charAt(0)}
                    </div>
                    {c.vip && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning flex items-center justify-center shadow-soft">
                        <Crown className="h-3 w-3 text-warning-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{c.nome}</p>
                      {c.vip && <Badge className="bg-warning text-warning-foreground border-0 text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" /> VIP</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.tel}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{c.compras} compras · última {c.ultima}</p>
                    <p className="font-extrabold text-primary text-lg">R$ {c.total.toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-smooth">
                    <Button size="icon" variant="ghost" className="text-whatsapp" asChild>
                      <a href={`https://wa.me/55${c.tel.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                    <CopyButton text={c.tel} />
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
