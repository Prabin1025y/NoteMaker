"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Eraser,
    Paintbrush,
    RotateCcw,
    Trash2,
    Undo2,
} from "lucide-react";

/**
 * Freehand drawing / handwriting block editor.
 *
 * Content is serialized as JSON:
 *   { version, width, height, background, dataUrl, strokes }
 * - `dataUrl` is a rasterized PNG used for static display + PDF export.
 * - `strokes` are kept so the drawing can be re-opened and edited losslessly.
 *
 * Rendering uses two canvases: an offscreen transparent "ink" layer (so the
 * eraser can remove ink via destination-out without touching the paper), and a
 * visible layer that paints the paper background then composites the ink on top.
 */

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 620;

type CanvasBackground = "blank" | "grid" | "dots" | "ruled";

type Stroke = {
    color: string;
    size: number;
    mode: "pen" | "eraser";
    points: number[][]; // [ [x, y], ... ] in internal canvas coords
};

type CanvasDoc = {
    version: number;
    width: number;
    height: number;
    background: CanvasBackground;
    dataUrl: string;
    strokes: Stroke[];
};

const PEN_COLORS = [
    { key: "ink", value: "#171b21", label: "Ink" },
    { key: "amber", value: "#c78316", label: "Amber" },
    { key: "red", value: "#d64550", label: "Red" },
    { key: "green", value: "#1f9d63", label: "Green" },
    { key: "blue", value: "#4a90c2", label: "Blue" },
    { key: "plum", value: "#8a6bb0", label: "Plum" },
];

const PEN_SIZES = [
    { key: "fine", value: 2.5, label: "Fine", dot: 5 },
    { key: "medium", value: 5, label: "Medium", dot: 8 },
    { key: "bold", value: 9, label: "Bold", dot: 12 },
];

const BACKGROUNDS: { key: CanvasBackground; label: string }[] = [
    { key: "blank", label: "Blank" },
    { key: "grid", label: "Grid" },
    { key: "dots", label: "Dots" },
    { key: "ruled", label: "Ruled" },
];

interface CanvasSectionProps {
    content: string;
    onChangeHandler: (content: string) => void;
}

const parseDoc = (content: string): CanvasDoc | null => {
    if (!content) return null;
    try {
        const parsed = JSON.parse(content);
        if (!parsed || !Array.isArray(parsed.strokes)) return null;
        return parsed as CanvasDoc;
    } catch {
        return null;
    }
};

/** Paint the chosen paper pattern onto a 2D context. */
const paintBackground = (
    ctx: CanvasRenderingContext2D,
    background: CanvasBackground,
) => {
    ctx.save();
    // Paper base is always white so dark ink stays legible everywhere (incl. PDF).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const line = "#e3e6ea";
    const dot = "#cfd6df";
    const step = 28;

    if (background === "grid") {
        ctx.strokeStyle = line;
        ctx.lineWidth = 1;
        for (let x = step; x < CANVAS_WIDTH; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = step; y < CANVAS_HEIGHT; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    } else if (background === "dots") {
        ctx.fillStyle = dot;
        for (let x = step; x < CANVAS_WIDTH; x += step) {
            for (let y = step; y < CANVAS_HEIGHT; y += step) {
                ctx.beginPath();
                ctx.arc(x, y, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (background === "ruled") {
        ctx.strokeStyle = line;
        ctx.lineWidth = 1;
        for (let y = step * 1.4; y < CANVAS_HEIGHT; y += step * 1.4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
        // Left margin rule.
        ctx.strokeStyle = "#f0d0c8";
        ctx.beginPath();
        ctx.moveTo(64, 0);
        ctx.lineTo(64, CANVAS_HEIGHT);
        ctx.stroke();
    }
    ctx.restore();
};

/** Replay a single stroke onto the (transparent) ink context. */
const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.size;

    if (stroke.mode === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
    }

    const pts = stroke.points;

    if (pts.length === 1) {
        // A single tap: draw a dot.
        ctx.beginPath();
        ctx.arc(pts[0][0], pts[0][1], stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle =
            stroke.mode === "eraser" ? "rgba(0,0,0,1)" : stroke.color;
        ctx.fill();
        ctx.restore();
        return;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();
    ctx.restore();
};

const CanvasSection = ({ content, onChangeHandler }: CanvasSectionProps) => {
    const viewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const strokesRef = useRef<Stroke[]>([]);
    const activeStrokeRef = useRef<Stroke | null>(null);
    const isDrawingRef = useRef(false);
    // Guard so we only hydrate from a given `content` string once.
    const hydratedKeyRef = useRef<string | null>(null);

    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [color, setColor] = useState(PEN_COLORS[0].value);
    const [size, setSize] = useState(PEN_SIZES[1].value);
    const [background, setBackground] = useState<CanvasBackground>("blank");
    const [isEmpty, setIsEmpty] = useState(true);

    // Lazily create the offscreen ink canvas.
    const getInkCanvas = useCallback(() => {
        if (!inkCanvasRef.current) {
            const c = document.createElement("canvas");
            c.width = CANVAS_WIDTH;
            c.height = CANVAS_HEIGHT;
            inkCanvasRef.current = c;
        }
        return inkCanvasRef.current;
    }, []);

    const redrawView = useCallback(() => {
        const view = viewCanvasRef.current;
        const ink = getInkCanvas();
        if (!view) return;
        const ctx = view.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        paintBackground(ctx, background);
        ctx.drawImage(ink, 0, 0);
    }, [background, getInkCanvas]);

    // Rebuild the ink layer from the current strokes (used on load / undo / clear).
    const rebuildInk = useCallback(() => {
        const ink = getInkCanvas();
        const ctx = ink.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (const stroke of strokesRef.current) {
            drawStroke(ctx, stroke);
        }
    }, [getInkCanvas]);

    /** Composite paper + ink and serialize the whole document to the parent. */
    const serialize = useCallback(
        (bg: CanvasBackground) => {
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = CANVAS_WIDTH;
            exportCanvas.height = CANVAS_HEIGHT;
            const ex = exportCanvas.getContext("2d");
            const ink = getInkCanvas();
            if (!ex) return;

            paintBackground(ex, bg);
            ex.drawImage(ink, 0, 0);

            const hasStrokes = strokesRef.current.length > 0;
            setIsEmpty(!hasStrokes);

            const doc: CanvasDoc = {
                version: 1,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                background: bg,
                dataUrl: hasStrokes ? exportCanvas.toDataURL("image/png") : "",
                strokes: strokesRef.current,
            };

            const serialized = JSON.stringify(doc);
            hydratedKeyRef.current = serialized;
            onChangeHandler(serialized);
        },
        [getInkCanvas, onChangeHandler],
    );

    // Hydrate from incoming content (edit mode) exactly once per content string.
    useEffect(() => {
        if (hydratedKeyRef.current === content) return;

        const doc = parseDoc(content);
        strokesRef.current = doc?.strokes ?? [];
        const bg = doc?.background ?? "blank";

        hydratedKeyRef.current = content;
        setBackground(bg);
        setIsEmpty(strokesRef.current.length === 0);
        rebuildInk();
        // redrawView reads `background` state which may not have flushed yet, so
        // draw against the resolved bg directly here.
        const view = viewCanvasRef.current;
        const ink = getInkCanvas();
        const ctx = view?.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            paintBackground(ctx, bg);
            ctx.drawImage(ink, 0, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    // Repaint when the background changes via the toolbar.
    useEffect(() => {
        redrawView();
    }, [background, redrawView]);

    const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = viewCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = viewCanvasRef.current;
        canvas?.setPointerCapture(e.pointerId);
        isDrawingRef.current = true;

        const { x, y } = pointerPos(e);
        const stroke: Stroke = {
            color,
            size: tool === "eraser" ? size * 2.4 : size,
            mode: tool,
            points: [[x, y]],
        };
        activeStrokeRef.current = stroke;

        // Draw the initial dot immediately.
        const ink = getInkCanvas();
        const ctx = ink.getContext("2d");
        if (ctx) drawStroke(ctx, stroke);
        redrawView();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || !activeStrokeRef.current) return;
        e.preventDefault();

        const { x, y } = pointerPos(e);
        const stroke = activeStrokeRef.current;
        const prev = stroke.points[stroke.points.length - 1];
        stroke.points.push([x, y]);

        // Incrementally draw just the new segment for smoothness.
        const ink = getInkCanvas();
        const ctx = ink.getContext("2d");
        if (ctx && prev) {
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = stroke.size;
            if (stroke.mode === "eraser") {
                ctx.globalCompositeOperation = "destination-out";
                ctx.strokeStyle = "rgba(0,0,0,1)";
            } else {
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = stroke.color;
            }
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.restore();
        }
        redrawView();
    };

    const finishStroke = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        const stroke = activeStrokeRef.current;
        activeStrokeRef.current = null;
        if (stroke && stroke.points.length > 0) {
            strokesRef.current = [...strokesRef.current, stroke];
            serialize(background);
        }
    };

    const handleUndo = () => {
        if (strokesRef.current.length === 0) return;
        strokesRef.current = strokesRef.current.slice(0, -1);
        rebuildInk();
        redrawView();
        serialize(background);
    };

    const handleClear = () => {
        if (strokesRef.current.length === 0) return;
        strokesRef.current = [];
        rebuildInk();
        redrawView();
        serialize(background);
    };

    const changeBackground = (bg: CanvasBackground) => {
        setBackground(bg);
        // Re-serialize so the stored dataUrl reflects the new paper.
        // redrawView happens via effect; serialize uses the ink layer + bg.
        requestAnimationFrame(() => serialize(bg));
    };

    const toolButtonBase =
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors";

    const swatches = useMemo(() => PEN_COLORS, []);

    return (
        <div className="flex flex-1 flex-col gap-3 min-h-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-paper px-3 py-2">
                {/* Pen / Eraser */}
                <div className="flex items-center gap-1 rounded-lg bg-surface p-1 ring-1 ring-hairline">
                    <button
                        type="button"
                        onClick={() => setTool("pen")}
                        className={`${toolButtonBase} ${
                            tool === "pen"
                                ? "bg-brand text-[color:var(--ds-accent-contrast)]"
                                : "text-muted-ink hover:bg-tint"
                        }`}
                    >
                        <Paintbrush size={14} />
                        Pen
                    </button>
                    <button
                        type="button"
                        onClick={() => setTool("eraser")}
                        className={`${toolButtonBase} ${
                            tool === "eraser"
                                ? "bg-brand text-[color:var(--ds-accent-contrast)]"
                                : "text-muted-ink hover:bg-tint"
                        }`}
                    >
                        <Eraser size={14} />
                        Eraser
                    </button>
                </div>

                <div className="h-6 w-px bg-hairline" />

                {/* Colors */}
                <div className="flex items-center gap-1.5">
                    {swatches.map((c) => {
                        const active = color === c.value && tool === "pen";
                        return (
                            <button
                                key={c.key}
                                type="button"
                                aria-label={c.label}
                                title={c.label}
                                onClick={() => {
                                    setColor(c.value);
                                    setTool("pen");
                                }}
                                className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                                    active
                                        ? "ring-2 ring-offset-2 ring-offset-paper"
                                        : "ring-1 ring-black/10"
                                }`}
                                style={{
                                    backgroundColor: c.value,
                                    // active ring uses the swatch color itself
                                    ...(active
                                        ? ({
                                              "--tw-ring-color": c.value,
                                          } as React.CSSProperties)
                                        : {}),
                                }}
                            />
                        );
                    })}
                </div>

                <div className="h-6 w-px bg-hairline" />

                {/* Sizes */}
                <div className="flex items-center gap-1">
                    {PEN_SIZES.map((s) => {
                        const active = size === s.value;
                        return (
                            <button
                                key={s.key}
                                type="button"
                                title={s.label}
                                onClick={() => setSize(s.value)}
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                    active
                                        ? "bg-brand-soft ring-1 ring-brand"
                                        : "hover:bg-tint"
                                }`}
                            >
                                <span
                                    className="rounded-full bg-ink"
                                    style={{
                                        width: s.dot,
                                        height: s.dot,
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="h-6 w-px bg-hairline" />

                {/* Background selector */}
                <div className="flex items-center gap-1">
                    {BACKGROUNDS.map((b) => {
                        const active = background === b.key;
                        return (
                            <button
                                key={b.key}
                                type="button"
                                onClick={() => changeBackground(b.key)}
                                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                                    active
                                        ? "bg-ink text-white"
                                        : "text-muted-ink hover:bg-tint"
                                }`}
                            >
                                {b.label}
                            </button>
                        );
                    })}
                </div>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handleUndo}
                        title="Undo last stroke"
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-ink transition-colors hover:bg-tint"
                    >
                        <Undo2 size={14} />
                        Undo
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        title="Clear canvas"
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--ds-danger)] transition-colors hover:bg-[color:var(--ds-danger)]/10"
                    >
                        <Trash2 size={14} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Drawing surface */}
            <div className="relative flex-1 min-h-0 overflow-auto rounded-xl border border-hairline bg-[#f3f4f6] p-4">
                <canvas
                    ref={viewCanvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishStroke}
                    onPointerLeave={finishStroke}
                    onPointerCancel={finishStroke}
                    className="mx-auto block w-full max-w-[900px] rounded-lg bg-white shadow-sm ring-1 ring-black/5"
                    style={{
                        touchAction: "none",
                        cursor:
                            tool === "eraser" ? "cell" : "crosshair",
                        aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                    }}
                />

                {isEmpty && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-faint">
                            <RotateCcw size={22} className="opacity-40" />
                            <p className="text-[13px]">
                                Draw or handwrite anything — sketches,
                                equations, diagrams.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CanvasSection;
