import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type SearchResult = {
  id: string;
  title: string;
  type: "client" | "post" | "task";
};

export function GlobalSearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Register keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search query (only enabled with 2+ chars)
  const { data: results } = useQuery<SearchResult[]>({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (query.length < 2) return [];

      const searchTerm = `%${query}%`;

      const [clientsRes, postsRes, tasksRes] = await Promise.all([
        supabase.from("clients").select("id,name").ilike("name", searchTerm).limit(5),
        supabase.from("posts").select("id,title").ilike("title", searchTerm).limit(5),
        supabase.from("tasks").select("id,title").ilike("title", searchTerm).limit(5),
      ]);

      const clients: SearchResult[] = (clientsRes.data || []).map((c) => ({
        id: c.id,
        title: c.name,
        type: "client" as const,
      }));

      const posts: SearchResult[] = (postsRes.data || []).map((p) => ({
        id: p.id,
        title: p.title || "Post sem título",
        type: "post" as const,
      }));

      const tasks: SearchResult[] = (tasksRes.data || []).map((t) => ({
        id: t.id,
        title: t.title || "Tarefa sem título",
        type: "task" as const,
      }));

      return [...clients, ...posts, ...tasks];
    },
    enabled: query.length >= 2,
  });

  const handleSelect = (result: SearchResult) => {
    setOpen(false);

    // Navigate based on type
    if (result.type === "client") {
      router.navigate({ to: "/clientes" });
    } else if (result.type === "post") {
      router.navigate({ to: "/kanban" });
    } else if (result.type === "task") {
      router.navigate({ to: "/tarefas" });
    }
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar clientes, posts, tarefas... (Ctrl+K)"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length < 2 ? (
            <CommandEmpty>Digite pelo menos 2 caracteres para buscar...</CommandEmpty>
          ) : results && results.length > 0 ? (
            <>
              {results.some((r) => r.type === "client") && (
                <CommandGroup heading="Clientes">
                  {results
                    .filter((r) => r.type === "client")
                    .map((result) => (
                      <CommandItem key={result.id} onSelect={() => handleSelect(result)}>
                        {result.title}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {results.some((r) => r.type === "post") && (
                <CommandGroup heading="Posts">
                  {results
                    .filter((r) => r.type === "post")
                    .map((result) => (
                      <CommandItem key={result.id} onSelect={() => handleSelect(result)}>
                        {result.title}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {results.some((r) => r.type === "task") && (
                <CommandGroup heading="Tarefas">
                  {results
                    .filter((r) => r.type === "task")
                    .map((result) => (
                      <CommandItem key={result.id} onSelect={() => handleSelect(result)}>
                        {result.title}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>

      {/* Trigger button para modo mobile/visual */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Busca global (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
      </Button>
    </>
  );
}
