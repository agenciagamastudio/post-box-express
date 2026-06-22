import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export type PeriodMode = "week" | "month" | "custom";

export type PeriodContextType = {
  mode: PeriodMode;
  range: { from: Date; to: Date };
  setMode: (mode: PeriodMode) => void;
  setCustomRange: (from: Date, to: Date) => void;
};

const STORAGE_KEY = "gama-global-period-filter";
const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PeriodMode>("month");
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMode(parsed.mode || "month");
        setRange({
          from: new Date(parsed.from),
          to: new Date(parsed.to),
        });
      } catch {
        // Fallback to defaults if parse fails
      }
    } else {
      // Initialize with current month
      const now = new Date();
      const from = startOfMonth(now);
      const to = endOfMonth(now);
      setRange({ from, to });
    }
  }, []);

  // Persist to localStorage when mode/range changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      }),
    );
  }, [mode, range]);

  // Handle mode changes
  const handleSetMode = (newMode: PeriodMode) => {
    setMode(newMode);
    const now = new Date();
    if (newMode === "week") {
      setRange({ from: startOfWeek(now), to: endOfWeek(now) });
    } else if (newMode === "month") {
      setRange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
    // custom mode: keeps existing range until setCustomRange is called
  };

  const handleSetCustomRange = (from: Date, to: Date) => {
    setMode("custom");
    setRange({ from, to });
  };

  return (
    <PeriodContext.Provider
      value={{
        mode,
        range,
        setMode: handleSetMode,
        setCustomRange: handleSetCustomRange,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriodFilter(): PeriodContextType {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriodFilter deve ser usado dentro de PeriodProvider");
  }
  return context;
}
