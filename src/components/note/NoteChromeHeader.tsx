"use client";

import {
    ArrowLeft,
    Eye,
    Redo2,
    Save,
    Search,
    Undo2,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/Context/DataStore";

interface NoteChromeHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onHomeClick: () => void;
    onSave: () => void;
    onExport: () => void;
    onPreview: () => void;
    isSyncing: boolean;
    isExporting: boolean;
    hasUnsaved: boolean;
    isPreviewMode?: boolean;
}

const NoteChromeHeader = ({
    searchQuery,
    onSearchChange,
    onHomeClick,
    onSave,
    onExport,
    onPreview,
    isSyncing,
    isExporting,
    hasUnsaved,
    isPreviewMode = false,
}: NoteChromeHeaderProps) => {
    const { currentNote, blocks, undo, redo, canUndo, canRedo } =
        useNoteStore();

    return (
        <header className="shrink-0 flex items-center gap-4 px-4 h-12 bg-surface border-b border-hairline">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHomeClick}
                    className="text-body hover:text-ink hover:bg-paper"
                >
                    <ArrowLeft size={15} />
                    Home
                </Button>
                <div className="h-4 w-px bg-hairline" />
                <div className="min-w-0">
                    <h1 className="text-[14px] font-semibold text-ink tracking-tight truncate max-w-[200px] lg:max-w-[280px]">
                        {currentNote?.title || "Untitled"}
                    </h1>
                    <p className="text-[11px] text-faint leading-none mt-0.5">
                        {blocks?.length ?? 0}{" "}
                        {(blocks?.length ?? 0) === 1 ? "block" : "blocks"}
                    </p>
                </div>
            </div>

            {/* Center — Search */}
            <div className="flex-1 flex justify-center max-w-md mx-auto">
                <div className="relative w-full">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search blocks..."
                        className="w-full h-8 pl-9 pr-3 text-[13px] rounded-lg border border-hairline bg-paper text-ink placeholder:text-faint outline-none transition-colors focus:border-[color:var(--ds-focus-ring)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)] focus:bg-surface"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={undo}
                    disabled={!canUndo()}
                    title="Undo"
                    className="text-muted-ink hover:text-ink hover:bg-paper disabled:opacity-30"
                >
                    <Undo2 size={15} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={redo}
                    disabled={!canRedo()}
                    title="Redo"
                    className="text-muted-ink hover:text-ink hover:bg-paper disabled:opacity-30"
                >
                    <Redo2 size={15} />
                </Button>

                <div className="h-4 w-px bg-hairline mx-1" />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreview}
                    className={`border-hairline text-body hover:bg-paper ${isPreviewMode ? "bg-brand-soft border-[color:var(--ds-accent-soft)] text-brand-cta" : ""}`}
                >
                    <Eye size={14} />
                    Preview
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={isSyncing || isExporting}
                    className="relative bg-brand-cta text-[color:var(--ds-accent-contrast)] transition-[filter] duration-150 hover:brightness-105 disabled:opacity-60"
                >
                    <Save size={14} />
                    {isSyncing ? "Saving..." : "Save"}
                    {hasUnsaved && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[color:var(--ds-danger)] rounded-full border-2 border-surface" />
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    disabled={isExporting}
                    className="border-hairline text-body hover:bg-paper disabled:opacity-60"
                >
                    <Upload size={14} />
                    {isExporting ? "Exporting..." : "Export"}
                </Button>
            </div>
        </header>
    );
};

export default NoteChromeHeader;
