import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  paginationOptions: Array<number>;
  addPaginationOption: (option: number) => void;
  removePaginationOption: (option: number) => void;
  formatDates: boolean;
  setFormatDates: (value: boolean) => void;
  showImagesPreview: boolean;
  setShowImagesPreview: (value: boolean) => void;
};

const useSettingsStoreBase = create<SettingsState>()(
  persist(
    (set) => ({
      paginationOptions: [10, 20, 50, 100],
      addPaginationOption: (option) =>
        set((state) => {
          if (state.paginationOptions.includes(option)) {
            return state;
          }
          return {
            paginationOptions: [...state.paginationOptions, option].sort(
              (a, b) => a - b,
            ),
          };
        }),
      removePaginationOption: (option) =>
        set((state) => ({
          paginationOptions: state.paginationOptions.filter(
            (o) => o !== option,
          ),
        })),
      formatDates: true,
      setFormatDates: (value) => set({ formatDates: value }),
      showImagesPreview: true,
      setShowImagesPreview: (value) => set({ showImagesPreview: value }),
    }),
    {
      name: "settings-storage",
    },
  ),
);

export const useSettingsStore = createSelectors(useSettingsStoreBase);
