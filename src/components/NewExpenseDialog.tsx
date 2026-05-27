import { useState, ReactNode } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  trigger: ReactNode;
  onCreated?: () => void;
}

const CATEGORIAS = [
  "Fornecedor",
  "Aluguel",
  "Energia",
  "Internet",
  "Água",
  "Salário",
  "Marketing",
  "Impostos",
  "Manutenção",
  "Transporte",
  "Outros",
];

export function NewExpenseDialog({ trigger, onCreated }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Outros");
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const [recurring, setRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  const reset = () => {
    setAmount("");
    setDescription("");
    setCategory("Outros");
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod("pix");
    setRecurring(false);
    setNotes("");
  };

  const salvar = async () => {
    if (!user) return toast.error("Faça login para registrar despesas");
    if (!description.trim()) return toast.error("Informe a descrição da despesa");
    if (!amount || Number(amount) <= 0) return toast.error("Informe um valor válido");

    setSaving(true);

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      description: description.trim(),
      amount: Number(amount),
      category: category || null,
      expense_date: expenseDate,
      payment_method: paymentMethod as any,
      recurring,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Despesa registrada! 📝");
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>Registre uma despesa do seu negócio</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Conta de luz"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão débito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={recurring}
              onCheckedChange={(v) => setRecurring(Boolean(v))}
            />
            <Label htmlFor="recurring" className="cursor-pointer font-normal">
              Despesa recorrente (mensal)
            </Label>
          </div>

          <div className="grid gap-2">
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="hero" onClick={salvar} disabled={saving}>
            {saving ? "Salvando…" : "Registrar despesa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
