"use client";
import { useNoteStore } from "@/Context/DataStore";
import HomePage from "@/Pages/HomePage";
import Link from "next/link";
import { Plus, FolderOpen, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateNoteModal from "@/components/CreateNoteModal";

export default function HomeLayout() {
    const { notes, createNote: createNoteInStore, deleteNote } = useNoteStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const router = useRouter();

    const handleCreateNote = (title: string, description: string) => {
        const newNote = createNoteInStore(title, description);
        setIsCreateModalOpen(false);
        router.push(`/note/${newNote.id}`);
    };

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sortedNotes = [...filteredNotes].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return (
        <div className="flex h-screen w-screen bg-white overflow-hidden">
            {/* Left Sidebar - Existing Notes */}
            <aside className="w-72 border-r border-slate-200 bg-linear-to-b from-slate-50 to-white overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Notes
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {notes.length} {notes.length === 1 ? "note" : "notes"}
                    </p>
                </div>

                {/* Create Quick Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mx-4 mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                    <Plus size={18} />
                    New Note
                </button>

                {/* Search */}
                <div className="px-4 mt-4">
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto mt-4">
                    {sortedNotes.length > 0 ? (
                        <div className="space-y-2 px-4 pb-4">
                            {sortedNotes.map((note) => (
                                <Link
                                    key={note.id}
                                    href={`/note/${note.id}`}
                                    className="group block p-3 rounded-lg bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                                >
                                    <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-orange-600 transition-colors">
                                        {note.title || "Untitled Note"}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <FolderOpen size={12} />
                                            {note.blocks?.length || 0} blocks
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(
                                                note.updatedAt,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <FolderOpen
                                size={32}
                                className="text-slate-300 mb-3"
                            />
                            <p className="text-sm text-slate-500">
                                {searchQuery
                                    ? "No notes found"
                                    : "No notes yet"}
                            </p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <HomePage onCreateNote={() => setIsCreateModalOpen(true)} />

            {/* Create Note Modal */}
            <CreateNoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateNote={handleCreateNote}
            />
        </div>
    );
}
