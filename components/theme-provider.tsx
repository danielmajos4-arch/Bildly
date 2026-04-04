"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export type ThemeId = "emerald" | "blue" | "purple" | "orange" | "rose" | "slate";

export const THEMES: { id: ThemeId; name: string; hex: string }[] = [
  { id: "emerald", name: "Emerald", hex: "#059669" },
  { id: "blue", name: "Ocean Blue", hex: "#2563eb" },
  { id: "purple", name: "Royal Purple", hex: "#9333ea" },
  { id: "orange", name: "Sunset Orange", hex: "#ea580c" },
  { id: "rose", name: "Rose Pink", hex: "#e11d48" },
  { id: "slate", name: "Slate", hex: "#334155" },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "emerald",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const [theme, setThemeState] = useState<ThemeId>("emerald");

  useEffect(() => {
    if (currentUser?.colorTheme) {
      const t = currentUser.colorTheme as ThemeId;
      setThemeState(t);
      document.documentElement.setAttribute("data-theme", t);
    }
  }, [currentUser?.colorTheme]);

  const setTheme = useCallback(
    async (newTheme: ThemeId) => {
      setThemeState(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      try {
        await updateProfile({ colorTheme: newTheme });
      } catch {
        // Silently fail - theme is already applied visually
      }
    },
    [updateProfile]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
