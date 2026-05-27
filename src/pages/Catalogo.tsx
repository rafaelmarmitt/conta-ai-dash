import { DashboardLayout } from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
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
import { NewCustomerDialog } from "@/components/NewCustomerDialog";
import { MockBadge } from "@/components/MockBadge";
import { useSupabaseTable } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProdutoRow {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
}
interface ClienteRow {
  id: string;
  name: string;
  phone: string | null;
  total_spent: number;
  last_purchase_at: string | null;
}

const PRODUTOS_MOCK: ProdutoRow[] = [
  { id: "m1", name: "Bolo Decorado 1kg", price: 180, category: "Bolos", image_url: "🎂" },
  { id: "m2", name: "Brigadeiro Gourmet (cento)", price: 90, category: "Doces", image_url: "🍫" },
  { id: "m3", name: "Kit Festa Completo", price: 450, category: "Festas", image_url: "🎉" },
  { id: "m4", name: "Doce de Leite (pote)", price: 35, category: "Doces", image_url: "🍯" },
  { id: "m5", name: "Cupcake Personalizado", price: 12, category: "Doces", image_url: "🧁" },
  { id: "m6", name: "Torta Holandesa", price: 95, category: "Bolos", image_url: "🥧" },
];

const CLIENTES_MOCK: ClienteRow[] = [
  { id: "c1", name: "Maria Silva", phone: "(11) 99887-1122", total_spent: 1240, last_purchase_at: new Date().toISOString() },
  { id: "c2", name: "João Pereira", phone: "(11) 98765-4321", total_spent: 450, last_purchase_at: null },
  { id: "c3", name: "Ana Lima", phone: "(11) 97654-8899", total_spent: 720, last_purchase_at: null },
  { id: "c4", name: "Carlos Souza", phone: "(11) 96543-7788", total_spent: 2180, last_purchase_at: null },
  { id: "c5", name: "Beatriz Costa", phone: "(11) 95432-6677", total_spent: 290, last_purchase_at: null },
];

const Catalogo = () => {
  const { user } = useAuth();
  const { data: produtos, isMock: produtosMock, refetch: refetchProdutos } = useSupabaseTable<ProdutoRow>(
    "products", PRODUTOS_MOCK, { orderBy: { column: "created_at", ascending: false } }
  );
  const { data: clientes, isMock: clientesMock, refetch: refetchClientes } = useSupabaseTable<ClienteRow>(
    "customers", CLIENTES_MOCK, { orderBy: { column: "total_spent", ascending: false } }
  );

  const [open, setOpen] = useState(false);
  const [savingProd, setSavingProd] = useState(false);
  const [novo, setNovo] = useState({ nome: "", preco: "", custo: "", categoria: "", emoji: "📦", quantidade: "0", minimo: "0" });
  const [busca, setBusca] = useState("");
  const [buscaCli, setBuscaCli] = useState("");

  const lucro = Number(novo.preco || 0) - Number(novo.custo || 0);
  const margem = Number(novo.preco || 0) > 0 ? ((lucro / Number(novo.preco || 0)) * 100) : 0;

  const adicionar = async () => {
    if (!novo.nome || !novo.preco) return toast.error("Preencha nome e preço");
    if (!user) return toast.error("Faça login para adicionar produtos");

    setSavingProd(true);
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        name: novo.nome,
        price: parseFloat(novo.preco),
        cost: parseFloat(novo.custo || "0"),
        category: novo.categoria || "Outros",
        image_url: novo.emoji,
        active: true,
        is_service: false,
      })
      .select()
      .single();

    if (prodErr || !prod) {
      setSavingProd(false);
      return toast.error(prodErr?.message || "Erro ao criar produto");
    }

    const { error: invErr } = await supabase.from("inventory").insert({
      product_id: prod.id,
      quantity: Number(novo.quantidade || 0),
      min_quantity: Number(novo.minimo || 0),
    });

    setSavingProd(false);
    if (invErr) return toast.error(invErr.message);

    setNovo({ nome: "", preco: "", custo: "", categoria: "", emoji: "📦", quantidade: "0", minimo: "0" });
    setOpen(false);
    toast.success("Produto e estoque cadastrados!");
    refetchProdutos();
  };

  const remover = async (id: string) => {
    if (produtosMock) return toast("Mock — adicione produtos reais para remover");
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast("Produto removido");
    refetchProdutos();
  };

  const filtrados = produtos.filter((p) => p.name.toLowerCase().includes(busca.toLowerCase()));
  const filtrCli = clientes.filter((c) => c.name.toLowerCase().includes(buscaCli.toLowerCase()));
  const totalReceita = clientes.reduce((s, c) => s + Number(c.total_spent || 0), 0);

  const isVip = (c: ClienteRow) => Number(c.total_spent) > 1000;
  const ultimaLabel = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias`;
    if (days < 30) return `${Math.floor(days / 7)} sem`;
    return `${Math.floor(days / 30)} meses`;
  };

  return (
    <>
      <Seo title="Catálogo & Clientes · Conta.AI" description="Cadastre produtos, serviços e clientes para que o bot do WhatsApp registre vendas automaticamente." path="/catalogo" />
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
              <p className="text-xs font-bold uppercase text-success-deep tracking-wider">Categorias</p>
              <p className="text-3xl font-extrabold text-success-deep mt-1">{new Set(produtos.map((p) => p.category)).size}</p>
            </Card>
            <Card className="p-4 shadow-card gradient-info text-primary-foreground border-0">
              <p className="text-xs font-bold uppercase opacity-90 tracking-wider">Ticket médio</p>
              <p className="text-3xl font-extrabold mt-1">R$ {(produtos.reduce((s, p) => s + Number(p.price), 0) / Math.max(produtos.length, 1)).toFixed(0)}</p>
            </Card>
          </div>

          <Card className="p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">Catálogo</h2>
                  <MockBadge show={produtosMock} />
                </div>
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
                  <div className="text-4xl mb-3">{p.image_url || "📦"}</div>
                  <Badge className="bg-primary-soft text-primary border-0 mb-2 text-[10px]">{p.category || "Outros"}</Badge>
                  <h3 className="font-bold text-sm text-foreground mb-2 leading-tight">{p.name}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-gradient-primary">R$ {Number(p.price).toFixed(0)}</p>
                    </div>
                    <CopyButton text={`${p.image_url || ""} ${p.name} - R$ ${Number(p.price).toFixed(2).replace(".", ",")}`} className="h-7 w-7" />
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
              <p className="text-2xl font-extrabold text-warning-foreground mt-1">{clientes.filter(isVip).length}</p>
            </Card>
            <Card className="p-4 shadow-card bg-success-soft/40 border-success/20">
              <p className="text-xs font-bold uppercase text-success-deep tracking-wider">Receita total</p>
              <p className="text-2xl font-extrabold text-success-deep mt-1">R$ {totalReceita.toLocaleString("pt-BR")}</p>
            </Card>
            <Card className="p-4 shadow-card gradient-coral text-primary-foreground border-0">
              <p className="text-xs font-bold uppercase opacity-90 tracking-wider">Ticket médio</p>
              <p className="text-2xl font-extrabold mt-1">R$ {(totalReceita / Math.max(clientes.length, 1)).toFixed(0)}</p>
            </Card>
          </div>

          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">Clientes</h2>
                  <MockBadge show={clientesMock} />
                </div>
                <p className="text-xs text-muted-foreground">Quem já comprou via bot</p>
              </div>
              <div className="flex gap-2 items-center flex-1 sm:flex-initial sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={buscaCli} onChange={(e) => setBuscaCli(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
                </div>
                <NewCustomerDialog
                  trigger={<Button variant="success" className="rounded-xl shrink-0"><Plus className="h-4 w-4" /> Novo</Button>}
                  onCreated={refetchClientes}
                />
              </div>
            </div>
            <div className="space-y-2">
              {filtrCli.map((c, i) => {
                const vip = isVip(c);
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-smooth animate-fade-in group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow-glow">
                        {c.name.charAt(0)}
                      </div>
                      {vip && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning flex items-center justify-center shadow-soft">
                          <Crown className="h-3 w-3 text-warning-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground">{c.name}</p>
                        {vip && <Badge className="bg-warning text-warning-foreground border-0 text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" /> VIP</Badge>}
                      </div>
                      {c.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">última {ultimaLabel(c.last_purchase_at)}</p>
                      <p className="font-extrabold text-primary text-lg">R$ {Number(c.total_spent).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-smooth">
                      {c.phone && (
                        <Button size="icon" variant="ghost" className="text-whatsapp" asChild>
                          <a href={`https://wa.me/55${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {c.phone && <CopyButton text={c.phone} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
    </>
  );
};

export default Catalogo;
