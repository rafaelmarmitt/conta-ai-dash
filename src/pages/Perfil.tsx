import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Building2, Target, Save } from "lucide-react";
import { toast } from "sonner";

const Perfil = () => {
  const meta = 8000;
  const atual = 7300;
  const pct = Math.round((atual / meta) * 100);

  return (
    <DashboardLayout title="Perfil do Negócio" subtitle="Dados da sua empresa e metas">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Dados da empresa</h2>
              <p className="text-xs text-muted-foreground">MEI — Microempreendedor Individual</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Perfil atualizado com sucesso!");
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fantasia">Nome Fantasia</Label>
              <Input id="fantasia" defaultValue="Doces da Maria" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" defaultValue="12.345.678/0001-99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnae">CNAE Principal</Label>
              <Input id="cnae" defaultValue="1093-7/01 - Confeitaria" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="maria@docesdamaria.com.br" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade / UF</Label>
              <Input id="cidade" defaultValue="São Paulo / SP" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" variant="success">
                <Save className="h-4 w-4" /> Salvar alterações
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 shadow-card gradient-soft border-primary/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-success flex items-center justify-center">
              <Target className="h-5 w-5 text-success-foreground" />
            </div>
            <div>
              <h2 className="text-base font-bold">Meta mensal</h2>
              <p className="text-xs text-muted-foreground">Faturamento de Junho</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">R$ {atual.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground mb-4">de R$ {meta.toLocaleString("pt-BR")}</p>
          <Progress value={pct} className="h-3 mb-2" />
          <p className="text-sm font-semibold text-success-foreground">{pct}% concluído 🎯</p>

          <div className="mt-6 space-y-2">
            <Label htmlFor="meta">Definir nova meta (R$)</Label>
            <div className="flex gap-2">
              <Input id="meta" type="number" defaultValue={meta} />
              <Button variant="default" onClick={() => toast.success("Meta atualizada!")}>OK</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Perfil;
