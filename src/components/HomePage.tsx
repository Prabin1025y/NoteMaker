"use client";
import { useNoteStore } from "@/Context/DataStore";
import Link from "next/link";
import {
    Plus,
    LayoutList,
    FileText,
    Trash2,
    FolderOpen,
    Star,
    Pin,
    LayoutGrid,
    List,
    ArrowDownUp,
    Check,
    Menu,
    ChevronRight,
    Search as SearchIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NoteCardSkeleton } from "@/skeletons/NoteCardSkeleton";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveFolderColor } from "@/utils/folderColors";
import type {
    DashboardView,
    FolderOption,
    NoteLayout,
    NoteSortKey,
} from "@/types/misc";
import type { NoteType } from "@/types/dataSotoreTypes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HomePageProps {
    view: DashboardView;
    setView: (view: DashboardView) => void;
    folders: FolderOption[];
    searchQuery: string;
    fetching: boolean;
    onCreateNote: () => void;
    onOpenSidebar: () => void;
}

const SORT_OPTIONS: { key: NoteSortKey; label: string }[] = [
    { key: "updated", label: "Last edited" },
    { key: "created", label: "Date created" },
    { key: "title", label: "Title (A–Z)" },
];

const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const sortNotes = (list: NoteType[], sort: NoteSortKey) => {
    const copy = [...list];
    if (sort === "title") {
        return copy.sort((a, b) =>
            (a.title || "Untitled").localeCompare(b.title || "Untitled"),
        );
    }
    const field = sort === "created" ? "createdAt" : "updatedAt";
    return copy.sort(
        (a, b) => new Date(b[field]).getTime() - new Date(a[field]).getTime(),
    );
};

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
};

const HomePage = ({
    view,
    setView,
    folders,
    searchQuery,
    fetching,
    onCreateNote,
    onOpenSidebar,
}: HomePageProps) => {
    const { notes, deleteNote, toggleNoteFavorite, toggleNotePin } =
        useNoteStore();
    const [sort, setSort] = useState<NoteSortKey>("updated");
    const [layout, setLayout] = useState<NoteLayout>("grid");
    const [deleting, setDeleting] = useState<string | null>(null);

    const folderMap = useMemo(() => {
        const map = new Map<string, FolderOption>();
        folders.forEach((f) => map.set(f.id, f));
        return map;
    }, [folders]);

    const activeFolder =
        view.kind === "folder" ? folderMap.get(view.folderId) : undefined;

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

    // Scope to the active view.
    const scoped = useMemo(() => {
        if (view.kind === "favorites")
            return searched.filter((n) => n.isFavorite);
        if (view.kind === "folder")
            return searched.filter((n) => n.folderId === view.folderId);
        return searched;
    }, [searched, view]);

    const pinned = useMemo(
        () => sortNotes(scoped.filter((n) => n.isPinned), sort),
        [scoped, sort],
    );

    // In the "all" view, pinned notes get their own section, so keep them out
    // of the main list. In scoped views they float to the top instead.
    const mainList = useMemo(() => {
        if (view.kind === "all") {
            return sortNotes(scoped.filter((n) => !n.isPinned), sort);
        }
        const p = sortNotes(scoped.filter((n) => n.isPinned), sort);
        const rest = sortNotes(scoped.filter((n) => !n.isPinned), sort);
        return [...p, ...rest];
    }, [scoped, sort, view]);

    const handleDelete = async (note: NoteType) => {
        const confirmed = window.confirm(
            `Delete "${note.title || "Untitled"}"? This can't be undone.`,
        );
        if (!confirmed) return;

        try {
            setDeleting(note.id);
            const res = await apiFetch(
                `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes/${note.id}`,
                { method: "DELETE" },
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            deleteNote(note.id);
            toast.success("Note deleted", { toasterId: "normal" });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Couldn't delete note",
                { toasterId: "normal" },
            );
        } finally {
            setDeleting(null);
        }
    };

    const headerMeta = () => {
        if (view.kind === "favorites") {
            return {
                eyebrow: "Collection",
                title: "Favorites",
                subtitle: `${scoped.length} starred ${scoped.length === 1 ? "note" : "notes"}`,
            };
        }
        if (view.kind === "folder") {
            return {
                eyebrow: "Folder",
                title: activeFolder?.name || "Folder",
                subtitle: `${scoped.length} ${scoped.length === 1 ? "note" : "notes"}`,
            };
        }
        return {
            eyebrow: null,
            title: `${greeting()} 👋`,
            subtitle:
                notes.length === 0
                    ? "Create your first note to get started."
                    : `You have ${notes.length} ${notes.length === 1 ? "note" : "notes"} across ${folders.length} ${folders.length === 1 ? "folder" : "folders"}.`,
        };
    };

    const meta = headerMeta();

    /* ---------------------------- Note card ---------------------------- */
    const IconButton = ({
        label,
        active,
        activeClass,
        onClick,
        children,
        alwaysVisible,
    }: {
        label: string;
        active?: boolean;
        activeClass?: string;
        onClick: () => void;
        children: React.ReactNode;
        alwaysVisible?: boolean;
    }) => (
        <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            className={cn(
                "grid h-8 w-8 place-items-center rounded-lg outline-none transition-colors duration-150",
                "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]",
                "active:scale-[0.92]",
                active
                    ? cn("opacity-100", activeClass)
                    : cn(
                          "text-faint hover:bg-paper hover:text-ink",
                          alwaysVisible
                              ? "opacity-100"
                              : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                      ),
            )}
        >
            {children}
        </button>
    );

    const NoteActions = ({ note }: { note: NoteType }) => (
        <div className="flex items-center gap-0.5">
            <IconButton
                label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                active={note.isFavorite}
                activeClass="text-brand hover:bg-brand-soft"
                onClick={() => toggleNoteFavorite(note.id)}
            >
                <Star
                    size={15}
                    className={note.isFavorite ? "fill-current" : ""}
                />
            </IconButton>
            <IconButton
                label={note.isPinned ? "Unpin note" : "Pin note"}
                active={note.isPinned}
                activeClass="text-brand hover:bg-brand-soft"
                onClick={() => toggleNotePin(note.id)}
            >
                <Pin
                    size={15}
                    className={note.isPinned ? "fill-current" : ""}
                />
            </IconButton>
            <IconButton
                label="Delete note"
                onClick={() => handleDelete(note)}
            >
                <Trash2
                    size={15}
                    className="hover:text-[color:var(--ds-danger)]"
                />
            </IconButton>
        </div>
    );

    const FolderChip = ({ folderId }: { folderId: string }) => {
        const folder = folderMap.get(folderId);
        if (!folder) return null;
        const color = resolveFolderColor(folder.color);
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setView({ kind: "folder", folderId });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-2 py-0.5 text-[11px] font-medium text-muted-ink outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
            >
                <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color.dot }}
                />
                {folder.name}
            </button>
        );
    };

    const NoteCard = ({ note }: { note: NoteType }) => {
        const isDeleting = deleting === note.id;

        if (layout === "list") {
            return (
                <div
                    className={cn(
                        "group relative flex items-center gap-4 rounded-xl border border-hairline bg-surface px-4 py-3 transition-colors duration-150 hover:border-strong",
                        isDeleting && "pointer-events-none opacity-50",
                    )}
                >
                    <Link
                        href={`/note/${note.id}`}
                        prefetch={false}
                        className="flex min-w-0 flex-1 items-center gap-3 outline-none"
                    >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper text-muted-ink">
                            <FileText size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-semibold text-ink">
                                {note.title || "Untitled"}
                            </span>
                            <span className="block truncate text-[12px] text-muted-ink">
                                {note.description || "No description yet"}
                            </span>
                        </span>
                    </Link>
                    <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-faint tabular-nums sm:flex">
                        <LayoutList size={12} />
                        {note.blocksCount ?? 0}
                    </span>
                    <span className="hidden shrink-0 text-[11px] text-faint tabular-nums md:block">
                        {formatDate(note.updatedAt)}
                    </span>
                    {view.kind !== "folder" && (
                        <span className="hidden lg:block">
                            <FolderChip folderId={note.folderId} />
                        </span>
                    )}
                    <NoteActions note={note} />
                </div>
            );
        }

        return (
            <div
                className={cn(
                    "group relative flex flex-col rounded-xl border border-hairline bg-surface p-4 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-strong",
                    isDeleting && "pointer-events-none opacity-50",
                )}
            >
                <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper text-muted-ink">
                        <FileText size={16} />
                    </span>
                    <div className="-mr-1.5 -mt-1">
                        <NoteActions note={note} />
                    </div>
                </div>

                <Link
                    href={`/note/${note.id}`}
                    prefetch={false}
                    className="outline-none"
                >
                    <h3 className="text-[15px] font-semibold leading-snug text-ink transition-colors duration-150 group-hover:text-brand-cta">
                        {note.title || "Untitled"}
                    </h3>
                </Link>

                <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] leading-relaxed text-muted-ink">
                    {note.description || "No description has been added yet."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-faint tabular-nums">
                        <LayoutList size={12} />
                        {note.blocksCount ?? 0}{" "}
                        {(note.blocksCount ?? 0) === 1 ? "block" : "blocks"}
                    </span>
                    {view.kind !== "folder" ? (
                        <FolderChip folderId={note.folderId} />
                    ) : (
                        <span className="text-[11px] text-faint tabular-nums">
                            {formatDate(note.updatedAt)}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    /* --------------------------- Folder tile --------------------------- */
    const FolderTile = ({ folder }: { folder: FolderOption }) => {
        const color = resolveFolderColor(folder.color);
        const count = notes.filter((n) => n.folderId === folder.id).length;
        return (
            <button
                type="button"
                onClick={() => setView({ kind: "folder", folderId: folder.id })}
                className="group flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3 text-left outline-none transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-strong focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
            >
                <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                    style={{
                        backgroundColor: color.soft,
                        border: `1px solid ${color.ring}`,
                    }}
                >
                    <FolderOpen size={18} style={{ color: color.dot }} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                        {folder.name}
                    </span>
                    <span className="block text-[11px] text-muted-ink tabular-nums">
                        {count} {count === 1 ? "note" : "notes"}
                    </span>
                </span>
                <ChevronRight
                    size={16}
                    className="shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5"
                />
            </button>
        );
    };

    /* --------------------------- Section grid --------------------------- */
    const NoteCollection = ({ list }: { list: NoteType[] }) => (
        <div
            className={cn(
                layout === "grid"
                    ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-2",
            )}
        >
            {list.map((note) => (
                <NoteCard key={note.id} note={note} />
            ))}
        </div>
    );

    const SectionLabel = ({
        children,
        icon,
    }: {
        children: React.ReactNode;
        icon?: React.ReactNode;
    }) => (
        <div className="mb-3 flex items-center gap-2">
            {icon}
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-ink">
                {children}
            </h2>
        </div>
    );

    return (
        <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
            {/* Mobile top bar */}
            <div className="flex items-center gap-3 border-b border-hairline px-4 py-3 md:hidden">
                <button
                    type="button"
                    aria-label="Open navigation"
                    onClick={onOpenSidebar}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-surface text-ink outline-none transition-colors duration-150 hover:bg-paper focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] active:scale-[0.96]"
                >
                    <Menu size={18} />
                </button>
                <span className="text-[14px] font-semibold tracking-tight text-ink">
                    Eton Note
                </span>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
                    {/* Breadcrumb for scoped views */}
                    {view.kind !== "all" && (
                        <button
                            type="button"
                            onClick={() => setView({ kind: "all" })}
                            className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-ink outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            All notes
                            <ChevronRight size={13} />
                            <span className="text-ink">{meta.title}</span>
                        </button>
                    )}

                    {/* Header */}
                    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
                        <div className="min-w-0">
                            {meta.eyebrow && (
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-cta">
                                    {meta.eyebrow}
                                </p>
                            )}
                            <h1 className="text-[26px] font-semibold tracking-tight text-ink text-balance">
                                {meta.title}
                            </h1>
                            <p className="mt-1 text-[13px] text-muted-ink">
                                {searchQuery.trim()
                                    ? `${scoped.length} ${scoped.length === 1 ? "result" : "results"} for “${searchQuery.trim()}”`
                                    : meta.subtitle}
                            </p>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 text-[13px] font-medium text-body outline-none transition-colors duration-150 hover:bg-paper focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                    >
                                        <ArrowDownUp size={14} />
                                        <span className="hidden sm:inline">
                                            {
                                                SORT_OPTIONS.find(
                                                    (o) => o.key === sort,
                                                )?.label
                                            }
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    {SORT_OPTIONS.map((option) => (
                                        <DropdownMenuItem
                                            key={option.key}
                                            onSelect={() => setSort(option.key)}
                                            className="cursor-pointer"
                                        >
                                            <span className="flex w-full items-center justify-between">
                                                {option.label}
                                                {sort === option.key && (
                                                    <Check size={14} />
                                                )}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex items-center rounded-lg border border-hairline bg-surface p-0.5">
                                {(
                                    [
                                        { key: "grid", icon: LayoutGrid, label: "Grid view" },
                                        { key: "list", icon: List, label: "List view" },
                                    ] as const
                                ).map(({ key, icon: Icon, label }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-label={label}
                                        aria-pressed={layout === key}
                                        onClick={() => setLayout(key)}
                                        className={cn(
                                            "grid h-8 w-8 place-items-center rounded-[6px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]",
                                            layout === key
                                                ? "bg-tint text-brand-cta"
                                                : "text-faint hover:text-ink",
                                        )}
                                    >
                                        <Icon size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Loading */}
                    {fetching ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <NoteCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : notes.length === 0 ? (
                        /* Empty: no notes at all */
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-strong bg-paper px-6 py-16 text-center">
                            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-tint text-brand-cta">
                                <FileText size={24} />
                            </span>
                            <h3 className="text-[16px] font-semibold text-ink">
                                No notes yet
                            </h3>
                            <p className="mt-1 max-w-xs text-[13px] text-muted-ink text-pretty">
                                Create your first note and start building it
                                block by block.
                            </p>
                            <button
                                type="button"
                                onClick={onCreateNote}
                                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-cta px-4 py-2.5 text-[13px] font-semibold text-[color:var(--ds-accent-contrast)] outline-none transition-[transform,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2 active:scale-[0.98]"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                New note
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-9">
                            {/* Quick create (all view only) */}
                            {view.kind === "all" && !searchQuery.trim() && (
                                <button
                                    type="button"
                                    onClick={onCreateNote}
                                    className="group flex items-center gap-3 rounded-xl border border-dashed border-strong bg-paper px-4 py-3.5 text-left outline-none transition-colors duration-150 hover:border-[color:var(--ds-accent)] hover:bg-tint focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                >
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-tint text-brand-cta transition-colors duration-150 group-hover:bg-brand-soft">
                                        <Plus size={18} strokeWidth={2.5} />
                                    </span>
                                    <span>
                                        <span className="block text-[13px] font-semibold text-ink">
                                            Start a new note
                                        </span>
                                        <span className="block text-[12px] text-muted-ink">
                                            Capture an idea, a lecture, or a
                                            plan.
                                        </span>
                                    </span>
                                </button>
                            )}

                            {/* Folder browser (all view only) */}
                            {view.kind === "all" &&
                                !searchQuery.trim() &&
                                folders.length > 0 && (
                                    <section>
                                        <SectionLabel
                                            icon={
                                                <FolderOpen
                                                    size={14}
                                                    className="text-muted-ink"
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
                            {view.kind === "all" && pinned.length > 0 && (
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
                                {view.kind === "all" && (
                                    <SectionLabel
                                        icon={
                                            <FileText
                                                size={14}
                                                className="text-muted-ink"
                                            />
                                        }
                                    >
                                        {pinned.length > 0
                                            ? "All notes"
                                            : "Recent notes"}
                                    </SectionLabel>
                                )}

                                {mainList.length > 0 ? (
                                    <NoteCollection list={mainList} />
                                ) : (
                                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-strong bg-paper px-6 py-14 text-center">
                                        <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-tint text-brand-cta">
                                            {searchQuery.trim() ? (
                                                <SearchIcon size={20} />
                                            ) : view.kind === "favorites" ? (
                                                <Star size={20} />
                                            ) : (
                                                <FolderOpen size={20} />
                                            )}
                                        </span>
                                        <h3 className="text-[14px] font-semibold text-ink">
                                            {searchQuery.trim()
                                                ? "No matching notes"
                                                : view.kind === "favorites"
                                                  ? "No favorites yet"
                                                  : "This folder is empty"}
                                        </h3>
                                        <p className="mt-1 max-w-xs text-[13px] text-muted-ink text-pretty">
                                            {searchQuery.trim()
                                                ? "Try a different search term."
                                                : view.kind === "favorites"
                                                  ? "Star a note to keep it close at hand."
                                                  : "Add a note to this folder to fill it up."}
                                        </p>
                                        {!searchQuery.trim() &&
                                            view.kind !== "favorites" && (
                                                <button
                                                    type="button"
                                                    onClick={onCreateNote}
                                                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink outline-none transition-colors duration-150 hover:bg-paper focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] active:scale-[0.98]"
                                                >
                                                    <Plus size={15} />
                                                    New note
                                                </button>
                                            )}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default HomePage;
