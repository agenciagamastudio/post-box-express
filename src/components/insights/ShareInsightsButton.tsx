import { Share2, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface ShareInsightsButtonProps {
  accountId: string | null;
  clientId: string | null;
  disabled?: boolean;
}

export default function ShareInsightsButton({
  accountId,
  clientId,
  disabled = false,
}: ShareInsightsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateLink() {
    if (!accountId) {
      setError("Selecione uma conta Instagram");
      return;
    }

    if (!clientId) {
      setError("Conta não tem cliente associado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/instagram/insights/portal/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          clientId,
          period: "30days",
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error(`[generate-link] Status: ${response.status}, Body:`, responseText);
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error || "Falha ao gerar link");
      }

      const data = JSON.parse(responseText);
      setUrl(data.url);

      // Copiar para clipboard automaticamente
      await navigator.clipboard.writeText(data.url);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("[generateLink error]", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || loading} className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          {!url ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Gerar link compartilhável</p>
              <p className="text-xs text-muted-foreground">
                Crie um link seguro para compartilhar este relatório com seu cliente. O link expira
                em 30 dias.
              </p>

              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

              <Button onClick={generateLink} disabled={loading} className="w-full gap-2">
                {loading ? "Gerando..." : "Gerar Link"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm font-medium">Link criado!</p>
              </div>

              <div className="bg-gray-50 p-3 rounded border border-gray-200 break-all">
                <p className="text-xs text-gray-600">{url}</p>
              </div>

              <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer gap-2">
                <Copy className="w-4 h-4" />
                <span>{copied ? "Copiado!" : "Copiar Link"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir em Nova Aba</span>
              </DropdownMenuItem>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setUrl(null);
                  setError(null);
                }}
              >
                Criar Outro Link
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
