import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  useInstagramInsights,
  useInstagramComments,
  useInstagramDMs,
  useReplyToComment,
  useSendDM,
} from "@/hooks/useInstagramMonitoring";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, MessageSquare, Mail } from "lucide-react";
import InsightsSection from "./monitoramento/InsightsSection";
import CommentsSection from "./monitoramento/CommentsSection";
import DMsSection from "./monitoramento/DMsSection";
import ShareInsightsButton from "@/components/insights/ShareInsightsButton";

export const Route = createFileRoute("/_authenticated/monitoramento")({
  component: MonitoringPage,
});

function MonitoringPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7days" | "30days">("7days");

  // Buscar contas Instagram conectadas
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["instagram-connections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("instagram_connections")
        .select("id, ig_username, client_id")
        .eq("status", "connected");
      return data || [];
    },
  });

  // Auto-select primeira conta se houver
  if (accounts && accounts.length > 0 && !selectedAccountId) {
    setSelectedAccountId(accounts[0].id);
  }

  // Hooks para dados
  const { data: insights, isLoading: insightsLoading } = useInstagramInsights(
    selectedAccountId,
    period,
    !!selectedAccountId,
  );
  const { data: comments, isLoading: commentsLoading } = useInstagramComments(
    selectedAccountId,
    25,
    !!selectedAccountId,
  );
  const { data: dms } = useInstagramDMs(selectedAccountId, !!selectedAccountId);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Monitoramento Instagram</h1>
          <p className="text-muted-foreground">
            Acompanhe insights, comentários e mensagens das suas contas
          </p>
        </div>

        {/* Controles */}
        <Card className="mb-6 p-4 flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Conta Instagram</label>
            <Select value={selectedAccountId || ""} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.ig_username || `Cliente: ${acc.client_id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ShareInsightsButton
            accountId={selectedAccountId}
            clientId={accounts?.find((a: any) => a.id === selectedAccountId)?.client_id || null}
            disabled={!selectedAccountId}
          />

          <Button variant="outline" onClick={() => setSelectedAccountId(null)}>
            Limpar
          </Button>
        </Card>

        {/* Sem conta selecionada */}
        {!selectedAccountId ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {accountsLoading ? "Carregando contas..." : "Selecione uma conta para começar"}
            </p>
          </Card>
        ) : (
          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList>
              <TabsTrigger value="insights" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="comments" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Comentários ({comments?.comments_count || 0})
              </TabsTrigger>
              <TabsTrigger value="dms" className="gap-2">
                <Mail className="w-4 h-4" />
                Mensagens Diretas
              </TabsTrigger>
            </TabsList>

            {/* Insights */}
            <TabsContent value="insights">
              <InsightsSection
                accountId={selectedAccountId}
                period={period}
                insights={insights?.insights}
                loading={insightsLoading}
              />
            </TabsContent>

            {/* Comentários */}
            <TabsContent value="comments">
              <CommentsSection
                accountId={selectedAccountId}
                comments={comments?.comments}
                loading={commentsLoading}
              />
            </TabsContent>

            {/* DMs */}
            <TabsContent value="dms">
              <DMsSection accountId={selectedAccountId} dmsCount={dms?.conversations_count} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
