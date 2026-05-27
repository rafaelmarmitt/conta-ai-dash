import { useState, ReactNode } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  trigger: ReactNode;
  onCreated?: () => void;
}

export function NewInventoryItemDialog({ trigger, onCreated }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "", unit: "un",
    price: "", cost: "", quantity: "0", min_quantity: "0",
  });

  const reset = () => setForm({ name: "", category: "", unit: "un", price: "", cost: "", quantity: "0", min_quantity: "0" });

  const salvar = async () => {
    if (!user) return toast.error("Faça login para adicionar itens");
    if (!form.name) return toast.error("Informe o nome do item");

    setSaving(true);
    const { data: prod, error } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        name: form.name,
        category: form.category || null,
        unit: form.unit || "un",
        price: Number(form.price || 0),
        cost: Number(form.cost || 0),
        active: true,
        is_service: false,
      })
      .select()
      .single();

    if (error || !prod) {
      setSaving(false);
      return toast.error(error?.message || "Erro ao criar item");
    }

    const { error: invErr } = await supabase.from("inventory").insert({
      product_id: prod.id,
      quantity: Number(form.quantity || 0),
      min_quantity: Number(form.min_quantity || 0),
    });

    setSaving(false);
    if (invErr) return toast.error(invErr.message);

    toast.success("Item adicionado ao estoque!");
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar item ao estoque</DialogTitle>
          <DialogDescription>Cadastre o produto e a quantidade inicial</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Bolo decorado" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Bolos" />
            </div>
            <div className="grid gap-2">
              <Label>Unidade</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="un, kg, cx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Preço venda (R$)</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Custo (R$)</Label>
              <Input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Quantidade inicial</Label>
              <Input type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Mínimo (alerta)</Label>
              <Input type="number" min="0" step="1" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="hero" onClick={salvar} disabled={saving}>
            {saving ? "Salvando…" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
