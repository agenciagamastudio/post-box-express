import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({ component: Settings });

function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle();
      setName(data?.full_name ?? "");
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) await supabase.from("profiles").update({ full_name: name }).eq("id", u.user.id);
    setSaving(false);
    toast.success("Perfil atualizado");
  };

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Configurações" description="Seu perfil no Pode Postar." />
      <Card className="mt-6 max-w-lg space-y-4 p-6">
        <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label>E-mail</Label><Input value={email} disabled /></div>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </Card>
    </div>
  );
}
