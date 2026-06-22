import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/setup")({
  component: SetupPage,
});

function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    ok: boolean;
    message?: string;
    instruction?: string;
    table_exists?: boolean;
  } | null>(null);

  async function checkStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/setup/status");
      const data = await res.json();
      setStatus({
        ok: data.ok,
        message: data.portal_table_exists
          ? "✅ Tabela instagram_report_links já existe"
          : "⏳ Tabela ainda não foi criada",
        table_exists: data.portal_table_exists,
      });
    } catch (err) {
      setStatus({
        ok: false,
        message: "Erro ao verificar status",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Setup — Portal de Insights</h1>
          <p className="text-muted-foreground">
            Verificar e configurar a infraestrutura necessária
          </p>
        </div>

        {/* Card de Status */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status da Tabela</h2>

          {status ? (
            <div className={`p-4 rounded-lg ${status.ok ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {status.table_exists ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {status.message}
                  </p>
                  {status.instruction && (
                    <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                      {status.instruction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Clique em "Verificar Status" para checar se a tabela existe
            </p>
          )}

          <Button onClick={checkStatus} disabled={loading} className="mt-4">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Status"
            )}
          </Button>
        </Card>

        {/* Instruções */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instruções de Setup</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">1️⃣ Fazer Login no Supabase CLI</h3>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                supabase login
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Isso abrirá seu navegador. Confirme o acesso e volte ao terminal.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">2️⃣ Fazer Push da Migration</h3>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                supabase db push
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Selecione o projeto <code>ewerfpxniciegagnretb</code>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">3️⃣ Verificar Status</h3>
              <p className="text-xs text-muted-foreground">
                Clique no botão acima para confirmar que a tabela foi criada
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200 mt-4">
              <p className="text-xs text-blue-900">
                <strong>💡 O que será criado:</strong>
              </p>
              <ul className="text-xs text-blue-900 mt-2 space-y-1 ml-4">
                <li>✅ Tabela <code>instagram_report_links</code></li>
                <li>✅ 3 índices para performance</li>
                <li>✅ RLS policies para segurança</li>
                <li>✅ Auto-expiry em 30 dias</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
