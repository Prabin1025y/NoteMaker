"use client";
import { useNoteStore } from "@/Context/DataStore";
import Link from "next/link";
import { Plus, Heart, Clock } from "lucide-react";
import { useState } from "react";

interface HomePageProps {
    onCreateNote: () => void;
}

const HomePage = ({ onCreateNote }: HomePageProps) => {
    const { notes } = useNoteStore();
    const [favorites, setFavorites] = useState<string[]>([]);

    const toggleFavorite = (noteId: string) => {
        setFavorites((prev) =>
            prev.includes(noteId)
                ? prev.filter((id) => id !== noteId)
                : [...prev, noteId],
        );
    };

    const recentNotes = [...notes]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);

    const favoriteNotes = notes.filter((note) => favorites.includes(note.id));

    const NoteCard = ({ note, isFavorite }: { note: typeof notes[0]; isFavorite: boolean }) => (
        <div className="shrink-0 w-56 bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="h-32 bg-linear-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-10">📝</span>
                </div>
                <button
                    onClick={() => toggleFavorite(note.id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Heart
                        size={18}
                        className={`${
                            isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-slate-400"
                        }`}
                    />
                </button>
            </div>

            <div className="p-4">
                <Link href={`/note/${note.id}`}>
                    <h3 className="font-semibold text-slate-900 truncate hover:text-orange-600 transition-colors cursor-pointer">
                        {note.title || "Untitled Note"}
                    </h3>
                </Link>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {note.blocks?.length || 0} blocks
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <Link
                        href={`/note/${note.id}`}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                    >
                        Open →
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <main className="flex-1 w-full h-full bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-8 py-12">
                {/* Header with Create Button */}
                <div className="flex flex-col items-center justify-center mb-16">
                    <h1 className="text-5xl font-bold text-slate-900 mb-3">
                        Welcome to <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">NoteMaker</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8">
                        Create beautiful notes with structured blocks
                    </p>

                    {/* Big Create Button */}
                    <button
                        onClick={onCreateNote}
                        className="relative group"
                    >
                        <div className="absolute -inset-1 bg-linear-to-r from-orange-400 to-red-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white rounded-full p-8 hover:bg-slate-50 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg">
                            <Plus size={48} className="text-orange-600" strokeWidth={2} />
                        </div>
                    </button>
                    <p className="text-slate-600 mt-4 font-medium">Create a new note</p>
                </div>

                {/* Recent Notes Section */}
                {recentNotes.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock size={24} className="text-slate-700" />
                            <h2 className="text-2xl font-bold text-slate-900">
                                Recent Notes
                            </h2>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {recentNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    isFavorite={favorites.includes(note.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Favorites Section */}
                {favoriteNotes.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-2 mb-6">
                            <Heart size={24} className="text-red-500 fill-red-500" />
                            <h2 className="text-2xl font-bold text-slate-900">
                                Favorites
                            </h2>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {favoriteNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    isFavorite={true}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {notes.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                            No notes yet
                        </h3>
                        <p className="text-slate-600 mb-8">
                            Create your first note by clicking the plus button above
                        </p>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </main>
    );
};

export default HomePage;
