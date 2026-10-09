"use client";

import { useRouter } from "next/navigation";
import CreateNoteModal from "@/components/CreateNoteModal";
import { useCreateNote } from "@/hooks/custom/useNotes";
import Sidebar from "@/components/Dashboard/Sidebar";
import { useDashboardStore } from "@/Context/DashboardStore";
import { Menu } from "lucide-react";

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

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
                <div className="flex items-center gap-3 border-b border-muted px-4 py-3 md:hidden">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        onClick={() => setSidebarOpen(true)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-muted bg-card/80 text-ink outline-none transition-colors duration-150 hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring) active:scale-[0.96]"
                    >
                        <Menu size={18} />
                    </button>
                    <span className="text-[14px] font-semibold tracking-tight text-ink">
                        Eton Note
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </main>

            <CreateNoteModal
                isCreatingNote={createNewNote.isPending}
                onCreateNote={handleCreateNote}
            />
        </div>
    );
}
