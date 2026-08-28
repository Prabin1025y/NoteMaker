import { useState, useRef, useCallback, KeyboardEvent, useEffect } from "react";
import { Plus, X, Trash2, Check } from "lucide-react";
import { EditorData } from "@/types/Editor";

// ─── Types ────────────────────────────────────────────────────────────────────

type CellKey = `${string}_${string}`; // `${rowId}_${colId}`

export interface TableState {
    cols: string[];
    rows: string[];
    headers: Record<string, string>; // colId → header text
    data: Record<CellKey, string>; // `rowId_colId` → cell text
}

type FocusTarget =
    | { kind: "header"; colId: string }
    | { kind: "cell"; rowId: string; colId: string }
    | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => `c${++_id}`;
const cellKey = (rowId: string, colId: string): CellKey =>
    `${rowId}_${colId}` as CellKey;

export function makeInitialState(): TableState {
    const cols = [uid(), uid(), uid()];
    const rows = [uid(), uid(), uid()];
    const headers: Record<string, string> = {
        [cols[0]]: "",
        [cols[1]]: "",
        [cols[2]]: "",
    };
    const sampleData = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];
    const data: Record<CellKey, string> = {};
    rows.forEach((r, ri) =>
        cols.forEach((c, ci) => {
            data[cellKey(r, c)] = sampleData[ri]?.[ci] ?? "";
        }),
    );
    return { cols, rows, headers, data };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToolbarButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
}

function ToolbarButton({ onClick, icon, label, danger }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
        border bg-card/80 transition-colors duration-150 active:scale-95 select-none
        outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]
        ${
            danger
                ? "border-muted text-destructive bg-background/80 hover:bg-background/60"
                : "border-muted text-body hover:bg-background/60"
        }
      `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

interface EditableTableProps {
    onChangeHandler: (content: string) => void;
    editorData: EditorData;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditableTable({
    onChangeHandler,
    editorData,
}: EditableTableProps) {
    const [state, setState] = useState<TableState>(
        editorData.action === "add" || editorData.type !== "table"
            ? makeInitialState
            : JSON.parse(editorData.content),
    );
    // const [pendingFocus, setPendingFocus] = useState<FocusTarget>(null);
    const [confirmClear, setConfirmClear] = useState(false);
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
    const lastFocused = useRef<FocusTarget>(null);

    // ── Focus management ────────────────────────────────────────────────────────

    const registerRef = useCallback(
        (key: string) => (el: HTMLInputElement | null) => {
            if (el) inputRefs.current.set(key, el);
            else inputRefs.current.delete(key);
        },
        [],
    );

    const focusCell = useCallback((target: FocusTarget) => {
        if (!target) return;
        const key =
            target.kind === "header"
                ? `h_${target.colId}`
                : `${target.rowId}_${target.colId}`;
        const el = inputRefs.current.get(key);
        if (el) {
            el.focus();
            el.select();
        }
    }, []);

    // After state updates that move focus, we fire via useEffect-free approach:
    // we store pendingFocus and call focusCell inside a rAF.
    const applyFocus = useCallback(
        (target: FocusTarget) => {
            // setPendingFocus(target);
            requestAnimationFrame(() => focusCell(target));
        },
        [focusCell],
    );

    // ── Keyboard navigation ─────────────────────────────────────────────────────

    function handleKeyDown(
        e: KeyboardEvent<HTMLInputElement>,
        rowIdx: number, // -1 for header
        colIdx: number,
    ) {
        const { cols, rows } = state;
        const maxC = cols.length - 1;
        const maxR = rows.length - 1;

        const move = (dr: number, dc: number) => {
            e.preventDefault();
            let nr = rowIdx + dr;
            let nc = colIdx + dc;

            // Tab wraps across columns
            if (nc < 0) {
                nc = maxC;
                nr--;
            }
            if (nc > maxC) {
                nc = 0;
                nr++;
            }
            nr = Math.max(-1, Math.min(maxR, nr));
            nc = Math.max(0, Math.min(maxC, nc));

            const target: FocusTarget =
                nr === -1
                    ? { kind: "header", colId: cols[nc] }
                    : { kind: "cell", rowId: rows[nr], colId: cols[nc] };
            applyFocus(target);
        };

        if (e.key === "Tab") move(0, e.shiftKey ? -1 : 1);
        else if (e.key === "Enter") move(1, 0);
        else if (e.key === "ArrowDown") move(1, 0);
        else if (e.key === "ArrowUp") move(-1, 0);
    }

    // ── State mutators ──────────────────────────────────────────────────────────

    const setHeader = (colId: string, value: string) =>
        setState((s) => ({ ...s, headers: { ...s.headers, [colId]: value } }));

    const setCell = (rowId: string, colId: string, value: string) =>
        setState((s) => ({
            ...s,
            data: { ...s.data, [cellKey(rowId, colId)]: value },
        }));

    function addColumnWithId(direction: "left" | "right") {
        const newId = uid();
        setState((s) => {
            const refColId =
                lastFocused.current?.kind === "header"
                    ? lastFocused.current.colId
                    : lastFocused.current?.kind === "cell"
                    ? lastFocused.current.colId
                    : s.cols[s.cols.length - 1];
            const refIdx = s.cols.indexOf(refColId);
            const insertAt =
                direction === "left"
                    ? Math.max(0, refIdx)
                    : Math.min(s.cols.length, refIdx + 1);
            const cols = [...s.cols];
            cols.splice(insertAt, 0, newId);
            const newData = { ...s.data };
            s.rows.forEach((r) => {
                newData[cellKey(r, newId)] = "";
            });
            return {
                ...s,
                cols,
                headers: { ...s.headers, [newId]: "" },
                data: newData,
            };
        });
        requestAnimationFrame(() =>
            applyFocus({ kind: "header", colId: newId }),
        );
    }

    function deleteColumn(colId: string) {
        setState((s) => {
            if (s.cols.length <= 1) return s;
            const idx = s.cols.indexOf(colId);
            const cols = s.cols.filter((c) => c !== colId);
            const headers = { ...s.headers };
            delete headers[colId];
            const newData = { ...s.data };
            s.rows.forEach((r) => delete newData[cellKey(r, colId)]);
            const newIdx = Math.min(idx, cols.length - 1);
            requestAnimationFrame(() =>
                applyFocus({ kind: "header", colId: cols[newIdx] }),
            );
            return { ...s, cols, headers, data: newData };
        });
    }

    function addRow(direction: "above" | "below" | "end") {
        const newId = uid();
        setState((s) => {
            const refRowId =
                lastFocused.current?.kind === "cell"
                    ? lastFocused.current.rowId
                    : s.rows[s.rows.length - 1];
            const refIdx = s.rows.indexOf(refRowId);
            const insertAt =
                direction === "end"
                    ? s.rows.length
                    : direction === "above"
                      ? Math.max(0, refIdx)
                      : Math.min(s.rows.length, refIdx + 1);
            const rows = [...s.rows];
            rows.splice(insertAt, 0, newId);
            const newData = { ...s.data };
            s.cols.forEach((c) => {
                newData[cellKey(newId, c)] = "";
            });
            return { ...s, rows, data: newData };
        });
        requestAnimationFrame(() =>
            applyFocus({ kind: "cell", rowId: newId, colId: state.cols[0] }),
        );
    }

    function deleteRow(rowId: string) {
        setState((s) => {
            if (s.rows.length <= 1) return s;
            const idx = s.rows.indexOf(rowId);
            const rows = s.rows.filter((r) => r !== rowId);
            const newData = { ...s.data };
            s.cols.forEach((c) => delete newData[cellKey(rowId, c)]);
            const newIdx = Math.min(idx, rows.length - 1);
            requestAnimationFrame(() =>
                applyFocus({
                    kind: "cell",
                    rowId: rows[newIdx],
                    colId: s.cols[0],
                }),
            );
            return { ...s, rows, data: newData };
        });
    }

    function clearAll() {
        setState((s) => {
            const newData = { ...s.data };
            s.rows.forEach((r) =>
                s.cols.forEach((c) => {
                    newData[cellKey(r, c)] = "";
                }),
            );
            return { ...s, data: newData };
        });
        setConfirmClear(false);
    }

    // ── Render ──────────────────────────────────────────────────────────────────

    const { cols, rows, headers, data } = state;

    useEffect(() => {
        onChangeHandler(JSON.stringify(state));
    }, [state, onChangeHandler]);

    return (
        <div className="p-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-background/60 rounded-lg border border-muted">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide mr-1">
                        Col
                    </span>
                    <ToolbarButton
                        onClick={() => addColumnWithId("left")}
                        icon={<Plus size={14} />}
                        label="Add left"
                    />
                    <ToolbarButton
                        onClick={() => addColumnWithId("right")}
                        icon={<Plus size={14} />}
                        label="Add right"
                    />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-background/60 rounded-lg border border-muted">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide mr-1">
                        Row
                    </span>
                    <ToolbarButton
                        onClick={() => addRow("above")}
                        icon={<Plus size={14} />}
                        label="Add above"
                    />
                    <ToolbarButton
                        onClick={() => addRow("below")}
                        icon={<Plus size={14} />}
                        label="Add below"
                    />
                </div>

                {confirmClear ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-background/60 rounded-lg border border-muted">
                        <span className="text-xs text-destructive">
                            Clear all cells?
                        </span>
                        <button
                            onClick={clearAll}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive text-white outline-none transition-[filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            <Check size={12} /> Yes
                        </button>
                        <button
                            onClick={() => setConfirmClear(false)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-muted text-body outline-none transition-colors duration-150 hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                        >
                            <X size={12} /> No
                        </button>
                    </div>
                ) : (
                    <ToolbarButton
                        onClick={() => setConfirmClear(true)}
                        icon={<Trash2 size={14} />}
                        label="Clear cells"
                        danger
                    />
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-muted bg-card/80">
                <table
                    className="border-collapse w-full"
                    style={{
                        tableLayout: "fixed",
                        minWidth: cols.length * 140,
                    }}
                >
                    {/* Column widths */}
                    <colgroup>
                        <col style={{ width: 40 }} />
                        {cols.map((c) => (
                            <col
                                key={c}
                                style={{ width: 160 }}
                            />
                        ))}
                    </colgroup>

                    {/* Header row */}
                    <thead>
                        <tr>
                            {/* Corner */}
                            <th className="bg-background/60 border-b border-muted" />

                            {cols.map((colId, ci) => (
                                <th
                                    key={colId}
                                    className="bg-background/60 border-b border-l border-muted p-0 group/th"
                                >
                                    <div className="flex items-center h-10">
                                        <input
                                            ref={registerRef(`h_${colId}`)}
                                            type="text"
                                            value={headers[colId] ?? ""}
                                            placeholder={`Column ${ci + 1}`}
                                            aria-label={`Column ${ci + 1} header`}
                                            onChange={(e) =>
                                                setHeader(colId, e.target.value)
                                            }
                                            onFocus={() => {
                                                lastFocused.current = {
                                                    kind: "header",
                                                    colId,
                                                };
                                            }}
                                            onKeyDown={(e) =>
                                                handleKeyDown(e, -1, ci)
                                            }
                                            className="
                        flex-1 h-full px-3 bg-transparent border-none outline-none
                        text-sm font-medium text-ink
                        placeholder:text-muted-foreground
                        min-w-0
                      "
                                        />
                                        {cols.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    deleteColumn(colId)
                                                }
                                                aria-label={`Delete column ${ci + 1}`}
                                                className="
                          opacity-0 group-hover/th:opacity-100
                          flex items-center justify-center w-6 h-6 mr-1.5 rounded-md shrink-0
                          text-muted-foreground hover:text-destructive hover:bg-background/60
                          transition-colors duration-150
                        "
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {rows.map((rowId, ri) => (
                            <tr
                                key={rowId}
                                className="group/row"
                            >
                                {/* Row number + delete */}
                                <td className="bg-background/60 border-t border-muted relative p-0 text-center">
                                    <span className="group-hover/row:opacity-0 text-xs text-muted-foreground transition-opacity">
                                        {ri + 1}
                                    </span>
                                    {rows.length > 1 && (
                                        <button
                                            onClick={() => deleteRow(rowId)}
                                            aria-label={`Delete row ${ri + 1}`}
                                            className="
                        absolute inset-0 opacity-0 group-hover/row:opacity-100
                        flex items-center justify-center
                        text-muted-foreground hover:text-destructive hover:bg-background/60
                        transition-colors duration-150 rounded-none
                      "
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </td>

                                {cols.map((colId, ci) => (
                                    <td
                                        key={colId}
                                        className="border-t border-l bg-background/40 border-muted p-0 focus-within:ring-1 focus-within:ring-[color:var(--ds-focus-ring)] focus-within:ring-inset focus-within:z-10 relative"
                                    >
                                        <input
                                            ref={registerRef(
                                                cellKey(rowId, colId),
                                            )}
                                            type="text"
                                            value={
                                                data[cellKey(rowId, colId)] ??
                                                ""
                                            }
                                            aria-label={`Row ${ri + 1}, ${headers[colId] || `column ${ci + 1}`}`}
                                            onChange={(e) =>
                                                setCell(
                                                    rowId,
                                                    colId,
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() => {
                                                lastFocused.current = {
                                                    kind: "cell",
                                                    rowId,
                                                    colId,
                                                };
                                            }}
                                            onKeyDown={(e) =>
                                                handleKeyDown(e, ri, ci)
                                            }
                                            className="
                        w-full h-10 px-3 bg-transparent border-none outline-none
                        text-sm text-ink
                        focus:bg-tint
                        transition-colors duration-150
                      "
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Add row button */}
                        <tr>
                            <td
                                colSpan={cols.length + 1}
                                className="border-t border-muted p-0"
                            >
                                <button
                                    onClick={() => addRow("end")}
                                    aria-label="Add row at end"
                                    className="
                    w-full flex items-center justify-center gap-2 py-2.5
                    text-sm text-muted-foreground hover:text-body
                    hover:bg-background/60
                    transition-colors duration-150
                    rounded-b-xl
                  "
                                >
                                    <Plus size={14} />
                                    Add row
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-background/60 border border-muted text-body rounded-full px-3 py-0.5">
                    {rows.length} rows × {cols.length} cols
                </span>
                <span className="hidden sm:inline">
                    Tab / Enter to navigate · hover row or column to delete
                </span>
            </div>
        </div>
    );
}
