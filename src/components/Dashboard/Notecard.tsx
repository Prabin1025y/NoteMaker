import { useDashboardStore } from "@/Context/DashboardStore";
import { useGetAllFolders } from "@/hooks/custom/useFolders";
import { useDeleteNote, useUpdateNote } from "@/hooks/custom/useNotes";
import { cn } from "@/lib/utils";
import { NoteType } from "@/types/custom/notes";
import { FolderOption } from "@/types/misc";
import { resolveFolderColor } from "@/utils/folderColors";
import { formatDate } from "@/utils/UtilFunctions";
import { FileText, LayoutList, Pin, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const NoteCard = ({
    note,
    showFolderChip = true,
}: {
    note: NoteType;
    showFolderChip?: boolean;
}) => {
    const { layout, setView } = useDashboardStore();
    const { data: folders = [] } = useGetAllFolders();
    const deleteNote = useDeleteNote();
    const updateNote = useUpdateNote();

    const folderMap = useMemo(() => {
        const map = new Map<string, FolderOption>();
        folders.forEach((f) => map.set(f.id, f));
        return map;
    }, [folders]);

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
                className="inline-flex items-center gap-1.5 rounded-full border border-muted bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
            >
                <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color.dot }}
                />
                {folder.name}
            </button>
        );
    };

    const NoteActions = ({ note }: { note: NoteType }) => (
        <div className="flex items-center gap-0.5 text-muted-foreground">
            <IconButton
                label={
                    note.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                }
                active={note.isFavorite}
                activeClass="text-primary hover:bg-primary/20"
                onClick={() => toggleNoteFavorite(note.id, note.isFavorite)}
            >
                <Star
                    size={15}
                    className={note.isFavorite ? "fill-current" : ""}
                />
            </IconButton>
            <IconButton
                label={note.isPinned ? "Unpin note" : "Pin note"}
                active={note.isPinned}
                activeClass="text-primary hover:bg-primary/20"
                onClick={() => toggleNotePin(note.id, note.isPinned)}
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
                    className="hover:text-(--ds-danger)"
                />
            </IconButton>
        </div>
    );

    const handleDelete = async (note: NoteType) => {
        const confirmed = window.confirm(
            `Delete "${note.title || "Untitled"}"? This can't be undone.`,
        );
        if (!confirmed) return;

        await deleteNote.mutateAsync(note.id);
    };

    const toggleNoteFavorite = async (
        noteId: string,
        currentValue: boolean,
    ) => {
        await updateNote.mutateAsync({
            id: noteId,
            patch: { isFavorite: !currentValue },
        });
    };

    const toggleNotePin = async (noteId: string, currentValue: boolean) => {
        await updateNote.mutateAsync({
            id: noteId,
            patch: { isPinned: !currentValue },
        });
    };

    if (layout === "list") {
        return (
            <div
                className={cn(
                    "group relative flex items-center gap-4 rounded-xl border border-border bg-card/60 px-4 py-3 transition-colors duration-150 hover:border-accent/40",
                )}
            >
                <Link
                    href={`/note/${note.id}`}
                    prefetch={false}
                    className="flex min-w-0 flex-1 items-center gap-3 outline-none"
                >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground">
                        <FileText size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">
                            {note.title || "Untitled"}
                        </span>
                        <span className="block truncate text-[12px] text-muted-foreground">
                            {note.description || "No description yet"}
                        </span>
                    </span>
                </Link>
                <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums sm:flex">
                    <LayoutList size={12} />
                    {note.blocksCount ?? 0}
                </span>
                <span className="hidden shrink-0 text-[11px] text-muted-foreground tabular-nums md:block">
                    {formatDate(note.updatedAt)}
                </span>
                {showFolderChip && (
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
                "group relative flex flex-col rounded-xl border border-muted bg-card/60 p-4 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-strong",
            )}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground">
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
                <h3 className="text-[15px] font-semibold leading-snug text-ink transition-colors duration-150 group-hover:text-primary">
                    {note.title || "Untitled"}
                </h3>
            </Link>

            <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-muted-foreground">
                {note.description || "No description has been added yet."}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-muted pt-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums">
                    <LayoutList size={12} />
                    {note.blocksCount ?? 0}{" "}
                    {(note.blocksCount ?? 0) === 1 ? "block" : "blocks"}
                </span>
                {showFolderChip ? (
                    <FolderChip folderId={note.folderId} />
                ) : (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                        {formatDate(note.updatedAt)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default NoteCard;

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
            "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)",
            "active:scale-[0.92]",
            active
                ? cn("opacity-100", activeClass)
                : cn(
                      "text-muted-foreground hover:bg-border hover:text-ink",
                      alwaysVisible
                          ? "opacity-100"
                          : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                  ),
        )}
    >
        {children}
    </button>
);
