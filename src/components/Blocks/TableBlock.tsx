import { EditIcon, Trash2Icon } from "lucide-react";
import BlockActionButton from "../ui/BlockActionButton";
import { colorOptions } from "@/utils/ColorsInfo";
import { TableState } from "../EditorModal/TableSection";

type TableBlockProps = {
    title?: string;
    designId: number;
    colorOptionId: number;
    content: string;

    className?: string;
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
            className="overflow-x-auto rounded-xl border"
            style={{ borderColor }}
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
                                background: headerBg,
                                borderColor,
                            }}
                        />
                        {cols.map((colId, ci) => (
                            <th
                                key={colId}
                                className="border-b border-l text-left"
                                style={{
                                    background: headerBg,
                                    borderColor,
                                }}
                            >
                                <div className="h-10 flex items-center px-3">
                                    <span
                                        className="text-sm font-bold truncate"
                                        style={{ color: headerText }}
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
                        <tr key={rowId}>
                            {/* Row number */}
                            <td
                                className="border-t text-center font-bold text-xs"
                                style={{
                                    background: headerBg,
                                    borderColor,
                                    color: headerText,
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
                                        borderColor,
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
                    borderColor,
                    background: headerBg,
                    color: headerText,
                    opacity: 0.7,
                }}
            >
                {rows.length} rows × {cols.length} cols
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isTableContent(content: string): boolean {
    try {
        const parsed = JSON.parse(content);
        return (
            parsed &&
            Array.isArray(parsed.cols) &&
            Array.isArray(parsed.rows) &&
            typeof parsed.headers === "object" &&
            typeof parsed.data === "object"
        );
    } catch {
        return false;
    }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TableBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    onEdit,
    onDelete,
}: TableBlockProps) {
    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];

    const isDesignDisabled = designId === 0;
    const isTable = isTableContent(content);

    return (
        <figure
            className={`
                group relative  rounded-xl
                 transition-all duration-300
                 py-3
                hover:shadow-lg
                ${className}
            `}
        >
            <div
                className={`hidden border group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
            >
                <BlockActionButton
                    icon={
                        <EditIcon
                            className={`${iconClassName} hover:text-blue-500`}
                        />
                    }
                    onClick={() => onEdit()}
                >
                    Edit
                </BlockActionButton>
                <BlockActionButton
                    icon={
                        <Trash2Icon
                            className={`${iconClassName} hover:text-red-500`}
                        />
                    }
                    onClick={() => onDelete()}
                >
                    Delete
                </BlockActionButton>
            </div>

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
            {isTable ? (
                <div className={isDesignDisabled ? "pt-2" : ""}>
                    <ReadOnlyTable
                        state={JSON.parse(content) as TableState}
                        borderColor={colorOption.borderColorHex}
                        headerBg={colorOption.primaryColorHex + "33"} // 20% opacity tint
                        headerText="#000000"
                        cellFocusBg="transparent"
                    />
                </div>
            ) : (
                <div>Corrupted Table</div>
            )}
        </figure>
    );
}
