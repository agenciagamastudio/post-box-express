import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface Props {
  accountId: string;
  dmsCount: number | undefined;
}

export default function DMsSection({ accountId, dmsCount }: Props) {
  return (
    <div className="space-y-4">
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <MessageCircle className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-semibold mb-2">Mensagens Diretas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dmsCount ? `${dmsCount} conversa(s) ativa(s)` : "Carregando conversas..."}
            </p>
            <Badge variant="outline">
              Fase 3 - Em Desenvolvimento
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-dashed">
        <p className="text-sm text-muted-foreground">
          ℹ️ <strong>Em breve:</strong> Lista de conversas, histórico de mensagens e resposta inline (Fase 3).
        </p>
      </Card>
    </div>
  );
}
