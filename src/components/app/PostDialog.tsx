import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId?: string | null;
};

export function PostDialog({ open, onOpenChange, postId }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [network, setNetwork] = useState("instagram");
  const [format, setFormat] = useState("feed");
  const [status, setStatus] = useState("rascunho");
  const [scheduledAt, setScheduledAt] = useState("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Carrega valores ao abrir em modo edição; reseta em modo "novo".
  useEffect(() => {
    if (!open) return;
    if (!postId) {
      setTitle("");
      setCaption("");
      setClientId("");
      setNetwork("instagram");
      setFormat("feed");
      setStatus("rascunho");
      setScheduledAt("");
      setCoverUrl("");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("title,caption,client_id,network,format,status,scheduled_at,cover_url")
        .eq("id", postId)
        .maybeSingle();
      if (!data) return;
      setTitle(data.title ?? "");
      setCaption(data.caption ?? "");
      setClientId(data.client_id ?? "");
      setNetwork(data.network ?? "instagram");
      setFormat(data.format ?? "feed");
      setStatus(data.status ?? "rascunho");
      setCoverUrl(data.cover_url ?? "");
      // ISO -> datetime-local (hora local)
      if (data.scheduled_at) {
        const d = new Date(data.scheduled_at);
        const p = (n: number) => String(n).padStart(2, "0");
        setScheduledAt(
          `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`,
        );
      } else {
        setScheduledAt("");
      }
    })();
  }, [open, postId]);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("post-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("post-media").getPublicUrl(path);
      setCoverUrl(data.publicUrl);
      toast.success("Imagem enviada");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const { data: clients } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      if (!clientId) throw new Error("Escolha um cliente");
      const payload = {
        title,
        caption,
        client_id: clientId,
        network: network as any,
        format: format as any,
        status: status as any,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        cover_url: coverUrl || null,
        created_by: u.user.id,
      };
      if (postId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", postId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Post salvo");
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      qc.invalidateQueries({ queryKey: ["upcoming-posts"] });
      onOpenChange(false);
      setTitle("");
      setCaption("");
      setScheduledAt("");
      setCoverUrl("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{postId ? "Editar post" : "Novo post"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lançamento da coleção"
            />
          </div>
          <div className="space-y-2">
            <Label>Legenda</Label>
            <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Imagem (capa) — obrigatória para publicar no Instagram</Label>
            <div className="flex items-center gap-3">
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt="capa"
                  className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
                />
              )}
              <Input type="file" accept="image/*" onChange={onPickImage} disabled={uploading} />
              {uploading && <span className="text-xs text-muted-foreground">enviando…</span>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Rede</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="x">X</SelectItem>
                  <SelectItem value="outras">Outras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="carrossel">Carrossel</SelectItem>
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="aprovacao">Em aprovação</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Agendar para</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !title}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
