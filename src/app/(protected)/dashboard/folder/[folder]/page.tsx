"use client";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import NoteCollection from "@/components/Dashboard/NoteCollection";
import { useDashboardStore } from "@/Context/DashboardStore";
import { useGetAllFolders } from "@/hooks/custom/useFolders";
import { useGetAllNotes } from "@/hooks/custom/useNotes";
import {
    ChevronRight,
    FileText,
    FolderOpen,
    Plus,
    SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";

const page = () => {
    const params = useParams();
    const folderId = params?.folder as string;
    const { searchQuery, setIsCreateModalOpen, setView } = useDashboardStore();

    const { data: notes = [], isLoading: isNotesLoading } = useGetAllNotes();
    const { data: folders } = useGetAllFolders();

    useEffect(() => {
        setView({ kind: "folder", folderId });
    }, [folderId, folders]);

    const currentFolder = useMemo(() => {
        return folders?.find((f) => f.id === folderId);
    }, [folderId, folders]);

    const folderNotes = useMemo(() => {
        return notes?.filter((n) => n.folderId === folderId) || [];
    }, [folderId, notes]);

    const searched = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return folderNotes;
        return folderNotes.filter(
            (n) =>
                (n.title || "").toLowerCase().includes(q) ||
                (n.description || "").toLowerCase().includes(q),
        );
    }, [folderNotes, searchQuery]);

    return (
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
            <Link
                href={"/dashboard"}
                prefetch={false}
                className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
            >
                All notes
                <ChevronRight size={13} />
                <span className="text-foreground">{currentFolder?.name}</span>
            </Link>

            <DashboardHeader
                title={currentFolder?.name || "Filtered Notes"}
                filteredNotes={searched}
            />

            {isNotesLoading ? (
                <p>Loading...</p>
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
                        onClick={() => setIsCreateModalOpen(true)}
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
                <section>
                    {searched.length > 0 ? (
                        <NoteCollection list={searched} />
                    ) : (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-strong bg-background/80 px-6 py-14 text-center">
                            <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/20 text-primary">
                                {searchQuery.trim() ? (
                                    <SearchIcon size={20} />
                                ) : (
                                    <FolderOpen size={20} />
                                )}
                            </span>
                            <h3 className="text-[14px] font-semibold text-ink">
                                {searchQuery.trim()
                                    ? "No matching notes"
                                    : "This folder is empty"}
                            </h3>
                            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground text-pretty">
                                {searchQuery.trim()
                                    ? "Try a different search term."
                                    : "Add a note to this folder to fill it up."}
                            </p>
                            {!searchQuery.trim() && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-muted bg-card/80 px-3.5 py-2 text-[13px] font-semibold text-ink outline-none transition-colors duration-150 hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring) active:scale-[0.98]"
                                >
                                    <Plus size={15} />
                                    New note
                                </button>
                            )}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default page;
