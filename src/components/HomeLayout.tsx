"use client";
import { useNoteStore } from "@/Context/DataStore";
import HomePage from "@/components/HomePage";
import {
    Plus,
    Search,
    Settings,
    Star,
    FileText,
    LogOut,
    FolderPlus,
    Trash2,
    Check,
    X,
    LogOutIcon,
    PaletteIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CreateNoteModal from "@/components/CreateNoteModal";
import SidebarNoteSkeleton from "@/skeletons/SideBarNoteSkeleton";
import {
    createFolder,
    deleteFolder,
    fetchFolders,
    fetchNotes,
    updateFolder,
} from "@/services/noteService";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveFolderColor } from "@/utils/folderColors";
import ThemeToggle from "@/components/ThemeToggle";
import type { DashboardView, FolderOption } from "@/types/misc";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CustomThemeSelector } from "./CustomThemeSelector";

export default function HomeLayout() {
    const { data } = useSession();
    const { notes, createNote: createNoteInStore, setNotes } = useNoteStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState<DashboardView>({ kind: "all" });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [folderBusy, setFolderBusy] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();
    const menuTriggerRef = useRef<HTMLButtonElement>(null);
    const newFolderInputRef = useRef<HTMLInputElement>(null);

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
        if (notesData) setNotes(notesData);
    }, [notesData, setNotes]);

    // Lock background scroll + close on Escape while the mobile drawer is open.
    useEffect(() => {
        if (!sidebarOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [sidebarOpen]);

    useEffect(() => {
        if (isCreatingFolder) newFolderInputRef.current?.focus();
    }, [isCreatingFolder]);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
        menuTriggerRef.current?.focus();
    }, []);

    const selectView = useCallback((next: DashboardView) => {
        setView(next);
        setSidebarOpen(false);
    }, []);

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
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        if (folderDetails?.isNewFolder) {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        }
        router.push(`/note/${newNote.id}`);
    };

    const handleCreateFolder = async () => {
        const name = newFolderName.trim();
        if (!name || folderBusy) return;
        try {
            setFolderBusy(true);
            await createFolder({ name });
            await queryClient.invalidateQueries({ queryKey: ["folders"] });
            toast.success(`Folder “${name}” created`, { toasterId: "normal" });
            setNewFolderName("");
            setIsCreatingFolder(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Couldn't create folder",
                { toasterId: "normal" },
            );
        } finally {
            setFolderBusy(false);
        }
    };

    const handleToggleFolderFavorite = async (folder: FolderOption) => {
        try {
            await updateFolder(folder.id, { isFavorite: !folder.isFavorite });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Couldn't update folder",
                { toasterId: "normal" },
            );
        }
    };

    const handleDeleteFolder = async (folder: FolderOption) => {
        const confirmed = window.confirm(
            `Delete the folder “${folder.name}”? Notes must be moved out first.`,
        );
        if (!confirmed) return;
        try {
            await deleteFolder(folder.id);
            await queryClient.invalidateQueries({ queryKey: ["folders"] });
            if (view.kind === "folder" && view.folderId === folder.id) {
                setView({ kind: "all" });
            }
            toast.success(`Folder “${folder.name}” deleted`, {
                toasterId: "normal",
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Couldn't delete folder",
                { toasterId: "normal" },
            );
        }
    };

    const handleLogout = () => signOut({ redirectTo: "/" });

    const allCount = notes.length;
    const favCount = notes.filter((n) => n.isFavorite).length;

    const orderedFolders = [...folders].sort((a, b) => {
        if (Boolean(b.isFavorite) !== Boolean(a.isFavorite)) {
            return b.isFavorite ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
    });

    const NavItem = ({
        active,
        icon,
        label,
        count,
        onClick,
    }: {
        active: boolean;
        icon: React.ReactNode;
        label: string;
        count: number;
        onClick: () => void;
    }) => (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium outline-none transition-colors duration-150",
                "focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]",
                active ? "bg-primary/20" : "hover:bg-muted/40",
            )}
        >
            <span className={cn("shrink-0", active && "text-primary")}>
                {icon}
            </span>
            <span className="flex-1 text-left">{label}</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">{count}</span>
        </button>
    );

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    aria-hidden
                    onClick={closeSidebar}
                    className="ds-animate-fade-in fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-muted bg-card",
                    "transition-transform duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)]",
                    "md:static md:z-auto md:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
                aria-label="Primary navigation"
            >
                {/* Brand */}
                <div className="flex items-center justify-between gap-2 px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Eton Note logo"
                            width={26}
                            height={26}
                            className="rounded-md"
                        />
                        <span className="text-[15px] tracking-tight text-ink">
                            <span className="font-bold">Eton</span> Note
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <button
                            type="button"
                            aria-label="Close navigation"
                            onClick={closeSidebar}
                            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-card/80 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] md:hidden"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* New note */}
                <div className="px-4 pb-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground py-2.5 text-[13px] font-semibold outline-none transition-[transform,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] focus-visible:ring-offset-2  active:scale-[0.98]"
                    >
                        <Plus
                            size={15}
                            strokeWidth={2.5}
                        />
                        New note
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 rounded-md border border-muted bg-card/80 px-3 py-2 transition-colors duration-150 focus-within:border-[color:var(--ds-border-input)] focus-within:ring-2 focus-within:ring-[color:var(--ds-focus-ring)]">
                        <Search
                            size={14}
                            className="shrink-0 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search notes…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => setSearchQuery("")}
                                className="shrink-0 text-muted-foreground outline-none transition-colors duration-150 hover:text-ink"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="px-2.5">
                    <NavItem
                        active={view.kind === "all"}
                        icon={<FileText size={15} />}
                        label="All notes"
                        count={allCount}
                        onClick={() => selectView({ kind: "all" })}
                    />
                    <NavItem
                        active={view.kind === "favorites"}
                        icon={<Star size={15} />}
                        label="Favorites"
                        count={favCount}
                        onClick={() => selectView({ kind: "favorites" })}
                    />
                </nav>

                {/* Folders header */}
                <div className="flex items-center justify-between px-5 pb-1.5 pt-5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Folders
                    </span>
                    <button
                        type="button"
                        aria-label="New folder"
                        onClick={() => setIsCreatingFolder((v) => !v)}
                        className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-card/80 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                    >
                        <FolderPlus size={14} />
                    </button>
                </div>

                {/* Folder list */}
                <div className="flex-1 overflow-y-auto px-2.5 pb-3">
                    {isCreatingFolder && (
                        <div className="mb-1 flex items-center gap-1 px-1">
                            <input
                                ref={newFolderInputRef}
                                value={newFolderName}
                                onChange={(e) =>
                                    setNewFolderName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateFolder();
                                    if (e.key === "Escape") {
                                        setIsCreatingFolder(false);
                                        setNewFolderName("");
                                    }
                                }}
                                placeholder="Folder name"
                                className="min-w-0 flex-1 rounded-md border border-[color:var(--ds-border-input)] bg-card/80 px-2.5 py-1.5 text-[13px] text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                            />
                            <button
                                type="button"
                                aria-label="Create folder"
                                disabled={!newFolderName.trim() || folderBusy}
                                onClick={handleCreateFolder}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[color:var(--ds-success)] outline-none transition-colors duration-150 hover:bg-card/80 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] disabled:opacity-40"
                            >
                                <Check size={15} />
                            </button>
                            <button
                                type="button"
                                aria-label="Cancel"
                                onClick={() => {
                                    setIsCreatingFolder(false);
                                    setNewFolderName("");
                                }}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-card/80 hover:text-ink focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <ul>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SidebarNoteSkeleton key={i} />
                            ))}
                        </ul>
                    ) : orderedFolders.length > 0 ? (
                        <ul className="flex flex-col gap-0.5">
                            {orderedFolders.map((folder) => {
                                const color = resolveFolderColor(folder.color);
                                const active =
                                    view.kind === "folder" &&
                                    view.folderId === folder.id;
                                const count = notes.filter(
                                    (n) => n.folderId === folder.id,
                                ).length;
                                return (
                                    <li
                                        key={folder.id}
                                        className="group/folder"
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors duration-150",
                                                active
                                                    ? "bg-primary/20"
                                                    : "hover:bg-muted/40",
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectView({
                                                        kind: "folder",
                                                        folderId: folder.id,
                                                    })
                                                }
                                                aria-current={
                                                    active ? "page" : undefined
                                                }
                                                className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                                            >
                                                <span
                                                    className={cn(
                                                        "h-2.5 w-2.5 shrink-0 rounded-full",
                                                        active
                                                            ? "bg-accent"
                                                            : "bg-muted",
                                                    )}
                                                />
                                                <span
                                                    className={
                                                        "min-w-0 flex-1 truncate text-[13px] font-medium"
                                                    }
                                                >
                                                    {folder.name}
                                                </span>
                                            </button>

                                            {/* Right cluster: count is always
                                                present (no hover layout shift);
                                                actions fade in but keep their
                                                space + tab order. */}
                                            <div className="flex shrink-0 items-center">
                                                <button
                                                    type="button"
                                                    aria-label={
                                                        folder.isFavorite
                                                            ? "Unfavorite folder"
                                                            : "Favorite folder"
                                                    }
                                                    onClick={() =>
                                                        handleToggleFolderFavorite(
                                                            folder,
                                                        )
                                                    }
                                                    className={cn(
                                                        "grid h-6 w-6 place-items-center rounded-md outline-none transition-colors duration-150 hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]",
                                                        folder.isFavorite
                                                            ? "text-brand opacity-100"
                                                            : "text-muted-foreground opacity-0 hover:text-ink focus-visible:opacity-100 group-hover/folder:opacity-100",
                                                    )}
                                                >
                                                    <Star
                                                        size={13}
                                                        className={
                                                            folder.isFavorite
                                                                ? "fill-current"
                                                                : ""
                                                        }
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Delete folder"
                                                    onClick={() =>
                                                        handleDeleteFolder(
                                                            folder,
                                                        )
                                                    }
                                                    className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground opacity-0 outline-none transition-colors duration-150 hover:bg-background/80 hover:text-[color:var(--ds-danger)] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)] group-hover/folder:opacity-100"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                                <span className="w-6 text-right text-[11px] text-muted-foreground tabular-nums">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="px-3 pt-1 text-[12px] text-muted-foreground">
                            No folders yet.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-muted px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                                {data?.user?.image ? (
                                    <Image
                                        alt="User avatar"
                                        src={data.user.image}
                                        height={28}
                                        width={28}
                                        className="h-7 w-7"
                                    />
                                ) : (
                                    (data?.user?.name?.charAt(0) ?? "U")
                                )}
                            </div>
                            <span className="truncate text-[12px] font-medium text-body">
                                {data?.user?.name ?? "Account"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="focus-visible:outline-0">
                                    <div
                                        aria-label="Settings"
                                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-card/80 hover:text-ink"
                                    >
                                        <Settings size={15} />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <CustomThemeSelector />
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOutIcon />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                        </div>
                    </div>
                </div>
            </aside>

            <HomePage
                view={view}
                setView={setView}
                folders={folders}
                searchQuery={searchQuery}
                fetching={isLoading}
                onCreateNote={() => setIsCreateModalOpen(true)}
                onOpenSidebar={() => setSidebarOpen(true)}
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
