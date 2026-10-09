"use client";
import React, { useEffect, useMemo } from "react";
import { ChevronRight, SearchIcon, Star } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useGetAllNotes } from "@/hooks/custom/useNotes";
import { useDashboardStore } from "@/Context/DashboardStore";
import NoteCollection from "@/components/Dashboard/NoteCollection";

const page = () => {
    const { data: notes = [], isLoading: isNotesLoading } = useGetAllNotes();
    const { searchQuery, setView } = useDashboardStore();

    const favouriteNotes = useMemo(() => {
        return notes?.filter((n) => n.isFavorite) || [];
    }, [notes]);

    const searched = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return favouriteNotes;
        return favouriteNotes.filter(
            (n) =>
                (n.title || "").toLowerCase().includes(q) ||
                (n.description || "").toLowerCase().includes(q),
        );
    }, [favouriteNotes, searchQuery]);

    useEffect(() => {
        setView({ kind: "favorites" });
    }, []);

    return (
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
            <Link
                href={"/dashboard"}
                className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground outline-none transition-colors duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
            >
                All notes
                <ChevronRight size={13} />
                <span className="text-foreground">Favourites</span>
            </Link>

            <DashboardHeader
                title={"Favourites"}
                filteredNotes={searched}
            />

            {isNotesLoading ? (
                <p>Loading...</p>
            ) : (
                <section>
                    {searched.length > 0 ? (
                        <NoteCollection list={searched} />
                    ) : (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-strong bg-background/80 px-6 py-14 text-center">
                            <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/20 text-primary">
                                {searchQuery.trim() &&
                                favouriteNotes.length > 0 ? (
                                    <SearchIcon size={20} />
                                ) : (
                                    <Star size={20} />
                                )}
                            </span>
                            <h3 className="text-[14px] font-semibold text-ink">
                                {searchQuery.trim() && favouriteNotes.length > 0
                                    ? "No matching notes"
                                    : "No Favourite Notes"}
                            </h3>
                            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground text-pretty">
                                {searchQuery.trim() && favouriteNotes.length > 0
                                    ? "Try a different search term."
                                    : "Make a note favourite to fill it up."}
                            </p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default page;
