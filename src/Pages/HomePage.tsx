"use client";
import { useNoteStore } from "@/Context/DataStore";
import Link from "next/link";
import {
    Plus,
    Heart,
    LayoutList,
    Lightbulb,
    Users,
    Code2,
    BarChart2,
    BookOpen,
    FileText,
    Star,
    Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { NoteCardSkeleton } from "@/skeletons/NoteCardSkeleton";
import { apiFetch } from "@/lib/api-client";

interface HomePageProps {
    onCreateNote: () => void;
    fetching: boolean;
}

const tagStyles = [
    {
        label: "Ideas",
        bg: "bg-violet-100",
        text: "text-violet-700",
        Icon: Lightbulb,
    },
    { label: "Team", bg: "bg-blue-100", text: "text-blue-700", Icon: Users },
    {
        label: "Dev",
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        Icon: Code2,
    },
    {
        label: "Planning",
        bg: "bg-amber-100",
        text: "text-amber-700",
        Icon: BarChart2,
    },
    {
        label: "Personal",
        bg: "bg-pink-100",
        text: "text-pink-700",
        Icon: BookOpen,
    },
    { label: "Docs", bg: "bg-blue-100", text: "text-blue-700", Icon: FileText },
    {
        label: "Goals",
        bg: "bg-violet-100",
        text: "text-violet-700",
        Icon: Star,
    },
];

const HomePage = ({ onCreateNote, fetching }: HomePageProps) => {
    const { notes, deleteNote } = useNoteStore();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "all">(
        "recent",
    );
    const [deleting, setDeleting] = useState<string | null>(null);

    const toggleFavorite = (e: React.MouseEvent, noteId: string) => {
        e.preventDefault();
        setFavorites((prev) =>
            prev.includes(noteId)
                ? prev.filter((id) => id !== noteId)
                : [...prev, noteId],
        );
    };

    const sorted = [...notes].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const recentNotes = sorted.slice(0, 10);
    const favoriteNotes = notes.filter((n) => favorites.includes(n.id));
    const displayNotes =
        activeTab === "recent"
            ? recentNotes
            : activeTab === "favorites"
              ? favoriteNotes
              : sorted;

    const NoteCard = ({ note }: { note: (typeof notes)[0] }) => {
        const isFav = favorites.includes(note.id);

        const handleDelete = async (id: string) => {
            try {
                const confirm = window.confirm(
                    "Are you sure you want to delete this note?",
                );

                if (!confirm) return;

                setDeleting(id);

                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes/${id}`,
                    { method: "DELETE" },
                );

                const data = await res.json();

                if (!res.ok) {
                    setDeleting(null);
                    throw new Error(data.message);
                }

                deleteNote(id);
                setDeleting(null);
            } catch (error) {
                if (process.env.NODE_ENV === "development")
                    console.error(error);

                alert(
                    error instanceof Error
                        ? error.message
                        : "Error while deleting note",
                );
            }
        };

        return (
            <div className="group relative flex flex-col rounded-xl border border-[#e8e5e0] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
                {/* Favorite */}
                <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deleting === note.id}
                    aria-label={isFav ? "Unfavorite" : "Favorite"}
                    className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                        isFav
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                    } hover:bg-red-50`}
                >
                    <Trash2Icon
                        size={15}
                        className={
                            isFav
                                ? "fill-red-500 text-red-500"
                                : "text-gray-300"
                        }
                    />
                </button>

                {/* Title */}
                <Link
                    href={`/note/${note.id}`}
                    prefetch={false}
                >
                    <h3 className="pr-8 text-[15px] font-semibold text-gray-900 transition-colors hover:text-indigo-600">
                        {note.title || "Untitled"}
                    </h3>
                </Link>

                {/* Description */}
                <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-gray-500">
                    {note.description ||
                        "No description has been added for this note yet."}
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <LayoutList size={12} />
                            {note.blocksCount ?? 0} blocks
                        </div>

                        <div className="text-[11px] text-gray-400">
                            Updated{" "}
                            {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                    </div>

                    {deleting === note.id ? (
                        <p>Deleting...</p>
                    ) : (
                        <Link
                            prefetch={false}
                            href={`/note/${note.id}`}
                            className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                        >
                            Open →
                        </Link>
                    )}
                </div>
                {/* Author */}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                    {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {note.authorName?.charAt(0) ?? "U"}
                    </div> */}

                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-800">
                            {note.authorName || "Unknown Author"}
                        </span>

                        <span className="text-[11px] text-gray-400">
                            Created{" "}
                            {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <main
            className="flex-1 h-full bg-white overflow-y-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <div className="max-w-7xl mx-auto px-10 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#1a1714] tracking-tight mb-1">
                        {greeting()} 👋
                    </h1>
                    <p className="text-[13px] text-[#9e9a94]">
                        {notes.length === 0
                            ? "Create your first note to get started."
                            : `You have ${notes.length} ${notes.length === 1 ? "note" : "notes"}.`}
                    </p>
                </div>

                {/* Quick create */}
                <button
                    onClick={onCreateNote}
                    className="w-full flex flex-col justify-center items-center gap-3 bg-[#faf9f7] border border-dashed border-[#d4d0c8] rounded-xl px-4 py-5 mb-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-left group"
                >
                    <div className="w-9 h-9 bg-indigo-100 rounded-[9px] flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                        <Plus
                            size={18}
                            className="text-indigo-700"
                        />
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-center text-indigo-700">
                            Start a new note
                        </p>
                        <p className="text-[12px] text-[#9e9a94]">
                            Click to create a new note
                        </p>
                    </div>
                </button>

                {/* Tabs */}
                {fetching ? (
                    <>
                        <div className="flex gap-1 mb-5 border-b border-[#f0ede8]">
                            {(["recent", "favorites", "all"] as const).map(
                                (tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3.5 py-2 text-[13px] font-medium capitalize rounded-t-lg transition-all border-b-2 -mb-px ${
                                            activeTab === tab
                                                ? "text-indigo-700 border-indigo-600 bg-indigo-50"
                                                : "text-[#9e9a94] border-transparent hover:text-[#5a5550] hover:bg-[#faf9f7]"
                                        }`}
                                    >
                                        {tab === "all"
                                            ? "All notes"
                                            : tab.charAt(0).toUpperCase() +
                                              tab.slice(1)}
                                        {tab === "favorites" &&
                                            favorites.length > 0 && (
                                                <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-semibold rounded-full">
                                                    {favorites.length}
                                                </span>
                                            )}
                                    </button>
                                ),
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <NoteCardSkeleton key={i} />
                            ))}
                        </div>
                    </>
                ) : (
                    notes.length > 0 && (
                        <>
                            <div className="flex gap-1 mb-5 border-b border-[#f0ede8]">
                                {(["recent", "favorites", "all"] as const).map(
                                    (tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-3.5 py-2 text-[13px] font-medium capitalize rounded-t-lg transition-all border-b-2 -mb-px ${
                                                activeTab === tab
                                                    ? "text-indigo-700 border-indigo-600 bg-indigo-50"
                                                    : "text-[#9e9a94] border-transparent hover:text-[#5a5550] hover:bg-[#faf9f7]"
                                            }`}
                                        >
                                            {tab === "all"
                                                ? "All notes"
                                                : tab.charAt(0).toUpperCase() +
                                                  tab.slice(1)}
                                            {tab === "favorites" &&
                                                favorites.length > 0 && (
                                                    <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-semibold rounded-full">
                                                        {favorites.length}
                                                    </span>
                                                )}
                                        </button>
                                    ),
                                )}
                            </div>

                            {displayNotes.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {displayNotes.map((note, i) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-14 border border-dashed border-[#e2e0dc] rounded-xl">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-[14px] flex items-center justify-center mx-auto mb-3">
                                        <Heart
                                            size={22}
                                            className="text-indigo-400"
                                        />
                                    </div>
                                    <p className="text-[14px] font-medium text-[#1a1714] mb-1">
                                        No favorites yet
                                    </p>
                                    <p className="text-[12px] text-[#9e9a94]">
                                        Hover a card and click the heart to save
                                        it here.
                                    </p>
                                </div>
                            )}
                        </>
                    )
                )}

                {/* Empty state */}
                {!fetching && notes.length === 0 && (
                    <div className="text-center py-16 border border-dashed border-[#e2e0dc] rounded-xl mt-2">
                        <div className="w-13 h-13 bg-indigo-50 rounded-[14px] flex items-center justify-center mx-auto mb-3 p-3">
                            <FileText
                                size={24}
                                className="text-indigo-500"
                            />
                        </div>
                        <h3 className="text-[15px] font-semibold text-[#1a1714] mb-1">
                            No notes yet
                        </h3>
                        <p className="text-[13px] text-[#9e9a94]">
                            Hit "New note" to write your first one.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default HomePage;
