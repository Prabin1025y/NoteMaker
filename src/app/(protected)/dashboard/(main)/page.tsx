"use client";
import {
    Plus,
    FileText,
    FolderOpen,
    Pin,
    ChevronRight,
    Search as SearchIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { NoteCardSkeleton } from "@/skeletons/NoteCardSkeleton";
import { resolveFolderColor } from "@/utils/folderColors";
import type { FolderOption } from "@/types/misc";
import { useGetAllNotes } from "@/hooks/custom/useNotes";
import { useDashboardStore } from "@/Context/DashboardStore";
import { useGetAllFolders } from "@/hooks/custom/useFolders";
import { greeting, sortNotes } from "@/utils/UtilFunctions";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import NoteCollection from "@/components/Dashboard/NoteCollection";
import { useRouter } from "next/navigation";

const HomePage = () => {
    const { data: notes = [], isLoading: isNotesLoading } = useGetAllNotes();
    const { data: folders = [] } = useGetAllFolders();

    const router = useRouter();

    const { searchQuery, setIsCreateModalOpen, sort, setView } =
        useDashboardStore();

    // Search across title + description.
    const searched = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return notes;
        return notes.filter(
            (n) =>
                (n.title || "").toLowerCase().includes(q) ||
                (n.description || "").toLowerCase().includes(q),
        );
    }, [notes, searchQuery]);

    const pinned = useMemo(
        () =>
            sortNotes(
                searched.filter((n) => n.isPinned),
                sort,
            ),
        [searched, sort],
    );

    // In the "all" view, pinned notes get their own section, so keep them out
    // of the main list. In scoped views they float to the top instead.
    const mainList = useMemo(() => {
        return sortNotes(
            searched.filter((n) => !n.isPinned),
            sort,
        );
    }, [searched, sort]);

    useEffect(() => {
        setView({ kind: "all" });
    }, []);

    const onCreateNote = () => {
        setIsCreateModalOpen(true);
    };

    const meta = {
        eyebrow: null,
        title: `${greeting()} 👋`,
        subtitle:
            notes.length === 0
                ? "Create your first note to get started."
                : `You have ${notes.length} ${notes.length === 1 ? "note" : "notes"} across ${folders.length} ${folders.length === 1 ? "folder" : "folders"}.`,
    };

    /* --------------------------- Folder tile --------------------------- */
    const FolderTile = ({ folder }: { folder: FolderOption }) => {
        const color = resolveFolderColor(folder.color);
        const count = notes.filter((n) => n.folderId === folder.id).length;
        return (
            <button
                type="button"
                onClick={() => router.push(`/dashboard/folder/${folder.id}`)}
                className="group flex items-center gap-3 rounded-xl border border-muted bg-card/60 p-3 text-left outline-none transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-strong focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
            >
                <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                    style={{
                        backgroundColor: color.soft,
                        border: `1px solid ${color.ring}`,
                    }}
                >
                    <FolderOpen
                        size={18}
                        style={{ color: color.dot }}
                    />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                        {folder.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground tabular-nums">
                        {count} {count === 1 ? "note" : "notes"}
                    </span>
                </span>
                <ChevronRight
                    size={16}
                    className="shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                />
            </button>
        );
    };

    const SectionLabel = ({
        children,
        icon,
    }: {
        children: React.ReactNode;
        icon?: React.ReactNode;
    }) => (
        <div className="mb-3 flex items-center gap-2">
            {icon}
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {children}
            </h2>
        </div>
    );

    return (
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
            {/* Header */}
            <DashboardHeader
                title={meta.title}
                filteredNotes={searched}
            />

            {/* Loading */}
            {isNotesLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <NoteCardSkeleton key={i} />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                /* Empty: no notes at all */
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-strong bg-background/80 px-6 py-16 text-center">
                    <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-background text-muted-foreground">
                        <FileText size={24} />
                    </span>
                    <h3 className="text-[16px] font-semibold text-ink">
                        No notes yet
                    </h3>
                    <p className="mt-1 max-w-xs text-[13px] text-muted-foreground text-pretty">
                        Create your first note and start building it block by
                        block.
                    </p>
                    <button
                        type="button"
                        onClick={onCreateNote}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground outline-none transition-[transform,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring) focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                        <Plus
                            size={16}
                            strokeWidth={2.5}
                        />
                        New note
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-9">
                    {/* Quick create (all view only) */}
                    {!searchQuery.trim() && (
                        <button
                            type="button"
                            onClick={onCreateNote}
                            className="group flex items-center gap-3 rounded-xl border border-dashed border-strong bg-card/50 px-4 py-3.5 text-left outline-none transition-colors duration-150 hover:border-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
                        >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary transition-colors duration-150 group-hover:bg-primary/40">
                                <Plus
                                    size={18}
                                    strokeWidth={2.5}
                                />
                            </span>
                            <span>
                                <span className="block text-[13px] font-semibold text-ink">
                                    Start a new note
                                </span>
                                <span className="block text-[12px] text-muted-foreground">
                                    Capture an idea, a lecture, or a plan.
                                </span>
                            </span>
                        </button>
                    )}

                    {/* Folder browser (all view only) */}
                    {!searchQuery.trim() && folders.length > 0 && (
                        <section>
                            <SectionLabel
                                icon={
                                    <FolderOpen
                                        size={14}
                                        className="text-muted-foreground"
                                    />
                                }
                            >
                                Folders
                            </SectionLabel>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {folders.map((folder) => (
                                    <FolderTile
                                        key={folder.id}
                                        folder={folder}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Pinned (all view only) */}
                    {pinned.length > 0 && (
                        <section>
                            <SectionLabel
                                icon={
                                    <Pin
                                        size={14}
                                        className="fill-current text-brand"
                                    />
                                }
                            >
                                Pinned
                            </SectionLabel>
                            <NoteCollection list={pinned} />
                        </section>
                    )}

                    {/* Main list */}
                    <section>
                        <SectionLabel
                            icon={
                                <FileText
                                    size={14}
                                    className="text-muted-foreground"
                                />
                            }
                        >
                            {searchQuery.trim() ? "Result" : "Recent notes"}
                        </SectionLabel>

                        {mainList.length > 0 ? (
                            <NoteCollection list={mainList} />
                        ) : (
                            <div className="flex flex-col items-center rounded-2xl border border-dashed border-strong bg-background/80 px-6 py-14 text-center">
                                <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/20 text-primary">
                                    <SearchIcon size={20} />
                                </span>
                                <h3 className="text-[14px] font-semibold text-ink">
                                    No matching notes
                                </h3>
                                <p className="mt-1 max-w-xs text-[13px] text-muted-foreground text-pretty">
                                    Try a different search term.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default HomePage;
