import type { BlockType } from "@/types/dataSotoreTypes";

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character];
    });

const imageAsPng = async (image: Blob): Promise<Blob> => {
    if (image.type === "image/png") return image;

    const bitmap = await createImageBitmap(image);
    try {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not prepare the copied image.");
        context.drawImage(bitmap, 0, 0);
        return await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Could not encode the copied image."));
            }, "image/png");
        });
    } finally {
        bitmap.close();
    }
};

const getInlineTableHtml = (table: HTMLTableElement): string => {
    const copy = table.cloneNode(true) as HTMLTableElement;
    const originalElements = [table, ...table.querySelectorAll("*")];
    const copiedElements = [copy, ...copy.querySelectorAll("*")];

    originalElements.forEach((element, index) => {
        const computed = window.getComputedStyle(element);
        const copiedElement = copiedElements[index] as HTMLElement;
        copiedElement.style.backgroundColor = computed.backgroundColor;
        copiedElement.style.borderColor = computed.borderColor;
        copiedElement.style.borderStyle = computed.borderStyle;
        copiedElement.style.borderWidth = computed.borderWidth;
        copiedElement.style.color = computed.color;
        copiedElement.style.fontFamily = computed.fontFamily;
        copiedElement.style.fontSize = computed.fontSize;
        copiedElement.style.fontWeight = computed.fontWeight;
        copiedElement.style.padding = computed.padding;
        copiedElement.style.textAlign = computed.textAlign;
    });

    copy.setAttribute("border", "1");
    copy.setAttribute("cellpadding", "6");
    copy.setAttribute("cellspacing", "0");
    return copy.outerHTML;
};

const writeClipboard = async (
    formats: Record<string, Blob>,
): Promise<void> => {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("Rich clipboard copying is not supported in this browser.");
    }
    await navigator.clipboard.write([new ClipboardItem(formats)]);
};

export async function copyBlockToClipboard(
    block: BlockType,
    element: HTMLElement | null,
    canvasImage?: Promise<Blob | null>,
): Promise<void> {
    // Clipboard output is derived from the rendered block; copiedContent in the
    // store separately retains the editable data needed for in-app pasting.
    switch (block.type) {
        case "divider":
            return;
        case "image": {
            const response = await fetch(block.content);
            if (!response.ok) {
                throw new Error("Could not load the image for copying.");
            }
            const image = await imageAsPng(await response.blob());
            const html = `<img src="${escapeHtml(block.content)}" alt="${escapeHtml(block.title ?? "")}">`;
            await writeClipboard({
                "image/png": image,
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([block.content], {
                    type: "text/plain",
                }),
            });
            return;
        }
        case "canvas": {
            if (!canvasImage) {
                throw new Error("Could not export the canvas for copying.");
            }
            const imageBlob = await canvasImage;
            if (!imageBlob) {
                throw new Error("The canvas has no image to copy.");
            }
            await writeClipboard({
                "image/png": await imageAsPng(imageBlob),
            });
            return;
        }
        case "table": {
            const table = element?.querySelector("table");
            if (!(table instanceof HTMLTableElement)) {
                throw new Error("Could not find the rendered table to copy.");
            }
            const text = Array.from(table.rows)
                .map((row) =>
                    Array.from(row.cells)
                        .slice(1)
                        .map((cell) => cell.innerText.trim())
                        .join("\t"),
                )
                .join("\n");
            await writeClipboard({
                "text/html": new Blob([getInlineTableHtml(table)], {
                    type: "text/html",
                }),
                "text/plain": new Blob([text], { type: "text/plain" }),
            });
            return;
        }
        case "block":
        case "heading": {
            const content = element?.querySelector(".tiptap");
            if (!(content instanceof HTMLElement)) {
                throw new Error("Could not find the rendered text to copy.");
            }
            await writeClipboard({
                "text/html": new Blob([content.innerHTML], {
                    type: "text/html",
                }),
                "text/plain": new Blob([content.innerText], {
                    type: "text/plain",
                }),
            });
            return;
        }
        case "code": {
            const html = `<pre><code>${escapeHtml(block.content)}</code></pre>`;
            await writeClipboard({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([block.content], {
                    type: "text/plain",
                }),
            });
            return;
        }
        case "formula":
            await writeClipboard({
                "text/plain": new Blob([block.content], {
                    type: "text/plain",
                }),
            });
            return;
    }
}
