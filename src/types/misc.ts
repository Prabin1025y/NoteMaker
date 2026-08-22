import type { FolderColorKey } from "@/utils/folderColors";

export type FolderOption = {
    id: string;
    name: string;
    color?: FolderColorKey | string | null;
    icon?: string | null;
    isFavorite?: boolean;
    notesCount?: number;
};

/** The active surface the dashboard is showing. */
export type DashboardView =
    | { kind: "all" }
    | { kind: "favorites" }
    | { kind: "folder"; folderId: string };

/** How the note grid/list is ordered. */
export type NoteSortKey = "updated" | "created" | "title";

/** Grid of cards vs. compact rows. */
export type NoteLayout = "grid" | "list";
