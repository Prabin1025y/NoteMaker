"use client";
import { useNoteStore } from "@/Context/DataStore";
import Link from "next/link";
import { Plus, FolderOpen, Clock, Trash2 } from "lucide-react";
import { useState } from "react";

interface NotesListSidebarProps {
    currentNoteId: string;
}

export default function NotesListSidebar({
    currentNoteId,
}: NotesListSidebarProps) {
    const { notes, createNote, deleteNote } = useNoteStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sortedNotes = [...filteredNotes].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    const handleDelete = (id: string) => {
        deleteNote(id);
        setDeleteConfirm(null);
    };

    return (
        <aside className="w-72 border-r border-slate-200 bg-linear-to-b from-slate-50 to-white overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {notes.length} {notes.length === 1 ? "note" : "notes"}
                </p>
            </div>

            {/* Create Quick Button */}
            <button
                onClick={createNote}
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
                            <div
                                key={note.id}
                                className={`group relative p-3 rounded-lg border transition-all duration-200 ${
                                    currentNoteId === note.id
                                        ? "bg-orange-100 border-orange-300 shadow-md"
                                        : "bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                                }`}
                            >
                                <Link href={`/note/${note.id}`}>
                                    <h3 className={`font-semibold text-sm truncate transition-colors ${
                                        currentNoteId === note.id
                                            ? "text-orange-700"
                                            : "text-slate-900 group-hover:text-orange-600"
                                    }`}>
                                        {note.title || "Untitled Note"}
                                    </h3>
                                </Link>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <FolderOpen size={12} />
                                        {note.blocks?.length || 0} blocks
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                        </span>
                                        {currentNoteId !== note.id && (
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm(note.id)
                                                }
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Delete Confirmation */}
                                {deleteConfirm === note.id && (
                                    <div className="absolute inset-0 bg-red-50 border-2 border-red-300 rounded-lg p-3 flex flex-col justify-center items-center z-50">
                                        <p className="text-xs font-semibold text-red-900 mb-2">
                                            Delete?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleDelete(note.id)
                                                }
                                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm(null)
                                                }
                                                className="px-2 py-1 text-xs bg-slate-300 text-slate-900 rounded hover:bg-slate-400 transition-colors"
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <FolderOpen
                            size={32}
                            className="text-slate-300 mb-3"
                        />
                        <p className="text-sm text-slate-500">
                            {searchQuery ? "No notes found" : "No notes yet"}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}
