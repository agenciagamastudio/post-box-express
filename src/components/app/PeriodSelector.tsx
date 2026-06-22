import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePeriodFilter } from "@/contexts/PeriodContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export function PeriodSelector() {
  const { mode, setMode, range, setCustomRange } = usePeriodFilter();
  const [fromDate, setFromDate] = useState(range.from.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(range.to.toISOString().split("T")[0]);

  const handleCustomRange = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from <= to) {
      setCustomRange(from, to);
    }
  };

  const modeLabel =
    mode === "week" ? "Esta semana" : mode === "month" ? "Este mês" : "Personalizado";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {modeLabel}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Período</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem checked={mode === "week"} onCheckedChange={() => setMode("week")}>
          <span className="text-sm">Esta semana</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={mode === "month"}
          onCheckedChange={() => setMode("month")}
        >
          <span className="text-sm">Este mês</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={mode === "custom"}
          onCheckedChange={() => setMode("custom")}
        >
          <span className="text-sm">Personalizado</span>
        </DropdownMenuCheckboxItem>

        {mode === "custom" && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-3 space-y-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">De:</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Até:</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <Button size="sm" onClick={handleCustomRange} className="w-full h-8">
                Aplicar
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
