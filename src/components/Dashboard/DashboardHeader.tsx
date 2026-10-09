import { useDashboardStore } from "@/Context/DashboardStore";
import { NoteType } from "@/types/custom/notes";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ArrowDownUp, Check, LayoutGrid, List } from "lucide-react";
import { SORT_OPTIONS } from "@/utils/UtilFunctions";
import { cn } from "@/lib/utils";

const DashboardHeader = ({
    title,
    filteredNotes,
}: {
    title: string;
    filteredNotes: NoteType[];
}) => {
    const { searchQuery, sort, setSort, layout, setLayout } =
        useDashboardStore();
    return (
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-[26px] font-semibold tracking-tight text-ink text-balance">
                    {title}
                </h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    {searchQuery.trim()
                        ? `${filteredNotes.length} ${filteredNotes.length === 1 ? "result" : "results"} for “${searchQuery.trim()}”`
                        : "Notes"}
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-muted bg-card/80 px-3 text-[13px] font-medium text-body outline-none transition-colors duration-150 hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
                        >
                            <ArrowDownUp size={14} />
                            <span className="hidden sm:inline">
                                {
                                    SORT_OPTIONS.find((o) => o.key === sort)
                                        ?.label
                                }
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-44"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <DropdownMenuItem
                                key={option.key}
                                onSelect={() => setSort(option.key)}
                                className="cursor-pointer"
                            >
                                <span className="flex w-full items-center justify-between">
                                    {option.label}
                                    {sort === option.key && <Check size={14} />}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center rounded-lg border border-muted bg-card/80 p-0.5">
                    {(
                        [
                            {
                                key: "grid",
                                icon: LayoutGrid,
                                label: "Grid view",
                            },
                            {
                                key: "list",
                                icon: List,
                                label: "List view",
                            },
                        ] as const
                    ).map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            type="button"
                            aria-label={label}
                            aria-pressed={layout === key}
                            onClick={() => setLayout(key)}
                            className={cn(
                                "grid h-8 w-8 place-items-center rounded-[6px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)",
                                layout === key && "bg-primary/20 text-primary",
                            )}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
