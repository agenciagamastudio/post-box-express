import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Loader2, Trash2, CalendarOff } from "lucide-react";
import { toast } from "sonner";

type Props = {
  /** Post a ser editado. Quando ausente, o modal não carrega dados. */
  postId?: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Callback opcional após salvar/deletar com sucesso (ex.: refetch manual). */
  onSaved?: () => void;
};

const NETWORKS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "outras", label: "Outras" },
];

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  aprovacao: "Em aprovação",
  ajuste: "Ajuste",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
  erro: "Erro",
};

/** ISO -> valor de <input type="datetime-local"> em hora local. */
function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function EditPostModal({ postId, open, onOpenChange, onSaved }: Props) {
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [network, setNetwork] = useState("instagram");
  const [scheduledAt, setScheduledAt] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("rascunho");

  const [uploading, setUploading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Lista de clientes (apenas com o modal aberto).
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

  // Carrega o post ao abrir.
  useEffect(() => {
    if (!open || !postId) return;
    setLoadingPost(true);
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("title,caption,cover_url,network,status,scheduled_at,client_id")
        .eq("id", postId)
        .maybeSingle();
      setLoadingPost(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data) {
        toast.error("Post não encontrado");
        return;
      }
      setTitle(data.title ?? "");
      setCaption(data.caption ?? "");
      setCoverUrl(data.cover_url ?? "");
      setNetwork(data.network ?? "instagram");
      setStatus(data.status ?? "rascunho");
      setClientId(data.client_id ?? "");
      setScheduledAt(isoToLocalInput(data.scheduled_at));
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

  /** Validações compartilhadas antes de qualquer escrita. */
  function validate(): string | null {
    if (!title.trim()) return "O título não pode ficar vazio.";
    if (!clientId) return "Escolha um cliente.";
    if (scheduledAt) {
      const when = new Date(scheduledAt);
      if (when.getTime() < Date.now()) return "A data agendada não pode estar no passado.";
    }
    return null;
  }

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    qc.invalidateQueries({ queryKey: ["upcoming-posts"] });
    onSaved?.();
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Post inválido.");
      const err = validate();
      if (err) throw new Error(err);
      const { error } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          caption: caption || null,
          cover_url: coverUrl || null,
          network: network as any,
          status: status as any,
          client_id: clientId,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post salvo");
      invalidate();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unschedule = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Post inválido.");
      const { error } = await supabase
        .from("posts")
        .update({ status: "rascunho" as any, scheduled_at: null })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post desagendado");
      setStatus("rascunho");
      setScheduledAt("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Post inválido.");
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post excluído");
      invalidate();
      setConfirmDelete(false);
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setConfirmDelete(false);
    },
  });

  const busy = save.isPending || remove.isPending || unschedule.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar post</DialogTitle>
          </DialogHeader>

          {loadingPost ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
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
                <Label>Descrição / Legenda</Label>
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Imagem (capa)</Label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Rede social</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={STATUS_LABELS[status] ?? status} readOnly disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data / hora agendada</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                disabled={busy || !postId}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Deletar
              </Button>
              <Button
                variant="outline"
                onClick={() => unschedule.mutate()}
                disabled={busy || !postId}
              >
                <CalendarOff className="mr-1 h-4 w-4" /> Desagendar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancelar
              </Button>
              <Button onClick={() => save.mutate()} disabled={busy || uploading}>
                {save.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove.mutate();
              }}
              disabled={remove.isPending}
            >
              {remove.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
