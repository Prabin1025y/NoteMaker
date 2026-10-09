"use client";

import { useState } from "react";
import {
    ArrowLeft,
    ChevronDown,
    Check,
    Eye,
    Globe,
    Link2,
    Lock,
    Redo2,
    Save,
    Search,
    Share2,
    Undo2,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/Context/DataStore";
import { toast } from "sonner";
import ThemeToggle from "../ThemeToggle";
import {
    useGetNotesInFolderOfNote,
    useUpdateNote,
} from "@/hooks/custom/useNotes";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteChromeHeaderProps {
    onHomeClick: () => void;
    onSave: () => void;
    onExport: () => void;
    onPreview: () => void;
    hasUnsaved: boolean;
}

const NoteChromeHeader = ({
    onHomeClick,
    onSave,
    onExport,
    onPreview,
    hasUnsaved,
}: NoteChromeHeaderProps) => {
    const {
        blocks,
        undo,
        redo,
        canUndo,
        canRedo,
        isSyncing,
        isExporting,
        isPreviewMode,
        isReadOnly,
        searchQuery,
        setSearchQuery,
        currentNote,
    } = useNoteStore();

    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isTogglingPublic, setIsTogglingPublic] = useState(false);
    const [copied, setCopied] = useState(false);

    const updateNote = useUpdateNote();
    const router = useRouter();
    const { data: folderNotes = [] } = useGetNotesInFolderOfNote(
        currentNote?.id ?? "",
    );
    const otherFolderNotes = folderNotes.filter(
        (note) => note.id !== currentNote?.id,
    );

    const isPublic = Boolean(currentNote?.isPublic);
    const shareLink = typeof window !== "undefined" ? window.location.href : "";

    const handleTogglePublic = async () => {
        if (!currentNote) return;
        setIsTogglingPublic(true);
        await updateNote.mutateAsync({
            id: currentNote.id,
            patch: { isPublic: !isPublic },
        });
        setIsTogglingPublic(false);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy the link");
        }
    };

    return (
        <header className="shrink-0 flex items-center gap-4 px-4 h-12 bg-card/70 border-b border-muted">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHomeClick}
                    className=" hover:text-ink hover:bg-card"
                >
                    <ArrowLeft size={15} />
                    Home
                </Button>
                <div className="h-4 w-px bg-muted-foreground/30" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="min-w-0">
                            <button
                                type="button"
                                className="flex max-w-50 items-center gap-1 text-left text-[14px] font-semibold tracking-tight text-ink outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring) lg:max-w-70"
                                aria-label="Choose another note in this folder"
                            >
                                <span className="truncate">
                                    {currentNote?.title || "Untitled"}
                                </span>
                                {otherFolderNotes.length > 0 && (
                                    <ChevronDown
                                        size={14}
                                        className="shrink-0 text-muted-foreground"
                                    />
                                )}
                            </button>
                            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                                {blocks?.length ?? 0}{" "}
                                {(blocks?.length ?? 0) === 1
                                    ? "block"
                                    : "blocks"}
                            </p>
                        </div>
                    </DropdownMenuTrigger>
                    {otherFolderNotes.length > 0 && (
                        <DropdownMenuContent
                            align="start"
                            className="w-64"
                        >
                            {otherFolderNotes.map((note) => (
                                <DropdownMenuItem
                                    key={note.id}
                                    onSelect={() =>
                                        router.push(`/note/${note.id}`)
                                    }
                                    className="cursor-pointer"
                                >
                                    <span className="min-w-0 flex-1 truncate">
                                        {note.title || "Untitled"}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
                {/* <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                        {blocks?.length ?? 0}{" "}
                        {(blocks?.length ?? 0) === 1 ? "block" : "blocks"}
                    </p> */}
            </div>

            {/* Center — Search */}
            <div className="flex-1 flex justify-center max-w-md mx-auto">
                <div className="relative w-full">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search blocks..."
                        className="w-full h-8 pl-9 pr-3 text-[13px] rounded-lg border border-muted bg-background/80 text-ink placeholder:text-muted-foreground outline-none transition-colors focus:border-(--ds-focus-ring) focus:ring-2 focus:ring-(--ds-focus-ring) focus:bg-card/80"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 shrink-0">
                {isReadOnly ? (
                    <>
                        <span className="flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Lock size={12} />
                            Read only
                        </span>
                        <div className="h-4 w-px bg-muted mx-1" />
                        <ThemeToggle className="h-7" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPreview}
                            className={`border-muted text-body hover:bg-background/80 ${isPreviewMode ? "bg-brand-soft border-(--ds-accent-soft) text-primary" : ""}`}
                        >
                            <Eye size={14} />
                            Preview
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExport}
                            disabled={isExporting}
                            className="border-muted text-body hover:bg-background/80 disabled:opacity-60"
                        >
                            <Upload size={14} />
                            {isExporting ? "Exporting..." : "Export"}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={undo}
                            disabled={!canUndo()}
                            title="Undo"
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                            <Undo2 size={15} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={redo}
                            disabled={!canRedo()}
                            title="Redo"
                            className="text-muted-foreground hover:text-foreground  disabled:opacity-30"
                        >
                            <Redo2 size={15} />
                        </Button>

                        <div className="h-4 w-px bg-muted mx-1" />

                        <ThemeToggle className="h-7" />

                        <Button
                            variant="default"
                            size="sm"
                            onClick={onPreview}
                            className={`border-muted text-body bg-primary/10 hover:bg-primary/20 ${isPreviewMode ? "bg-primary/60 border-(--ds-accent-soft) text-background" : ""}`}
                        >
                            <Eye size={14} />
                            Preview
                        </Button>

                        {/* Share */}
                        <div className="relative">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setIsShareOpen((v) => !v)}
                                disabled={!currentNote}
                                className={`border-muted text-body bg-primary/10 hover:bg-primary/20 ${isPublic ? "bg-brand-soft border-(--ds-accent-soft) text-primary" : ""}`}
                            >
                                <Share2 size={14} />
                                Share
                            </Button>

                            {isShareOpen && (
                                <>
                                    <button
                                        type="button"
                                        aria-hidden
                                        onClick={() => setIsShareOpen(false)}
                                        className="fixed inset-0 z-40 cursor-default"
                                    />
                                    <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-muted bg-card p-4 shadow-xl">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                                    {isPublic ? (
                                                        <Globe size={16} />
                                                    ) : (
                                                        <Lock size={16} />
                                                    )}
                                                </span>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-ink">
                                                        Public access
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                                                        {isPublic
                                                            ? "Anyone signed in with the link can view this note."
                                                            : "Only you can access this note."}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={isPublic}
                                                aria-label="Toggle public access"
                                                onClick={handleTogglePublic}
                                                disabled={isTogglingPublic}
                                                className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${isPublic ? "bg-primary" : "bg-muted"}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-4" : "translate-x-0.5"}`}
                                                />
                                            </button>
                                        </div>

                                        {isPublic && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <input
                                                    readOnly
                                                    value={shareLink}
                                                    onFocus={(e) =>
                                                        e.currentTarget.select()
                                                    }
                                                    className="h-8 min-w-0 flex-1 rounded-lg border border-muted bg-card px-2.5 text-[12px] text-body outline-none"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={handleCopyLink}
                                                    className="bg-primary text-primary-foreground transition-[filter] duration-150 hover:brightness-105"
                                                >
                                                    {copied ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <Link2 size={14} />
                                                    )}
                                                    {copied ? "Copied" : "Copy"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            size="sm"
                            onClick={onSave}
                            disabled={isSyncing || isExporting}
                            className="relative bg-primary text-primary-foreground transition-[filter] duration-150 hover:brightness-105 disabled:opacity-60"
                        >
                            <Save size={14} />
                            {isSyncing ? "Saving..." : "Save"}
                            {hasUnsaved && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full border border-background" />
                            )}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={onExport}
                            disabled={isExporting}
                            className="border-muted text-body bg-primary/10 hover:bg-primary/20 disabled:opacity-60"
                        >
                            <Upload size={14} />
                            {isExporting ? "Exporting..." : "Export"}
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
};

export default NoteChromeHeader;
