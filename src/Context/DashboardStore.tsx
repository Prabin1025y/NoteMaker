import { DashboardView } from "@/types/misc";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DashboardStoreType {
    searchQuery: string;
    view: DashboardView;
    isCreateModalOpen: boolean;
    sidebarOpen: boolean;

    setSearchQuery: (query: string) => void;
    setView: (view: DashboardView) => void;
    setIsCreateModalOpen: (value: boolean) => void;
    setSidebarOpen: (value: boolean) => void;
}

export const useDashboardStore = create<DashboardStoreType>()(
    devtools((set) => ({
        searchQuery: "",
        view: { kind: "all" },
        isCreateModalOpen: false,
        sidebarOpen: false,

        setSearchQuery: (query) => set({ searchQuery: query }),
        setView: (view) => set({ view: view }),
        setIsCreateModalOpen: (value) => set({ isCreateModalOpen: value }),
        setSidebarOpen: (value) => set({ sidebarOpen: value }),
    })),
);
