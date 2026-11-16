export interface LandingAsset {
    src: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
}

// Replace these sources and captions when the real product images are ready.
export const LANDING_ASSETS = {
    note: {
        src: "/landing/note-a4-placeholder.svg",
        width: 840,
        height: 1188,
        alt: "A portrait physics study note on Newton’s laws, with a definition, a rendered equation, a force diagram, and a comparison table.",
        caption: "Illustrative physics note · A4",
    },
    editor: {
        src: "/landing/editor-placeholder.svg",
        width: 1600,
        height: 1000,
        alt: "An illustrative block editor with text, a formula, a worked example, drawing tools, and a note outline.",
        caption: "Illustrative editor preview",
    },
    designs: {
        src: "/landing/designs-placeholder.svg",
        width: 1440,
        height: 1000,
        alt: "An illustrative definition and example with preset styling, alongside block design and color settings.",
        caption: "Illustrative block design preview",
    },
    ai: {
        src: "/landing/ai-placeholder.svg",
        width: 1440,
        height: 960,
        alt: "An illustrative prompt about Newton’s laws becoming editable definition, formula, and worked-example blocks.",
        caption: "Illustrative AI generation preview",
    },
} satisfies Record<string, LandingAsset>;
