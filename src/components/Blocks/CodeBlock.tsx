import { EditIcon, Trash2Icon, CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import BlockActionButton from "../ui/BlockActionButton";
import { allBlockDesigns } from "@/utils/DesignInfo";
import { colorOptions } from "@/utils/ColorsInfo";

type CodeBlockProps = {
    /** The programming language label, e.g. "javascript", "typescript", "python" */
    title?: string;
    designId: number;
    colorOptionId: number;
    /** The raw code string to display with syntax highlighting */
    content: string;

    className?: string;
    onEdit: () => void;
    onDelete: () => void;
};

/** Maps common language display names → Prism language identifiers */
const LANGUAGE_MAP: Record<string, string> = {
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
    python: "python",
    py: "python",
    java: "java",
    c: "c",
    "c++": "cpp",
    cpp: "cpp",
    "c#": "csharp",
    csharp: "csharp",
    go: "go",
    rust: "rust",
    ruby: "ruby",
    rb: "ruby",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    html: "html",
    css: "css",
    scss: "scss",
    sql: "sql",
    bash: "bash",
    sh: "bash",
    shell: "bash",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    markdown: "markdown",
    md: "markdown",
    jsx: "jsx",
    tsx: "tsx",
};

function normalizeLang(raw?: string): string {
    if (!raw) return "text";
    return LANGUAGE_MAP[raw.trim().toLowerCase()] ?? raw.trim().toLowerCase();
}


export default function CodeBlock({
    content,
    designId,
    colorOptionId,
    title,
    className = "",
    onEdit,
    onDelete,
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const iconClassName = "max-w-5 group-hover/button:scale-110 transition-all";
    const colorOption =
        colorOptions.find((co) => co.id === colorOptionId) || colorOptions[0];

    const isDesignDisabled = designId === 0;
    const lang = normalizeLang(title);
    const highlighterTheme = oneDark;

    function handleCopy() {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div
            className={`
                group relative  rounded-xl ${isDesignDisabled ? "px-3" : "border-2 px-5 my-3"}
                 ${!!title?.trim() && !isDesignDisabled ? "pt-5" : "pt-3"} pb-3 transition-all duration-300
                hover:shadow-lg
                ${className}
            `}
            style={
                !isDesignDisabled
                    ? {
                          backgroundColor: colorOption.backgroundColorHex,
                          borderColor: colorOption.borderColorHex,
                      }
                    : {}
            }
        >
            {/* Action buttons (Edit / Delete) */}
            <div
                className={`hidden border group-hover:flex absolute right-2 top-2 z-10 items-center w-fit rounded-md overflow-hidden`}
            >
                <BlockActionButton
                    icon={
                        copied ? (
                            <CheckIcon
                                className={`${iconClassName} hover:text-blue-500`}
                            />
                        ) : (
                            <CopyIcon
                                className={`${iconClassName} hover:text-blue-500`}
                            />
                        )
                    }
                    onClick={handleCopy}
                >
                    {copied ? "Copied" : "Copy"}
                </BlockActionButton>
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

            {/* Language label / Ribbon */}
            {title &&
                title.trim() !== "" &&
                !isDesignDisabled &&
                allBlockDesigns
                    .find((b) => b.id === designId)
                    ?.applyDesign(
                        title,
                        colorOption.primaryColorHex,
                        colorOption.secondaryColorHex,
                        colorOption.titleColorHex,
                    )}

            {/* Code area */}
            <div className={`relative ${!isDesignDisabled ? "pt-2" : ""}`}>
                {/* Copy button — visible on hover of the whole block */}
                {/* <button
                    onClick={handleCopy}
                    aria-label="Copy code"
                    className="
                        hidden group-hover:flex
                        absolute right-2 top-2 z-10
                        items-center gap-1.5
                        rounded-md px-2 py-1
                        text-xs font-medium
                        bg-white/80 dark:bg-black/50
                        border border-gray-200 dark:border-gray-700
                        text-gray-600 dark:text-gray-300
                        hover:bg-white dark:hover:bg-black/70
                        transition-all shadow-sm
                    "
                >
                    {copied ? (
                        <>
                            <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                            Copied
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-3.5 h-3.5" />
                            Copy
                        </>
                    )}
                </button> */}

                <SyntaxHighlighter
                    language={lang}
                    style={highlighterTheme}
                    showLineNumbers
                    wrapLongLines
                    customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.85rem",
                        lineHeight: "1.6",
                        // Keep the highlighter's own background so it always
                        // looks correct regardless of the block's color scheme.
                    }}
                    lineNumberStyle={{
                        minWidth: "2.5em",
                        paddingRight: "1em",
                        opacity: 0.4,
                        userSelect: "none",
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily:
                                "'Fira Code', 'Cascadia Code', monospace",
                        },
                    }}
                >
                    {content}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
