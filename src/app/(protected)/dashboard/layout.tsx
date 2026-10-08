"use client";
import HomePage from "@/components/HomePage";

import { useRouter } from "next/navigation";
import CreateNoteModal from "@/components/CreateNoteModal";
import { useCreateNote, useGetAllNotes } from "@/hooks/custom/useNotes";
import Sidebar from "@/components/Dashboard/Sidebar";
import { useDashboardStore } from "@/Context/DashboardStore";
import { useGetAllFolders } from "@/hooks/custom/useFolders";

export default function Home({ children }: { children: React.ReactNode }) {
    const { sidebarOpen, setSidebarOpen } = useDashboardStore();
    const router = useRouter();

    const createNewNote = useCreateNote();

    const handleCreateNote = async (
        title: string,
        description: string,
        folderDetails?: {
            isNewFolder: boolean;
            folderId?: string;
            folderName?: string;
        },
    ) => {
        const newNote = await createNewNote.mutateAsync({
            title,
            description,
            folderOptions: folderDetails,
        });
        router.push(`/note/${newNote.noteId}`);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    aria-hidden
                    onClick={() => setSidebarOpen(false)}
                    className="ds-animate-fade-in fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            <Sidebar />

            <HomePage />

            <CreateNoteModal
                isCreatingNote={createNewNote.isPending}
                onCreateNote={handleCreateNote}
            />
        </div>
    );
}
