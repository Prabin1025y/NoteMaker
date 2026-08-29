"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowRight,
    Circle,
    Eraser,
    Maximize2,
    Minimize2,
    Minus,
    Paintbrush,
    RotateCcw,
    Square,
    Trash2,
    Type,
    Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Freehand drawing / handwriting / shapes / text block editor.
 *
 * Content is serialized as JSON:
 *   { version, width, height, background, dataUrl, strokes }
 * - `dataUrl` is a rasterized PNG used for static display + PDF export.
 * - `strokes` holds every item on the canvas (freehand ink, shapes, and text)
 *   so the drawing can be re-opened and edited losslessly. The field name is
 *   kept as `strokes` for backward compatibility with documents saved before
 *   shapes/text existed — legacy freehand-only entries are normalized on load.
 *
 * Rendering uses two canvases: an offscreen transparent "ink" layer (so the
 * pixel eraser can remove ink via destination-out without touching the
 * background), and a visible layer that paints the background then
 * composites the ink (plus any live shape/text preview) on top.
 */

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 620;
const FONT_FAMILY = '"Segoe UI", system-ui, sans-serif';
const HIT_PADDING = 10;

type CanvasBackground = "blank" | "grid" | "dots" | "ruled";
type StrokeStyle = "solid" | "dashed";
type ShapeKind = "line" | "arrow" | "rectangle" | "circle";
type FreehandMode = "pen" | "eraser";
type Tool = FreehandMode | "stroke-eraser" | ShapeKind | "text";
type IconComponent = React.ComponentType<{ size?: number }>;

type FreehandStroke = {
    kind: "freehand";
    id: string;
    color: string;
    size: number;
    mode: FreehandMode;
    points: number[][]; // [ [x, y], ... ] in internal canvas coords
};

type ShapeStroke = {
    kind: "shape";
    id: string;
    shape: ShapeKind;
    color: string;
    size: number;
    style: StrokeStyle;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

type TextStroke = {
    kind: "text";
    id: string;
    color: string;
    fontSize: number;
    x: number;
    y: number;
    text: string;
};

type CanvasItem = FreehandStroke | ShapeStroke | TextStroke;

type CanvasDoc = {
    version: number;
    width: number;
    height: number;
    background: CanvasBackground;
    dataUrl: string;
    strokes: CanvasItem[];
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

const TEXT_SIZES = [
    { key: "small", value: 18, label: "Small", previewPx: 12 },
    { key: "medium", value: 26, label: "Medium", previewPx: 15 },
    { key: "large", value: 38, label: "Large", previewPx: 19 },
];

const BACKGROUNDS: { key: CanvasBackground; label: string }[] = [
    { key: "blank", label: "Blank" },
    { key: "grid", label: "Grid" },
    { key: "dots", label: "Dots" },
    { key: "ruled", label: "Ruled" },
];

const BORDER_STYLES: { key: StrokeStyle; label: string }[] = [
    { key: "solid", label: "Solid" },
    { key: "dashed", label: "Dashed" },
];

const SHAPE_KINDS: ShapeKind[] = ["line", "arrow", "rectangle", "circle"];

const SHAPE_ICON: Record<ShapeKind, IconComponent> = {
    line: Minus,
    arrow: ArrowRight,
    rectangle: Square,
    circle: Circle,
};

const SHAPE_LABEL: Record<ShapeKind, string> = {
    line: "Line",
    arrow: "Arrow",
    rectangle: "Rectangle",
    circle: "Circle",
};

const DRAW_TOOL_DEFS: {
    key: "pen" | "eraser" | "stroke-eraser";
    label: string;
    icon: IconComponent;
}[] = [
    { key: "pen", label: "Pen", icon: Paintbrush },
    { key: "eraser", label: "Eraser", icon: Eraser },
    { key: "stroke-eraser", label: "Stroke Eraser", icon: Eraser },
];

const isShapeTool = (tool: Tool): tool is ShapeKind =>
    (SHAPE_KINDS as Tool[]).includes(tool);

interface CanvasSectionProps {
    content: string;
    onChangeHandler: (content: string) => void;
}

let idCounter = 0;
const createId = () => {
    idCounter += 1;
    return `item-${Date.now().toString(36)}-${idCounter}`;
};

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

/** Migrate legacy (pre-shapes/text) freehand-only entries into the current item shape. */
const normalizeItems = (raw: unknown): CanvasItem[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((entry, index): CanvasItem => {
        const item = (entry ?? {}) as Record<string, unknown>;

        if (item.kind === "shape") {
            return {
                kind: "shape",
                id: typeof item.id === "string" ? item.id : `legacy-shape-${index}`,
                shape: (item.shape as ShapeKind) ?? "rectangle",
                color: (item.color as string) ?? PEN_COLORS[0].value,
                size: (item.size as number) ?? PEN_SIZES[1].value,
                style: (item.style as StrokeStyle) ?? "solid",
                x1: (item.x1 as number) ?? 0,
                y1: (item.y1 as number) ?? 0,
                x2: (item.x2 as number) ?? 0,
                y2: (item.y2 as number) ?? 0,
            };
        }

        if (item.kind === "text") {
            return {
                kind: "text",
                id: typeof item.id === "string" ? item.id : `legacy-text-${index}`,
                color: (item.color as string) ?? PEN_COLORS[0].value,
                fontSize: (item.fontSize as number) ?? TEXT_SIZES[1].value,
                x: (item.x as number) ?? 0,
                y: (item.y as number) ?? 0,
                text: typeof item.text === "string" ? item.text : "",
            };
        }

        // Legacy strokes predate `kind` entirely — treat anything else as freehand.
        return {
            kind: "freehand",
            id: typeof item.id === "string" ? item.id : `legacy-freehand-${index}`,
            color: (item.color as string) ?? PEN_COLORS[0].value,
            size: (item.size as number) ?? PEN_SIZES[1].value,
            mode: item.mode === "eraser" ? "eraser" : "pen",
            points: Array.isArray(item.points) ? (item.points as number[][]) : [],
        };
    });
};

/** Paint the chosen background pattern onto a 2D context. */
const paintBackground = (
    ctx: CanvasRenderingContext2D,
    background: CanvasBackground,
) => {
    ctx.save();
    // Base is always white so dark ink stays legible everywhere (incl. PDF).
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

/** Replay a single freehand stroke onto the (transparent) ink context. */
const drawFreehand = (ctx: CanvasRenderingContext2D, stroke: FreehandStroke) => {
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
        ctx.fillStyle = stroke.mode === "eraser" ? "rgba(0,0,0,1)" : stroke.color;
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

/** Draw a line / arrow / rectangle / circle shape onto a context. */
const drawShape = (ctx: CanvasRenderingContext2D, item: ShapeStroke) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = item.size;
    ctx.strokeStyle = item.color;
    ctx.globalCompositeOperation = "source-over";
    ctx.setLineDash(item.style === "dashed" ? [item.size * 2.4, item.size * 1.8] : []);

    const { x1, y1, x2, y2 } = item;

    if (item.shape === "line") {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    } else if (item.shape === "arrow") {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrowhead is drawn solid even when the shaft is dashed.
        const headLength = Math.max(10, item.size * 3.2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x2 + 10 * Math.cos(angle), y2 + 10 * Math.sin(angle));
        ctx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 7),
            y2 - headLength * Math.sin(angle - Math.PI / 7),
        );
        ctx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 7),
            y2 - headLength * Math.sin(angle + Math.PI / 7),
        );
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
    } else if (item.shape === "rectangle") {
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        ctx.strokeRect(x, y, w, h);
    } else {
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const rx = Math.max(Math.abs(x2 - x1) / 2, 0.01);
        const ry = Math.max(Math.abs(y2 - y1) / 2, 0.01);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
};

/** Draw a (possibly multi-line) text item onto a context. */
const drawText = (ctx: CanvasRenderingContext2D, item: TextStroke) => {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = item.color;
    ctx.font = `${item.fontSize}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top";
    const lines = item.text.split("\n");
    lines.forEach((line, i) => {
        ctx.fillText(line, item.x, item.y + i * item.fontSize * 1.25);
    });
    ctx.restore();
};

const drawItem = (ctx: CanvasRenderingContext2D, item: CanvasItem) => {
    if (item.kind === "freehand") drawFreehand(ctx, item);
    else if (item.kind === "shape") drawShape(ctx, item);
    else drawText(ctx, item);
};

const distanceToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

/** Whether (x, y) is close enough to `item` for the stroke eraser to pick it up. */
const hitTestItem = (
    item: CanvasItem,
    x: number,
    y: number,
    measureCtx: CanvasRenderingContext2D | null,
): boolean => {
    if (item.kind === "freehand") {
        // Eraser marks aren't "content" to click-delete — only ink strokes are.
        if (item.mode === "eraser") return false;
        const halfWidth = item.size / 2 + HIT_PADDING;
        const pts = item.points;
        if (pts.length === 1) {
            return Math.hypot(x - pts[0][0], y - pts[0][1]) <= halfWidth;
        }
        for (let i = 0; i < pts.length - 1; i++) {
            const d = distanceToSegment(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
            if (d <= halfWidth) return true;
        }
        return false;
    }

    if (item.kind === "shape") {
        const halfWidth = item.size / 2 + HIT_PADDING;
        const { shape, x1, y1, x2, y2 } = item;
        if (shape === "line" || shape === "arrow") {
            return distanceToSegment(x, y, x1, y1, x2, y2) <= halfWidth;
        }
        if (shape === "rectangle") {
            const left = Math.min(x1, x2);
            const right = Math.max(x1, x2);
            const top = Math.min(y1, y2);
            const bottom = Math.max(y1, y2);
            const edges: [number, number, number, number][] = [
                [left, top, right, top],
                [right, top, right, bottom],
                [right, bottom, left, bottom],
                [left, bottom, left, top],
            ];
            return edges.some(([ex1, ey1, ex2, ey2]) =>
                distanceToSegment(x, y, ex1, ey1, ex2, ey2) <= halfWidth,
            );
        }
        // circle / ellipse: approximate distance to the boundary via the
        // normalized radius (exact for a circle, a close approximation otherwise).
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const rx = Math.max(Math.abs(x2 - x1) / 2, 0.01);
        const ry = Math.max(Math.abs(y2 - y1) / 2, 0.01);
        const normalized = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
        const approxDist = Math.abs(normalized - 1) * Math.min(rx, ry);
        return approxDist <= halfWidth;
    }

    // text: approximate bounding box using measured line widths.
    if (!measureCtx) return false;
    measureCtx.font = `${item.fontSize}px ${FONT_FAMILY}`;
    const lines = item.text.split("\n");
    const width = Math.max(...lines.map((line) => measureCtx.measureText(line).width), 1);
    const height = lines.length * item.fontSize * 1.25;
    return (
        x >= item.x - HIT_PADDING &&
        x <= item.x + width + HIT_PADDING &&
        y >= item.y - HIT_PADDING &&
        y <= item.y + height + HIT_PADDING
    );
};

/** Apply the shift-key constraint for the shape currently being dragged. */
const constrainShapeEnd = (
    shape: ShapeKind,
    start: { x: number; y: number },
    point: { x: number; y: number },
    shiftKey: boolean,
) => {
    if (!shiftKey) return point;

    const dx = point.x - start.x;
    const dy = point.y - start.y;

    if (shape === "rectangle" || shape === "circle") {
        // Square from the rectangle tool, perfect circle from the circle tool.
        const side = Math.max(Math.abs(dx), Math.abs(dy));
        return {
            x: start.x + (dx < 0 ? -side : side),
            y: start.y + (dy < 0 ? -side : side),
        };
    }

    // line / arrow: snap the angle to the nearest 45°.
    const distance = Math.hypot(dx, dy);
    const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
    return {
        x: start.x + distance * Math.cos(angle),
        y: start.y + distance * Math.sin(angle),
    };
};

const CanvasSection = ({ content, onChangeHandler }: CanvasSectionProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const itemsRef = useRef<CanvasItem[]>([]);
    const activeStrokeRef = useRef<FreehandStroke | null>(null);
    const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
    const activeShapePreviewRef = useRef<ShapeStroke | null>(null);
    const isDrawingRef = useRef(false);
    const eraseChangedRef = useRef(false);
    // Guard so we only hydrate from a given `content` string once.
    const hydratedKeyRef = useRef<string | null>(null);

    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState(PEN_COLORS[0].value);
    const [size, setSize] = useState(PEN_SIZES[1].value);
    const [textFontSize, setTextFontSize] = useState(TEXT_SIZES[1].value);
    const [borderStyle, setBorderStyle] = useState<StrokeStyle>("solid");
    const [background, setBackground] = useState<CanvasBackground>("blank");
    const [isEmpty, setIsEmpty] = useState(true);
    const [textEditor, setTextEditor] = useState<{ x: number; y: number; value: string } | null>(
        null,
    );
    const [canvasScale, setCanvasScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Lazily create an offscreen context used only to measure text for hit-testing.
    const getMeasureCtx = useCallback(() => {
        if (!measureCanvasRef.current) {
            measureCanvasRef.current = document.createElement("canvas");
        }
        return measureCanvasRef.current.getContext("2d");
    }, []);

    const redrawView = useCallback(
        (preview?: CanvasItem | null) => {
            const view = viewCanvasRef.current;
            const ink = getInkCanvas();
            if (!view) return;
            const ctx = view.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            paintBackground(ctx, background);
            ctx.drawImage(ink, 0, 0);
            if (preview) drawItem(ctx, preview);
        },
        [background, getInkCanvas],
    );

    // Rebuild the ink layer from the current items (used on load / undo / clear / erase).
    const rebuildInk = useCallback(() => {
        const ink = getInkCanvas();
        const ctx = ink.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (const item of itemsRef.current) {
            drawItem(ctx, item);
        }
    }, [getInkCanvas]);

    /** Composite background + ink and serialize the whole document to the parent. */
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

            const hasContent = itemsRef.current.length > 0;
            setIsEmpty(!hasContent);

            const doc: CanvasDoc = {
                version: 1,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                background: bg,
                dataUrl: hasContent ? exportCanvas.toDataURL("image/png") : "",
                strokes: itemsRef.current,
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
        itemsRef.current = normalizeItems(doc?.strokes);
        const bg = doc?.background ?? "blank";

        hydratedKeyRef.current = content;
        setBackground(bg);
        setIsEmpty(itemsRef.current.length === 0);
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

    // Track the canvas's rendered size so the text editor overlay (a real DOM
    // element) shows text at the same size it will actually render at.
    useEffect(() => {
        const view = viewCanvasRef.current;
        if (!view || typeof ResizeObserver === "undefined") return;
        const update = () => {
            const rect = view.getBoundingClientRect();
            if (rect.width > 0) setCanvasScale(rect.width / CANVAS_WIDTH);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(view);
        return () => observer.disconnect();
    }, []);

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

    /** Remove every item under (x, y). Used by the stroke eraser on click or drag. */
    const eraseAtPoint = (x: number, y: number) => {
        const items = itemsRef.current;
        if (items.length === 0) return;
        const measureCtx = getMeasureCtx();
        const survivors = items.filter((item) => !hitTestItem(item, x, y, measureCtx));
        if (survivors.length !== items.length) {
            itemsRef.current = survivors;
            eraseChangedRef.current = true;
            rebuildInk();
            redrawView();
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { x, y } = pointerPos(e);

        if (tool === "text") {
            setTextEditor({ x, y, value: "" });
            return;
        }

        const canvas = viewCanvasRef.current;
        canvas?.setPointerCapture(e.pointerId);
        isDrawingRef.current = true;

        if (tool === "stroke-eraser") {
            eraseChangedRef.current = false;
            eraseAtPoint(x, y);
            return;
        }

        if (isShapeTool(tool)) {
            shapeStartRef.current = { x, y };
            const preview: ShapeStroke = {
                kind: "shape",
                id: "preview",
                shape: tool,
                color,
                size,
                style: borderStyle,
                x1: x,
                y1: y,
                x2: x,
                y2: y,
            };
            activeShapePreviewRef.current = preview;
            redrawView(preview);
            return;
        }

        // Draw the initial dot immediately.
        const stroke: FreehandStroke = {
            kind: "freehand",
            id: "temp",
            color,
            size: tool === "eraser" ? size * 2.4 : size,
            mode: tool,
            points: [[x, y]],
        };
        activeStrokeRef.current = stroke;

        const ink = getInkCanvas();
        const ctx = ink.getContext("2d");
        if (ctx) drawItem(ctx, stroke);
        redrawView();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();
        const { x, y } = pointerPos(e);

        if (tool === "stroke-eraser") {
            eraseAtPoint(x, y);
            return;
        }

        if (isShapeTool(tool)) {
            const start = shapeStartRef.current;
            if (!start) return;
            const end = constrainShapeEnd(tool, start, { x, y }, e.shiftKey);
            const preview: ShapeStroke = {
                kind: "shape",
                id: "preview",
                shape: tool,
                color,
                size,
                style: borderStyle,
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y,
            };
            activeShapePreviewRef.current = preview;
            redrawView(preview);
            return;
        }

        const stroke = activeStrokeRef.current;
        if (!stroke) return;
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

        if (tool === "stroke-eraser") {
            if (eraseChangedRef.current) {
                eraseChangedRef.current = false;
                serialize(background);
            }
            return;
        }

        if (isShapeTool(tool)) {
            const preview = activeShapePreviewRef.current;
            activeShapePreviewRef.current = null;
            shapeStartRef.current = null;
            if (preview && (preview.x1 !== preview.x2 || preview.y1 !== preview.y2)) {
                const finalItem: ShapeStroke = { ...preview, id: createId() };
                itemsRef.current = [...itemsRef.current, finalItem];
                const ink = getInkCanvas();
                const ctx = ink.getContext("2d");
                if (ctx) drawItem(ctx, finalItem);
                redrawView();
                serialize(background);
            } else {
                // Degenerate (zero-length) shape — just clear the preview.
                redrawView();
            }
            return;
        }

        const stroke = activeStrokeRef.current;
        activeStrokeRef.current = null;
        if (stroke && stroke.points.length > 0) {
            itemsRef.current = [...itemsRef.current, { ...stroke, id: createId() }];
            serialize(background);
        }
    };

    const commitTextEditor = () => {
        const editor = textEditor;
        if (!editor) return;
        const trimmed = editor.value.replace(/\s+$/, "");
        setTextEditor(null);
        if (trimmed.trim().length === 0) return;

        const item: TextStroke = {
            kind: "text",
            id: createId(),
            color,
            fontSize: textFontSize,
            x: editor.x,
            y: editor.y,
            text: trimmed,
        };
        itemsRef.current = [...itemsRef.current, item];

        const ink = getInkCanvas();
        const ctx = ink.getContext("2d");
        if (ctx) drawItem(ctx, item);
        redrawView();
        serialize(background);
    };

    const handleUndo = () => {
        if (itemsRef.current.length === 0) return;
        itemsRef.current = itemsRef.current.slice(0, -1);
        rebuildInk();
        redrawView();
        serialize(background);
    };

    const handleClear = () => {
        if (itemsRef.current.length === 0) return;
        itemsRef.current = [];
        activeShapePreviewRef.current = null;
        shapeStartRef.current = null;
        setTextEditor(null);
        rebuildInk();
        redrawView();
        serialize(background);
    };

    const changeBackground = (bg: CanvasBackground) => {
        setBackground(bg);
        // Re-serialize so the stored dataUrl reflects the new background.
        // redrawView happens via effect; serialize uses the ink layer + bg.
        requestAnimationFrame(() => serialize(bg));
    };

    const toggleFullscreen = async () => {
        const container = containerRef.current;
        if (!container) return;

        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await container.requestFullscreen();
            }
        } catch (error) {
            console.error("Fullscreen request failed:", error);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const toolButtonBase =
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors";

    const swatches = useMemo(() => PEN_COLORS, []);
    const usesColor = tool !== "eraser" && tool !== "stroke-eraser";
    const showStrokeWidth = tool !== "text" && tool !== "stroke-eraser";
    const showBorderStyle = isShapeTool(tool);

    const toolCursor =
        tool === "eraser"
            ? "cell"
            : tool === "stroke-eraser"
            ? "pointer"
            : tool === "text"
            ? "text"
            : "crosshair";

    // Undo shortcut (Ctrl+Z on Windows/Linux, Cmd+Z on Mac).
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
                event.preventDefault();
                handleUndo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [background]);

    return (
        <div
            ref={containerRef}
            className={`flex flex-1 flex-col gap-3 min-h-0 bg-background ${
                isFullscreen ? "h-screen w-screen p-4" : ""
            }`}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-muted bg-background/70 px-3 py-2">
                {/* Pen / Eraser / Stroke eraser */}
                <div className="flex items-center gap-1 rounded-lg bg-card/80 p-1 ring-1 ring-muted">
                    {DRAW_TOOL_DEFS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTool(key)}
                            className={`${toolButtonBase} ${
                                tool === key
                                    ? "bg-primary/20 text-foreground"
                                    : "text-muted-foreground hover:bg-primary/20"
                            }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-muted" />

                {/* Shapes + text */}
                <div className="flex items-center gap-1 rounded-lg bg-card/80 p-1 ring-1 ring-muted">
                    {SHAPE_KINDS.map((key) => {
                        const Icon = SHAPE_ICON[key];
                        const active = tool === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTool(key)}
                                className={`${toolButtonBase} ${
                                    active
                                        ? "bg-primary/20 text-foreground"
                                        : "text-muted-foreground hover:bg-primary/20"
                                }`}
                            >
                                <Icon size={14} />
                                {SHAPE_LABEL[key]}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setTool("text")}
                        className={`${toolButtonBase} ${
                            tool === "text"
                                ? "bg-primary/20 text-foreground"
                                : "text-muted-foreground hover:bg-primary/20"
                        }`}
                    >
                        <Type size={14} />
                        Text
                    </button>
                </div>

                <div className="h-6 w-px bg-muted" />

                {/* Colors */}
                <div className="flex items-center gap-1.5">
                    {swatches.map((c) => {
                        const active = color === c.value && usesColor;
                        return (
                            <button
                                key={c.key}
                                type="button"
                                aria-label={c.label}
                                title={c.label}
                                onClick={() => {
                                    setColor(c.value);
                                    if (tool === "eraser" || tool === "stroke-eraser") {
                                        setTool("pen");
                                    }
                                }}
                                className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                                    active
                                        ? "ring-2 ring-offset-2 ring-offset-foreground/60"
                                        : "ring-1 ring-foreground/40"
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

                {/* Stroke width — applies to pen, pixel eraser, and shape borders */}
                {showStrokeWidth && (
                    <>
                        <div className="h-6 w-px bg-muted" />
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
                                                ? "bg-primary/20 ring-1 ring-brand"
                                                : "hover:bg-primary/20"
                                        }`}
                                    >
                                        <span
                                            className="rounded-full border border-foreground/50"
                                            style={{
                                                width: s.dot,
                                                height: s.dot,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Font size — text tool only */}
                {tool === "text" && (
                    <>
                        <div className="h-6 w-px bg-muted" />
                        <div className="flex items-center gap-1">
                            {TEXT_SIZES.map((s) => {
                                const active = textFontSize === s.value;
                                return (
                                    <button
                                        key={s.key}
                                        type="button"
                                        title={s.label}
                                        onClick={() => setTextFontSize(s.value)}
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg font-semibold transition-colors ${
                                            active
                                                ? "bg-primary/20 ring-1 ring-brand text-foreground"
                                                : "text-muted-foreground hover:bg-primary/20"
                                        }`}
                                        style={{ fontSize: s.previewPx }}
                                    >
                                        A
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Border style — shape tools only */}
                {showBorderStyle && (
                    <>
                        <div className="h-6 w-px bg-muted" />
                        <div className="flex items-center gap-1">
                            {BORDER_STYLES.map((b) => {
                                const active = borderStyle === b.key;
                                return (
                                    <button
                                        key={b.key}
                                        type="button"
                                        title={b.label}
                                        onClick={() => setBorderStyle(b.key)}
                                        className={`flex h-7 w-10 items-center justify-center rounded-lg transition-colors ${
                                            active
                                                ? "bg-primary/20 ring-1 ring-brand"
                                                : "hover:bg-primary/20"
                                        }`}
                                    >
                                        <span
                                            className={`block w-6 border-t-2 border-foreground/70 ${
                                                b.key === "dashed" ? "border-dashed" : "border-solid"
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="h-6 w-px bg-muted" />

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
                                        ? "bg-primary/20 text-white"
                                        : "text-muted-foreground hover:bg-primary/20"
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
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-primary/20"
                    >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </button>
                    <button
                        type="button"
                        onClick={handleUndo}
                        title="Undo last stroke"
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-primary/20"
                    >
                        <Undo2 size={14} />
                        Undo
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        title="Clear canvas"
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                        <Trash2 size={14} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Drawing surface */}
            <div className={cn("relative flex-1 min-h-0 overflow-auto rounded-xl border border-muted bg-[#f3f4f6] p-4", isFullscreen ? "zoom-[1.6]": "zoom-[0.8]")}>
                <div
                    className="relative mx-auto w-full max-w-[900px]"
                    style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
                >
                    <canvas
                        ref={viewCanvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={finishStroke}
                        onPointerLeave={finishStroke}
                        onPointerCancel={finishStroke}
                        className="absolute inset-0 h-full w-full rounded-lg bg-white shadow-sm ring-1 ring-black/5"
                        style={{
                            touchAction: "none",
                            cursor: toolCursor,
                        }}
                    />

                    {textEditor && (
                        <textarea
                            autoFocus
                            value={textEditor.value}
                            onChange={(e) =>
                                setTextEditor((prev) =>
                                    prev ? { ...prev, value: e.target.value } : prev,
                                )
                            }
                            onBlur={commitTextEditor}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    setTextEditor(null);
                                } else if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    commitTextEditor();
                                }
                            }}
                            rows={Math.max(1, textEditor.value.split("\n").length)}
                            wrap="off"
                            className="absolute min-w-[80px] resize-none overflow-x-auto whitespace-pre border border-dashed border-brand/60 bg-white/80 px-1 leading-tight outline-none"
                            style={{
                                left: `${(textEditor.x / CANVAS_WIDTH) * 100}%`,
                                top: `${(textEditor.y / CANVAS_HEIGHT) * 100}%`,
                                color,
                                fontFamily: FONT_FAMILY,
                                fontSize: `${textFontSize * canvasScale}px`,
                            }}
                        />
                    )}

                    {/* {isEmpty && !textEditor && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <RotateCcw size={22} className="opacity-40" />
                                <p className="text-[13px]">
                                    Draw or handwrite anything — sketches, equations, diagrams.
                                </p>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default CanvasSection;