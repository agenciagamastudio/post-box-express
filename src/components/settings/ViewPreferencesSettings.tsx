import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useViewPreferences, type EditMode } from "@/contexts/ViewPreferencesContext";

type ModeOption = {
  value: EditMode;
  label: string;
  description: string;
  preview: React.ReactNode;
};

/** Mini visual representations of each edit mode. */
function ModalPreview() {
  return (
    <div className="relative h-16 w-full overflow-hidden rounded-md border border-border bg-muted/40">
      <div className="absolute inset-0 grid grid-cols-3 gap-0.5 p-1.5 opacity-40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-sm bg-foreground/15" />
        ))}
      </div>
      <div className="absolute inset-0 bg-foreground/10" />
      <div className="absolute left-1/2 top-1/2 h-10 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-md border border-primary/60 bg-background shadow-lg" />
    </div>
  );
}

function InlinePreview() {
  return (
    <div className="h-16 w-full overflow-hidden rounded-md border border-border bg-muted/40 p-1.5">
      <div className="grid grid-cols-3 gap-0.5">
        <div className="h-4 rounded-sm bg-foreground/15" />
        <div className="h-4 rounded-sm border border-primary/60 bg-background" />
        <div className="h-4 rounded-sm bg-foreground/15" />
      </div>
      <div className="col-span-3 mt-1 h-6 rounded-sm border border-primary/60 bg-background" />
    </div>
  );
}

function SidebarPreview() {
  return (
    <div className="relative flex h-16 w-full overflow-hidden rounded-md border border-border bg-muted/40">
      <div className="grid flex-1 grid-cols-2 gap-0.5 p-1.5 opacity-40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-sm bg-foreground/15" />
        ))}
      </div>
      <div className="h-full w-2/5 border-l border-primary/60 bg-background shadow-lg" />
    </div>
  );
}

const MODE_OPTIONS: ModeOption[] = [
  {
    value: "modal",
    label: "Modal (padrão)",
    description: "Abre um popup centralizado para editar o post.",
    preview: <ModalPreview />,
  },
  {
    value: "inline",
    label: "Inline",
    description: "Edita o post no próprio calendário, abaixo do item.",
    preview: <InlinePreview />,
  },
  {
    value: "sidebar",
    label: "Sidebar",
    description: "Painel deslizável fixado à direita da tela.",
    preview: <SidebarPreview />,
  },
];

export function ViewPreferencesSettings() {
  const { editMode, setEditMode } = useViewPreferences();

  return (
    <Card className="space-y-4 p-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Preferências de Visualização</h3>
        <p className="text-sm text-muted-foreground">
          Escolha como deseja editar posts. A preferência é salva automaticamente.
        </p>
      </div>

      <RadioGroup
        value={editMode}
        onValueChange={(value) => setEditMode(value as EditMode)}
        className="grid gap-3 sm:grid-cols-3"
      >
        {MODE_OPTIONS.map((option) => {
          const id = `view-mode-${option.value}`;
          const selected = editMode === option.value;
          return (
            <Label
              key={option.value}
              htmlFor={id}
              className={cn(
                "flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent/50",
              )}
            >
              {option.preview}
              <div className="flex items-start gap-2">
                <RadioGroupItem id={id} value={option.value} className="mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium leading-none">{option.label}</span>
                  <p className="text-xs font-normal text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Label>
          );
        })}
      </RadioGroup>
    </Card>
  );
}
