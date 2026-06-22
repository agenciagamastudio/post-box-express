import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";

export type EditMode = "modal" | "inline" | "sidebar";

export type ViewPreferences = {
  editMode: EditMode;
};

export type ViewPreferencesContextType = {
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
};

const STORAGE_KEY = "gama-view-prefs";
const DEFAULT_EDIT_MODE: EditMode = "modal";

const ViewPreferencesContext = createContext<ViewPreferencesContextType | undefined>(undefined);

function getInitialEditMode(): EditMode {
  if (typeof window === "undefined") return DEFAULT_EDIT_MODE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<ViewPreferences>;
      if (
        parsed.editMode === "modal" ||
        parsed.editMode === "inline" ||
        parsed.editMode === "sidebar"
      ) {
        return parsed.editMode;
      }
    } catch {
      // Fallback to defaults if parse fails
    }
  }
  return DEFAULT_EDIT_MODE;
}

export function ViewPreferencesProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState<EditMode>(getInitialEditMode);

  const handleSetEditMode = (mode: EditMode) => {
    setEditMode(mode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ editMode: mode }));
  };

  return (
    <ViewPreferencesContext.Provider value={{ editMode, setEditMode: handleSetEditMode }}>
      {children}
    </ViewPreferencesContext.Provider>
  );
}

export function useViewPreferences(): ViewPreferencesContextType {
  const context = useContext(ViewPreferencesContext);
  if (!context) {
    throw new Error("useViewPreferences deve ser usado dentro de ViewPreferencesProvider");
  }
  return context;
}
