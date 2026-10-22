"use client";
import GeneralBlock from "@/components/Blocks/GeneralBlock";
import HeaderBlock from "@/components/Blocks/HeaderBlock";
import ImageBlock from "@/components/Blocks/ImageBlock";
import CodeBlock from "@/components/Blocks/CodeBlock";
import DividerBlock from "@/components/Blocks/DividerBlock";
import FormulaBlock from "@/components/Blocks/FormulaBlock";
import TableBlock from "@/components/Blocks/TableBlock";
import CanvasBlock from "@/components/Blocks/CanvasBlock";
import {
    CanvasEditorContentSchema,
    JSONContentSchema,
    TableStateSchema,
} from "@/validation/editorData";
import { ALL_DIVIDERS } from "@/utils/Dividers";
import type { blockTypeOptions } from "@/types/Editor";

const parseJsonContent = (content: string): unknown => {
    try {
        return JSON.parse(content);
    } catch {
        return null;
    }
};

interface BlockType {
    id: string;
    publicId: string;
    noteId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: blockTypeOptions;
    content: string;
    designId: number;
    colorOptionId: number;
    title: string | null;
    order: number;
}

const MainContent = ({ blocks }: { blocks: BlockType[] }) => {
    return (
        <main
            id="pdf-root"
            data-pdf-root
            className="pdf-export w-full bg-white"
            style={{ fontFamily: "var(--font-sans)", display: "block" }}
        >
            <div className="mx-auto max-w-5xl px-10 py-10">
                <div className="flex flex-col gap-3">
                    {blocks &&
                        blocks.length > 0 &&
                        blocks.map((block) => {
                            const commonProps = {
                                title: block.title || "",
                                designId: block.designId,
                                colorOptionId: block.colorOptionId,
                                className: "",
                                readOnly: true,
                                onEdit: () => {},
                                onDelete: () => {},
                                onCopy: () =>
                                    navigator.clipboard.writeText(
                                        block.content,
                                    ),
                            };

                            switch (block.type) {
                                case "block":
                                case "heading": {
                                    const result = JSONContentSchema.safeParse(
                                        parseJsonContent(block.content),
                                    );
                                    if (!result.success) return null;

                                    return block.type === "block" ? (
                                        <GeneralBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={result.data}
                                        />
                                    ) : (
                                        <HeaderBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={result.data}
                                        />
                                    );
                                }
                                case "image":
                                    return (
                                        <ImageBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={block.content}
                                        />
                                    );
                                case "code":
                                    return (
                                        <CodeBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={block.content}
                                        />
                                    );
                                case "divider":
                                    if (
                                        !ALL_DIVIDERS.some(
                                            (divider) =>
                                                divider.name === block.content,
                                        )
                                    ) {
                                        return null;
                                    }
                                    return (
                                        <DividerBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={block.content}
                                        />
                                    );
                                case "formula":
                                    return (
                                        <FormulaBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={block.content}
                                        />
                                    );
                                case "table": {
                                    const result = TableStateSchema.safeParse(
                                        parseJsonContent(block.content),
                                    );
                                    if (!result.success) return null;
                                    return (
                                        <TableBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={result.data}
                                        />
                                    );
                                }
                                case "canvas": {
                                    const result =
                                        CanvasEditorContentSchema.safeParse(
                                            parseJsonContent(block.content),
                                        );
                                    if (!result.success) return null;
                                    return (
                                        <CanvasBlock
                                            key={block.id}
                                            {...commonProps}
                                            content={result.data}
                                        />
                                    );
                                }
                            }
                        })}
                </div>
            </div>
        </main>
    );
};

export default MainContent;
