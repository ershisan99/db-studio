import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

type UiState = {
  showSidebar: boolean;
  toggleSidebar: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const useUiStoreBase = create<UiState>()(
  persist(
    (set) => {
      return {
        showSidebar: false,
        toggleSidebar: () => {
          set((state) => ({ showSidebar: !state.showSidebar }));
        },
        theme: "system",
        setTheme: (theme) => set({ theme }),
      };
    },
    {
      name: "ui-storage",
    },
  ),
);

export const useUiStore = createSelectors(useUiStoreBase);
