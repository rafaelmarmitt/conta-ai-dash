import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink, HelpCircle } from "lucide-react";

const PGMEI_URL = "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/";

/**
 * Modal explicando como pagar o DAS via PGMEI da Receita Federal.
 */
export function ComoPagarDasModal({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="rounded-xl">
            <HelpCircle className="h-4 w-4" /> Como pagar o DAS?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Como pagar o seu DAS MEI</DialogTitle>
          <DialogDescription>
            O DAS é pago diretamente no portal oficial da Receita Federal (PGMEI). Veja o passo a passo:
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 text-sm text-foreground">
          {[
            "Acesse o portal PGMEI da Receita Federal.",
            "Informe o seu CNPJ e o código de acesso (ou conta gov.br).",
            "Clique em \"Emitir Guia de Pagamento (DAS)\".",
            "Selecione o mês de referência e gere o boleto / Pix.",
            "Pague pelo seu banco e, depois, marque como pago aqui no Conta.AI.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="h-6 w-6 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          💡 Dica: você também pode avisar o bot no WhatsApp — basta dizer
          <span className="font-semibold text-foreground"> "Paguei o DAS de {new Date().toLocaleString("pt-BR", { month: "long" })}"</span>
          {" "}— que atualizamos por aqui.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="hero" className="rounded-xl" asChild>
            <a href={PGMEI_URL} target="_blank" rel="noopener noreferrer">
              Abrir portal PGMEI <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
