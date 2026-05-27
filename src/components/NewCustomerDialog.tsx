import { useState, ReactNode } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  trigger: ReactNode;
  onCreated?: () => void;
}

export function NewCustomerDialog({ trigger, onCreated }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
    notes: "",
  });

  const reset = () => setForm({ name: "", phone: "", email: "", document: "", notes: "" });

  const salvar = async () => {
    if (!user) return toast.error("Faça login para adicionar clientes");
    if (!form.name.trim()) return toast.error("Informe o nome do cliente");

    setSaving(true);
    const { error } = await supabase.from("customers").insert({
      user_id: user.id,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      document: form.document.trim() || null,
      notes: form.notes.trim() || null,
      total_spent: 0,
    });

    setSaving(false);
    if (error) return toast.error(error.message);

    toast.success("Cliente cadastrado!");
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>Cadastre um cliente manualmente no CRM</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="c-name">Nome *</Label>
            <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maria Silva" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="c-phone">Telefone</Label>
              <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99888-7766" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-doc">CPF/CNPJ</Label>
              <Input id="c-doc" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} placeholder="Opcional" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-email">E-mail</Label>
            <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-notes">Observações</Label>
            <Textarea id="c-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="hero" onClick={salvar} disabled={saving}>
            {saving ? "Salvando…" : "Cadastrar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
