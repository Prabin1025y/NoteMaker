import { useDashboardStore } from "@/Context/DashboardStore";
import { cn } from "@/lib/utils";
import { NoteType } from "@/types/custom/notes";
import React from "react";
import NoteCard from "./Notecard";

const NoteCollection = ({
    list,
    showFolderChip = true,
}: {
    list: NoteType[];
    showFolderChip?: boolean;
}) => {
    const { layout } = useDashboardStore();
    return (
        <div
            className={cn(
                layout === "grid"
                    ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-2",
            )}
        >
            {list.map((note) => (
                <NoteCard
                    key={note.id}
                    note={note}
                    showFolderChip={showFolderChip}
                />
            ))}
        </div>
    );
};

export default NoteCollection;
