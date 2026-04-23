import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Filter, Search, ArrowUpRight, ArrowDownRight, FileText, FileSpreadsheet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const distribuicao = [
  { name: "Fornecedores", value: 1850, color: "hsl(172 85% 38%)" },
  { name: "Aluguel", value: 800, color: "hsl(14 92% 62%)" },
  { name: "Assinaturas", value: 320, color: "hsl(252 85% 65%)" },
  { name: "Marketing", value: 280, color: "hsl(88 85% 52%)" },
  { name: "Outros", value: 150, color: "hsl(38 95% 58%)" },
];

const comparativo = [
  { cat: "Vendas", atual: 7300, anterior: 6100 },
  { cat: "Despesas", atual: 3400, anterior: 3100 },
  { cat: "Impostos", atual: 76, anterior: 76 },
  { cat: "Lucro", atual: 3824, anterior: 2924 },
];

const transacoes = [
  { data: "15/06/2025", desc: "Venda Bolo Decorado", cat: "Vendas", tipo: "entrada", valor: 180, cliente: "Maria S." },
  { data: "14/06/2025", desc: "Insumos padaria", cat: "Fornecedores", tipo: "saida", valor: 320, cliente: "Atacadão" },
  { data: "13/06/2025", desc: "Encomenda doces", cat: "Vendas", tipo: "entrada", valor: 450, cliente: "João P." },
  { data: "12/06/2025", desc: "Conta de luz", cat: "Aluguel", tipo: "saida", valor: 145, cliente: "Enel" },
  { data: "10/06/2025", desc: "Spotify Premium", cat: "Assinaturas", tipo: "saida", valor: 25, cliente: "Spotify" },
  { data: "09/06/2025", desc: "Brigadeiros gourmet", cat: "Vendas", tipo: "entrada", valor: 90, cliente: "Ana L." },
  { data: "08/06/2025", desc: "Aluguel da loja", cat: "Aluguel", tipo: "saida", valor: 800, cliente: "Imobiliária" },
  { data: "07/06/2025", desc: "Bolo aniversário", cat: "Vendas", tipo: "entrada", valor: 220, cliente: "Carla M." },
];

const Relatorios = () => {
  const [busca, setBusca] = useState("");
  const filtradas = transacoes.filter(
    (t) => t.desc.toLowerCase().includes(busca.toLowerCase()) || t.cliente.toLowerCase().includes(busca.toLowerCase())
  );
  const totalEntradas = filtradas.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
  const totalSaidas = filtradas.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);

  return (
    <DashboardLayout
      title="Relatórios Financeiros"
      subtitle="Análise detalhada das suas transações"
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="success" className="rounded-xl">
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.success("CSV exportado!")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("CSV exportado!")}>
              <FileText className="h-4 w-4 mr-2" /> CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("PDF gerado!")}>
              <FileText className="h-4 w-4 mr-2" /> PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-5 shadow-card border-success/20 bg-success-soft/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-success-deep tracking-wider">Entradas</p>
              <p className="text-2xl font-extrabold text-success-deep mt-1">R$ {totalEntradas.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl gradient-success flex items-center justify-center shadow-success">
              <ArrowUpRight className="h-5 w-5 text-success-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-5 shadow-card border-destructive/20 bg-destructive-soft/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-destructive tracking-wider">Saídas</p>
              <p className="text-2xl font-extrabold text-destructive mt-1">R$ {totalSaidas.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl gradient-coral flex items-center justify-center shadow-coral">
              <ArrowDownRight className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-5 shadow-card border-primary/20 gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">Saldo</p>
              <p className="text-2xl font-extrabold mt-1">R$ {(totalEntradas - totalSaidas).toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-5 shadow-card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Filtros</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="de">De</Label>
            <Input id="de" type="date" defaultValue="2025-06-01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ate">Até</Label>
            <Input id="ate" type="date" defaultValue="2025-06-30" />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="fornecedores">Fornecedores</SelectItem>
                <SelectItem value="assinaturas">Assinaturas</SelectItem>
                <SelectItem value="aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="invisible">Aplicar</Label>
            <Button variant="default" className="w-full" onClick={() => toast.success("Filtros aplicados!")}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-5 lg:grid-cols-5 mb-5">
        <Card className="p-5 shadow-card lg:col-span-2">
          <h2 className="text-base font-bold mb-1">Distribuição de Gastos</h2>
          <p className="text-xs text-muted-foreground mb-4">Junho/2025 — total R$ 3.400</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicao}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="hsl(var(--card))"
                  strokeWidth={3}
                >
                  {distribuicao.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-card)",
                  }}
                  formatter={(v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card lg:col-span-3">
          <h2 className="text-base font-bold mb-1">Comparativo: Maio vs Junho</h2>
          <p className="text-xs text-muted-foreground mb-4">Crescimento mês a mês</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativo} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="cat" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                  formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="anterior" name="Maio" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="atual" name="Junho" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold">Transações</h2>
            <p className="text-xs text-muted-foreground">{filtradas.length} registros</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar transação ou cliente..."
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-bold">Data</TableHead>
                <TableHead className="font-bold">Descrição</TableHead>
                <TableHead className="font-bold">Cliente/Fornecedor</TableHead>
                <TableHead className="font-bold">Categoria</TableHead>
                <TableHead className="font-bold text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((t, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{t.data}</TableCell>
                  <TableCell className="font-semibold">{t.desc}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-foreground border-0">{t.cat}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-extrabold ${t.tipo === "entrada" ? "text-success-deep" : "text-destructive"}`}>
                    {t.tipo === "entrada" ? "+" : "-"}R$ {t.valor.toFixed(2).replace(".", ",")}
                  </TableCell>
                </TableRow>
              ))}
              {filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Relatorios;
