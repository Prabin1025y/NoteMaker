import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";

export async function exportElementToPDF(element: HTMLElement) {
    // Clone the element so the UI doesn't change
    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.add("pdf-export");

    const wrapper = document.createElement("div");

    wrapper.style.position = "fixed";
    wrapper.style.inset = "0";
    wrapper.style.opacity = "0";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "-9999";

    wrapper.style.width = `${element.getBoundingClientRect().width}px`;

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // clone.style.position = "fixed";
    // clone.style.left = "0";
    // clone.style.top = "0";
    // clone.style.width = `${element.offsetWidth}px`;
    // clone.style.height = "auto";
    // clone.style.maxHeight = "none";
    // clone.style.overflow = "visible";
    // clone.style.background = "#ffffff";
    // clone.style.zIndex = "-9999";

    // document.body.appendChild(clone);

    const disabledLinks: HTMLLinkElement[] = [];

    document
        .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
        .forEach((link) => {
            if (link.href.includes("monaco-editor")) {
                link.disabled = true;
                disabledLinks.push(link);
            }
        });

    try {
        const canvas = await toCanvas(clone, {
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: "#ffffff",

            // // Ignore hidden elements
            // filter: (node) => {
            //     if (!(node instanceof HTMLElement)) return true;

            //     const style = getComputedStyle(node);

            //     return (
            //         style.display !== "none" &&
            //         style.visibility !== "hidden"
            //     );
            // },
        });

        console.log(canvas.width, canvas.height);

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // How many pixels fit on one PDF page
        const pageHeightPx = (canvas.width * pageHeight) / pageWidth;

        let renderedHeight = 0;
        const overlapPx = 20;

        while (renderedHeight < canvas.height) {
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(
                pageHeightPx,
                canvas.height - renderedHeight,
            );

            const ctx = pageCanvas.getContext("2d")!;

            ctx.drawImage(
                canvas,
                0,
                renderedHeight,
                canvas.width,
                pageCanvas.height,
                0,
                0,
                canvas.width,
                pageCanvas.height,
            );

            if (renderedHeight > 0) {
                pdf.addPage();
            }

            const pageHeightMM =
                (pageCanvas.height * pageWidth) / pageCanvas.width;

            pdf.addImage(
                pageCanvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                pageWidth,
                pageHeightMM,
            );

            renderedHeight += pageHeightPx - overlapPx;
        }

        pdf.save("note.pdf");
    } finally {
        document.body.removeChild(wrapper);
        disabledLinks.forEach((link) => {
            link.disabled = false;
        });
    }
}
