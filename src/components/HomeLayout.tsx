"use client";
import { useNoteStore } from "@/Context/DataStore";
import HomePage from "@/components/HomePage";
import Link from "next/link";
import {
    Plus,
    Search,
    Settings,
    Lightbulb,
    Users,
    Code2,
    BarChart2,
    BookOpen,
    FileText,
    Star,
    LogOutIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateNoteModal from "@/components/CreateNoteModal";
import SidebarNoteSkeleton from "@/skeletons/SideBarNoteSkeleton";
import { fetchFolders, fetchNotes } from "@/services/noteService";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOption } from "@/types/misc";

const iconMap = [Lightbulb, Users, Code2, BarChart2, BookOpen, FileText, Star];
const colorMap = [
    { bg: "bg-violet-100", text: "text-violet-600" },
    { bg: "bg-blue-100", text: "text-blue-600" },
    { bg: "bg-emerald-100", text: "text-emerald-600" },
    { bg: "bg-amber-100", text: "text-amber-600" },
    { bg: "bg-pink-100", text: "text-pink-600" },
];

export default function HomeLayout() {
    const { data } = useSession();
    const { notes, createNote: createNoteInStore, setNotes } = useNoteStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: notesData, isLoading } = useQuery({
        queryKey: ["notes"],
        queryFn: fetchNotes,
        staleTime: 60 * 60 * 1000,
    });

    const { data: folders = [] } = useQuery<FolderOption[]>({
        queryKey: ["folders"],
        queryFn: fetchFolders,
        staleTime: 60 * 60 * 1000,
    });

    useEffect(() => {
        if (notesData) {
            setNotes(notesData);
        }
    }, [notesData, setNotes]);

    const handleCreateNote = async (
        title: string,
        description: string,
        folderDetails?: {
            isNewFolder: boolean;
            folderId?: string;
            folderName?: string;
        },
    ) => {
        const newNote = await createNoteInStore(
            title,
            description,
            folderDetails,
        );
        setIsCreateModalOpen(false);
        queryClient.invalidateQueries({queryKey: ['notes']})
        if(folderDetails?.isNewFolder){
            queryClient.invalidateQueries({queryKey: ['folders']})
        }
        router.push(`/note/${newNote.id}`);
    };

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sortedNotes = [...filteredNotes].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    const handleLogout = async () => {
        signOut({ redirectTo: "/" });
    };

    return (
        <div
            className="flex h-screen w-screen bg-[#faf9f7] overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <aside className="w-80 border-r border-[#e8e5e0] bg-[#faf9f7] flex flex-col shrink-0">
                {/* Brand */}
                <div className="px-4 py-5 border-b border-[#e8e5e0]">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7  flex items-center justify-center shrink-0">
                            {/* <Notebook
                                size={14}
                                className="text-white"
                            /> */}
                            <Image
                                src={"/logo.png"}
                                alt="Logo"
                                width={100}
                                height={100}
                            />
                        </div>
                        <span className="text-[15px] text-indigo-700 tracking-tight">
                            <span className="font-bold">Eton</span> Note
                        </span>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-[10px] text-[13px] font-medium transition-colors"
                    >
                        <Plus
                            size={14}
                            strokeWidth={2.5}
                        />
                        New note
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center gap-2 bg-white border border-[#e2e0dc] rounded-[9px] px-3 py-2">
                        <Search
                            size={14}
                            className="text-[#9e9a94] shrink-0"
                        />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 text-[13px] text-[#1a1714] bg-transparent outline-none placeholder-[#b8b3ac]"
                        />
                    </div>
                </div>

                <div className="px-5 pt-4 pb-1.5">
                    <span className="text-[10px] font-semibold text-[#b8b3ac] uppercase tracking-[0.08em]">
                        All notes
                    </span>
                </div>

                {/* Note list */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {isLoading ? (
                        <ul>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SidebarNoteSkeleton key={i} />
                            ))}
                        </ul>
                    ) : sortedNotes.length > 0 ? (
                        <ul>
                            {sortedNotes.map((note, i) => {
                                const color = colorMap[i % colorMap.length];
                                const Icon = iconMap[i % iconMap.length];
                                return (
                                    <li key={note.id}>
                                        <Link
                                            prefetch={false}
                                            href={`/note/${note.id}`}
                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] hover:bg-[#f0ede8] transition-colors group"
                                        >
                                            <div
                                                className={`w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 ${color.bg}`}
                                            >
                                                <Icon
                                                    size={13}
                                                    className={color.text}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-[#1a1714] truncate group-hover:text-indigo-700 transition-colors">
                                                    {note.title || "Untitled"}
                                                </p>
                                                <p className="text-[11px] text-[#b8b3ac]">
                                                    {new Date(
                                                        note.updatedAt,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="px-3 pt-2 text-[12px] text-[#b8b3ac]">
                            {searchQuery
                                ? "No results found."
                                : "No notes yet."}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#e8e5e0]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-700 overflow-hidden rounded-full flex items-center justify-center text-[11px] font-semibold text-white">
                                {data?.user.image && (
                                    <Image
                                        alt="User Avatar"
                                        src={data?.user.image}
                                        height={28}
                                        width={28}
                                        className="h-7 w-7"
                                    />
                                )}
                            </div>
                            <span className="text-[12px] font-medium text-[#5a5550]">
                                {data?.user.name}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Settings
                                size={15}
                                className="text-[#b8b3ac] cursor-pointer hover:text-[#5a5550] transition-colors"
                            />
                            <LogOutIcon
                                onClick={handleLogout}
                                size={15}
                                className="text-[#b8b3ac] cursor-pointer hover:text-[#5a5550] transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </aside>

            <HomePage
                fetching={isLoading}
                folders={folders}
                onCreateNote={() => setIsCreateModalOpen(true)}
            />

            <CreateNoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateNote={handleCreateNote}
                folders={folders}
            />
        </div>
    );
}
