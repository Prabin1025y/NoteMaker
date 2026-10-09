import { DashboardView, NoteLayout, NoteSortKey } from "@/types/misc";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DashboardStoreType {
    searchQuery: string;
    view: DashboardView;
    isCreateModalOpen: boolean;
    sidebarOpen: boolean;
    sort: NoteSortKey;
    layout: NoteLayout;

    setSearchQuery: (query: string) => void;
    setView: (view: DashboardView) => void;
    setIsCreateModalOpen: (value: boolean) => void;
    setSidebarOpen: (value: boolean) => void;
    setSort: (value: NoteSortKey) => void;
    setLayout: (value: NoteLayout) => void;
}

export const useDashboardStore = create<DashboardStoreType>()(
    devtools((set) => ({
        searchQuery: "",
        view: { kind: "all" },
        isCreateModalOpen: false,
        sidebarOpen: false,
        sort: "updated",
        layout: "grid",

        setSearchQuery: (query) => set({ searchQuery: query }),
        setView: (view) => set({ view: view }),
        setIsCreateModalOpen: (value) => set({ isCreateModalOpen: value }),
        setSidebarOpen: (value) => set({ sidebarOpen: value }),
        setSort: (value) => set({ sort: value }),
        setLayout: (value) => set({ layout: value }),
    })),
);
