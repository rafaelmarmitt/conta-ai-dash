import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { toast } from "sonner";

const distribuicao = [
  { name: "Fornecedores", value: 1850, color: "hsl(172 66% 42%)" },
  { name: "Assinaturas", value: 320, color: "hsl(80 70% 55%)" },
  { name: "Aluguel", value: 800, color: "hsl(38 92% 55%)" },
  { name: "Marketing", value: 280, color: "hsl(172 70% 65%)" },
  { name: "Outros", value: 150, color: "hsl(180 10% 60%)" },
];

const transacoes = [
  { data: "15/06/2025", desc: "Venda Bolo Decorado", cat: "Vendas", tipo: "entrada", valor: 180 },
  { data: "14/06/2025", desc: "Insumos padaria", cat: "Fornecedores", tipo: "saida", valor: 320 },
  { data: "13/06/2025", desc: "Encomenda doces", cat: "Vendas", tipo: "entrada", valor: 450 },
  { data: "12/06/2025", desc: "Conta de luz", cat: "Aluguel", tipo: "saida", valor: 145 },
  { data: "10/06/2025", desc: "Spotify Premium", cat: "Assinaturas", tipo: "saida", valor: 25 },
  { data: "09/06/2025", desc: "Brigadeiros gourmet", cat: "Vendas", tipo: "entrada", valor: 90 },
  { data: "08/06/2025", desc: "Aluguel da loja", cat: "Aluguel", tipo: "saida", valor: 800 },
];

const Relatorios = () => {
  return (
    <DashboardLayout title="Relatórios Financeiros" subtitle="Análise detalhada das suas transações">
      <Card className="p-5 shadow-card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Filtros</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
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
            <Label className="invisible">Ação</Label>
            <Button variant="success" className="w-full" onClick={() => toast.success("Relatório exportado!")}>
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3 mb-5">
        <Card className="p-5 shadow-card lg:col-span-2">
          <h2 className="text-base font-bold mb-1">Transações</h2>
          <p className="text-xs text-muted-foreground mb-4">{transacoes.length} registros</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoes.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{t.data}</TableCell>
                    <TableCell className="font-medium">{t.desc}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted text-foreground border-0">{t.cat}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.tipo === "entrada" ? "text-success-foreground" : "text-destructive"}`}>
                      {t.tipo === "entrada" ? "+" : "-"}R$ {t.valor.toFixed(2).replace(".", ",")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h2 className="text-base font-bold mb-1">Distribuição de Gastos</h2>
          <p className="text-xs text-muted-foreground mb-4">Junho/2025</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicao}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
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
                  }}
                  formatter={(v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;
