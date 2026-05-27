import { useEffect, useState, ReactNode } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Produto { id: string; name: string; price: number }
interface Cliente { id: string; name: string }
interface Item { product_id?: string; product_name: string; quantity: number; unit_price: number }

interface Props {
  trigger: ReactNode;
  onCreated?: () => void;
}

export function NewSaleDialog({ trigger, onCreated }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [customerId, setCustomerId] = useState<string>("none");
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const [status, setStatus] = useState<string>("pago");
  const [discount, setDiscount] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<Item[]>([{ product_name: "", quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("products").select("id, name, price").eq("user_id", user.id).eq("active", true),
        supabase.from("customers").select("id, name").eq("user_id", user.id).order("name"),
      ]);
      setProdutos(p ?? []);
      setClientes(c ?? []);
    })();
  }, [open, user]);

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0) - Number(discount || 0);

  const updateItem = (idx: number, patch: Partial<Item>) => {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const selecionarProduto = (idx: number, productId: string) => {
    const prod = produtos.find((p) => p.id === productId);
    if (!prod) return;
    updateItem(idx, { product_id: prod.id, product_name: prod.name, unit_price: Number(prod.price) });
  };

  const reset = () => {
    setCustomerId("none");
    setPaymentMethod("pix");
    setStatus("pago");
    setDiscount("0");
    setNotes("");
    setItems([{ product_name: "", quantity: 1, unit_price: 0 }]);
  };

  const salvar = async () => {
    if (!user) return toast.error("Faça login para registrar vendas");
    const validItems = items.filter((i) => i.product_name && i.quantity > 0);
    if (validItems.length === 0) return toast.error("Adicione pelo menos um item");

    setSaving(true);
    const subtotal = validItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const totalFinal = Math.max(subtotal - Number(discount || 0), 0);

    const { data: sale, error } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        customer_id: customerId === "none" ? null : customerId,
        total: totalFinal,
        discount: Number(discount || 0),
        payment_method: paymentMethod as any,
        status: status as any,
        sold_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select()
      .single();

    if (error || !sale) {
      setSaving(false);
      return toast.error(error?.message || "Erro ao salvar venda");
    }

    const { error: itemsErr } = await supabase.from("sale_items").insert(
      validItems.map((it) => ({
        sale_id: sale.id,
        product_id: it.product_id ?? null,
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        subtotal: it.quantity * it.unit_price,
      })),
    );

    setSaving(false);

    if (itemsErr) return toast.error(itemsErr.message);

    if (customerId !== "none") {
      await supabase
        .from("customers")
        .update({ last_purchase_at: new Date().toISOString() })
        .eq("id", customerId);
    }

    toast.success("Venda registrada! 🎉");
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova venda</DialogTitle>
          <DialogDescription>Registre uma venda manualmente no seu Conta.AI</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Cliente (opcional)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Sem cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Itens</Label>
            {items.map((it, idx) => (
              <div key={idx} className="grid gap-2 p-3 rounded-lg border border-border">
                {produtos.length > 0 && (
                  <Select value={it.product_id ?? ""} onValueChange={(v) => selecionarProduto(idx, v)}>
                    <SelectTrigger><SelectValue placeholder="Selecionar do catálogo" /></SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} · R$ {Number(p.price).toFixed(2)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  placeholder="Nome do item"
                  value={it.product_name}
                  onChange={(e) => updateItem(idx, { product_name: e.target.value, product_id: undefined })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Quantidade</Label>
                    <Input
                      type="number" min="1" step="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Preço unit. (R$)</Label>
                    <Input
                      type="number" min="0" step="0.01"
                      value={it.unit_price}
                      onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="text-destructive justify-self-end"
                    onClick={() => setItems((a) => a.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remover
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button" variant="outline" size="sm" className="w-full rounded-xl"
              onClick={() => setItems((a) => [...a, { product_name: "", quantity: 1, unit_price: 0 }])}
            >
              <Plus className="h-4 w-4" /> Adicionar item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="reembolsado">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Desconto (R$)</Label>
              <Input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Total</Label>
              <div className="h-10 px-3 rounded-md border border-input bg-muted flex items-center font-bold text-primary">
                R$ {total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Observações</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="hero" onClick={salvar} disabled={saving}>
            {saving ? "Salvando…" : "Registrar venda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
