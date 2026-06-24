import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Reply } from "lucide-react";
import { useReplyToComment } from "@/hooks/useInstagramMonitoring";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  from?: { username: string; name: string };
  like_count: number;
  replies?: { data: Comment[] };
  mock?: boolean;
}

interface Props {
  accountId: string;
  comments: Comment[] | undefined;
  loading: boolean;
}

export default function CommentsSection({ accountId, comments, loading }: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const replyMutation = useReplyToComment();

  if (loading) {
    return <Card className="p-8 text-center">Carregando comentários...</Card>;
  }

  if (!comments || comments.length === 0) {
    return <Card className="p-8 text-center text-muted-foreground">Sem comentários</Card>;
  }

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    replyMutation.mutate(
      { commentId, accountId, message: replyText },
      {
        onSuccess: () => {
          toast.success("Resposta enviada!");
          setReplyingTo(null);
          setReplyText("");
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarImage src="" />
              <AvatarFallback>{comment.from?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>

            {/* Conteúdo */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {comment.from?.name || comment.from?.username || "Usuário desconhecido"}
                  </p>
                  <p className="text-xs text-muted-foreground">@{comment.from?.username}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {/* Texto do comentário */}
              <p className="mt-2 text-sm">{comment.text}</p>

              {/* Ações */}
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground">
                  <Heart className="w-4 h-4" />
                  {comment.like_count}
                </button>
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Reply className="w-4 h-4" />
                  Responder
                </button>
              </div>

              {/* Replies */}
              {comment.replies?.data && comment.replies.data.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-muted pl-3 ml-2">
                  {comment.replies.data.map((reply) => (
                    <div key={reply.id} className="text-sm">
                      <p className="font-semibold text-xs">
                        {reply.from?.name || reply.from?.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Input
                    placeholder="Digite sua resposta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={replyMutation.isPending}
                  >
                    Enviar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
