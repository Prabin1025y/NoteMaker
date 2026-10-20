import type { CSSProperties } from "react";
import { EditIcon, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";
import { colorOptions } from "@/utils/ColorsInfo";
import { TableState } from "../EditorModal/TableSection";

type TableBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: TableState;

    className?: string;
    readOnly?: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

// ─── Read-only table ──────────────────────────────────────────────────────────

interface ReadOnlyTableProps {
    state: TableState;
    borderColor: string;
    headerBg: string;
    headerText: string;
    cellFocusBg: string;
}

type CellKey = `${string}_${string}`;
const cellKey = (rowId: string, colId: string): CellKey =>
    `${rowId}_${colId}` as CellKey;

function ReadOnlyTable({
    state,
    borderColor,
    headerBg,
    headerText,
    cellFocusBg,
}: ReadOnlyTableProps) {
    const { cols, rows, headers, data } = state;

    return (
        <div
            className="overflow-x-auto rounded-xl border ds-table-surface"
            style={
                {
                    "--tbl-accent": borderColor,
                    "--tbl-border-src": borderColor,
                    "--tbl-header-bg-src": headerBg,
                    "--tbl-header-text-src": headerText,
                    borderColor: "var(--tbl-border)",
                } as CSSProperties
            }
        >
            <table
                className="border-collapse w-full"
                style={{
                    tableLayout: "fixed",
                    minWidth: cols.length * 140,
                    background: "transparent",
                }}
            >
                <colgroup>
                    <col style={{ width: 40 }} />
                    {cols.map((c) => (
                        <col
                            key={c}
                            style={{ width: 160 }}
                        />
                    ))}
                </colgroup>

                {/* Header */}
                <thead>
                    <tr>
                        {/* Corner */}
                        <th
                            className="border-b"
                            style={{
                                background: "var(--tbl-header-bg)",
                                borderColor: "var(--tbl-border)",
                            }}
                        />
                        {cols.map((colId, ci) => (
                            <th
                                key={colId}
                                className="border-b border-l text-left"
                                style={{
                                    background: "var(--tbl-header-bg)",
                                    borderColor: "var(--tbl-border)",
                                }}
                            >
                                <div className="h-10 flex items-center px-3">
                                    <span
                                        className="text-sm font-bold truncate"
                                        style={{
                                            color: "var(--tbl-header-text)",
                                        }}
                                    >
                                        {headers[colId]?.trim() ? (
                                            headers[colId]
                                        ) : (
                                            <span className="opacity-40">
                                                Column {ci + 1}
                                            </span>
                                        )}
                                    </span>
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
                            className="break-inside-avoid"
                        >
                            {/* Row number */}
                            <td
                                className="border-t text-center font-bold text-xs"
                                style={{
                                    background: "var(--tbl-header-bg)",
                                    borderColor: "var(--tbl-border)",
                                    color: "var(--tbl-header-text)",
                                    opacity: 0.7,
                                }}
                            >
                                {ri + 1}
                            </td>

                            {cols.map((colId) => (
                                <td
                                    key={colId}
                                    className="border-t border-l px-3 h-10 text-sm"
                                    style={{
                                        borderColor: "var(--tbl-border)",
                                        background: cellFocusBg,
                                        color: "inherit",
                                    }}
                                >
                                    {data[cellKey(rowId, colId)] ?? ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Status bar */}
            <div
                className="flex items-center gap-2 px-3 py-1.5 text-xs border-t"
                style={{
                    borderColor: "var(--tbl-border)",
                    background: "var(--tbl-header-bg)",
                    color: "var(--tbl-header-text)",
                    opacity: 0.7,
                }}
            >
                {rows.length} rows × {cols.length} cols
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TableBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    readOnly = false,
    onEdit,
    onDelete,
}: TableBlockProps) {
    const iconClassName =
        "max-w-5 group-hover/button:scale-110 transition-transform";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];

    const isDesignDisabled = designId === 0;
    return (
        <figure
            className={`
                group relative  rounded-xl
                 transition-[box-shadow,transform] duration-300
                 py-3
                hover:shadow-lg
                ${className}
            `}
        >
            {!readOnly && (
                <div
                    className={`hidden border group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
                >
                    <BlockActionButton
                        icon={
                            <EditIcon
                                className={`${iconClassName} hover:text-primary`}
                            />
                        }
                        onClick={() => onEdit()}
                    >
                        Edit
                    </BlockActionButton>
                    <BlockActionButton
                        icon={
                            <Trash2Icon
                                className={`${iconClassName} hover:text-[color:var(--ds-danger)]`}
                            />
                        }
                        onClick={() => onDelete()}
                    >
                        Delete
                    </BlockActionButton>
                </div>
            )}

            {/* Ribbon / Title */}
            {title && title.trim() !== "" && (
                <figcaption
                    className="
                        mx-auto
                        max-w-3xl
                        text-center
                        italic
                    "
                >
                    {title}
                </figcaption>
            )}

            {/* Content: table or rich text */}
            {
                <div className={isDesignDisabled ? "pt-2" : ""}>
                    <ReadOnlyTable
                        state={content}
                        borderColor={colorOption.borderColorHex}
                        headerBg={colorOption.primaryColorHex + "33"} // 20% opacity tint
                        headerText="#000000"
                        cellFocusBg="transparent"
                    />
                </div>
            }
        </figure>
    );
}
