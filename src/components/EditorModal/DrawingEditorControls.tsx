"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    COLOR_IDS, DASH_IDS, FILL_IDS, GEO_IDS, GRID_IDS, SIZE_IDS,
    type Editor, type GeoId, type GridId, type Styles, type ToolId,
} from "@quickdrawjs/react";
import {
    ArrowUpRight, Copy, Eraser, Hand, Highlighter, ImagePlus, Minus,
    MoreHorizontal, MousePointer2, Pencil, Redo2, Shapes, StickyNote,
    SlidersHorizontal, Target, Trash2, Type, Undo2, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tools = [
    { id: "select", label: "Select", icon: MousePointer2 },
    { id: "hand", label: "Pan", icon: Hand },
    { id: "draw", label: "Draw", icon: Pencil },
    { id: "highlight", label: "Highlighter", icon: Highlighter },
    { id: "eraser", label: "Eraser", icon: Eraser },
    { id: "laser", label: "Laser pointer", icon: Target },
    { id: "line", label: "Line", icon: Minus },
    { id: "arrow", label: "Arrow", icon: ArrowUpRight },
    { id: "geo", label: "Shape", icon: Shapes },
    { id: "text", label: "Text", icon: Type },
    { id: "note", label: "Sticky note", icon: StickyNote },
] satisfies Array<{ id: ToolId; label: string; icon: typeof Pencil }>;

function DrawingOption({ label, value, options, onChange }: {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
}) {
    const id = useId();
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-body">{label}</label>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] capitalize text-ink outline-none focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring)"
            >
                {!value && <option value="" disabled>Mixed</option>}
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    );
}

interface DrawingEditorControlsProps {
    editor: Editor;
    toolbarTarget: HTMLDivElement | null;
    settingsTarget: HTMLDivElement | null;
}

export default function DrawingEditorControls({ editor, toolbarTarget, settingsTarget }: DrawingEditorControlsProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsId = useId();
    const settingsButton = useRef<HTMLButtonElement>(null);
    const [, refresh] = useReducer((value: number) => value + 1, 0);
    useEffect(() => {
        const unsubscribe = ["tool", "styles", "history", "selection", "theme", "grid"]
            .map((event) => editor.on(event as Parameters<Editor["on"]>[0], refresh));
        return () => unsubscribe.forEach((off) => off());
    }, [editor]);

    const styles = editor.currentStyles();
    const hasSelection = editor.selection.size > 0;
    const run = async (action: () => Promise<void>) => {
        try { await action(); }
        catch (error) { toast.error(error instanceof Error ? error.message : "Drawing action failed. Try again."); }
    };
    const exportImage = async (background: boolean, selection = false) => {
        const blob = await editor.exportImage({
            background,
            ids: selection ? new Set(editor.selection) : null,
        });
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "drawing.png";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    return (
        <>
            {toolbarTarget && createPortal(
                <div role="toolbar" aria-label="Drawing tools" className="flex min-h-11 items-center gap-1 whitespace-nowrap">
                    <Button variant="ghost" size="icon-sm" aria-label="Undo drawing" disabled={!editor.store.canUndo} onClick={() => editor.store.undo()}><Undo2 size={16} /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Redo drawing" disabled={!editor.store.canRedo} onClick={() => editor.store.redo()}><Redo2 size={16} /></Button>
                    <span className="mx-1 h-5 w-px shrink-0 bg-muted" />
                    {tools.map(({ id, label, icon: Icon }) => (
                        <Button
                            key={id}
                            variant="ghost"
                            size="icon-sm"
                            title={label}
                            aria-label={label}
                            aria-pressed={editor.tool === id}
                            onClick={() => editor.setTool(id)}
                            className={editor.tool === id ? "bg-primary/10 text-primary" : ""}
                        ><Icon size={16} /></Button>
                    ))}
                    <Button variant="ghost" size="icon-sm" title="Insert drawing image" aria-label="Insert drawing image" onClick={() => editor.pickImage()}><ImagePlus size={16} /></Button>
                    <span className="mx-1 h-5 w-px shrink-0 bg-muted" />
                    <Button variant="ghost" size="icon-sm" aria-label="Duplicate drawing selection" disabled={!hasSelection} onClick={() => editor.duplicateSelection()}><Copy size={16} /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Delete drawing selection" disabled={!hasSelection} onClick={() => editor.deleteSelection()}><Trash2 size={16} /></Button>
                    <Button ref={settingsButton} variant="ghost" size="icon-sm" title="Drawing options" aria-label="Drawing options" aria-expanded={settingsOpen} aria-controls={settingsId} onClick={() => setSettingsOpen((open) => !open)}><SlidersHorizontal size={16} /></Button>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Drawing actions"><MoreHorizontal size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="end" collisionBoundary={editor.container} collisionPadding={8} className="w-56 max-w-(--radix-dropdown-menu-content-available-width)">
                            <DropdownMenuItem onSelect={() => void run(() => exportImage(true))}>Export as PNG</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void run(() => exportImage(false))}>Export transparent PNG</DropdownMenuItem>
                            <DropdownMenuItem disabled={!hasSelection} onSelect={() => void run(() => exportImage(true, true))}>Export selection</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void run(async () => {
                                const blob = await editor.exportImage({ background: true, ids: hasSelection ? new Set(editor.selection) : null });
                                if (blob) await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                            })}>Copy as image</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => editor.fitContent({ animate: 220 })}>Zoom to fit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => editor.clearBoard()}>Clear board</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>, toolbarTarget,
            )}
            {settingsTarget && settingsOpen && createPortal(
                <aside id={settingsId} aria-label="Drawing options" className="space-y-5 rounded-lg border border-muted bg-card p-4 shadow-lg" onKeyDown={(event) => {
                    if (event.key !== "Escape") return;
                    event.preventDefault();
                    setSettingsOpen(false);
                    settingsButton.current?.focus();
                }}>
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[13px] font-semibold text-ink">Drawing options</h3>
                        <Button variant="ghost" size="icon-sm" aria-label="Close drawing options" onClick={() => {
                            setSettingsOpen(false);
                            settingsButton.current?.focus();
                        }}><X size={15} /></Button>
                    </div>
                    <div>
                        <p className="mb-3 text-[13px] font-semibold text-body">Drawing color</p>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(1.75rem,1fr))] gap-2">
                            {COLOR_IDS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`${color} drawing color`}
                                    aria-pressed={styles.color === color}
                                    title={color}
                                    onClick={() => editor.setStyle("color", color)}
                                    style={{ backgroundColor: editor.theme.colors[color].stroke }}
                                    className={`h-7 w-7 rounded-full border border-muted outline-none focus-visible:ring-2 focus-visible:ring-(--ds-focus-ring) ${styles.color === color ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                                />
                            ))}
                        </div>
                    </div>
                    <DrawingOption label="Stroke size" value={styles.size ?? ""} options={SIZE_IDS} onChange={(value) => editor.setStyle("size", value as Styles["size"])} />
                    <DrawingOption label="Stroke style" value={styles.dash ?? ""} options={DASH_IDS} onChange={(value) => editor.setStyle("dash", value as Styles["dash"])} />
                    <DrawingOption label="Fill" value={styles.fill ?? ""} options={FILL_IDS} onChange={(value) => editor.setStyle("fill", value as Styles["fill"])} />
                    <DrawingOption label="Shape" value={editor.geoKind} options={GEO_IDS} onChange={(value) => { editor.setGeoKind(value as GeoId); editor.setTool("geo"); }} />
                    <DrawingOption label="Grid" value={editor.grid} options={GRID_IDS} onChange={(value) => editor.setGrid(value as GridId)} />
                    <DrawingOption label="Drawing theme" value={editor.theme.id} options={["light", "dark"]} onChange={(value) => editor.setTheme(value)} />
                </aside>, settingsTarget,
            )}
        </>
    );
}
