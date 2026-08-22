/**
 * Folder color palette for Eton Note.
 *
 * The DB stores only the stable `key` (e.g. "amber"); the UI resolves it to
 * theme-aware colors. Tones are intentionally muted so folder tags read as
 * calm accents rather than competing with the single yellow-orange brand.
 */

export type FolderColorKey =
    | "amber"
    | "slate"
    | "sage"
    | "sky"
    | "plum"
    | "rose"
    | "clay"
    | "teal";

export interface FolderColor {
    key: FolderColorKey;
    label: string;
    /** Solid dot / marker color (works on light + dark). */
    dot: string;
    /** Soft translucent surface for chips and folder tiles. */
    soft: string;
    /** Border tint for the soft surface. */
    ring: string;
}

export const FOLDER_COLORS: Record<FolderColorKey, FolderColor> = {
    amber: {
        key: "amber",
        label: "Amber",
        dot: "#d99a2b",
        soft: "rgba(217, 154, 43, 0.14)",
        ring: "rgba(217, 154, 43, 0.35)",
    },
    slate: {
        key: "slate",
        label: "Slate",
        dot: "#6f7a88",
        soft: "rgba(111, 122, 136, 0.14)",
        ring: "rgba(111, 122, 136, 0.32)",
    },
    sage: {
        key: "sage",
        label: "Sage",
        dot: "#4f9d69",
        soft: "rgba(79, 157, 105, 0.14)",
        ring: "rgba(79, 157, 105, 0.32)",
    },
    sky: {
        key: "sky",
        label: "Sky",
        dot: "#4a90c2",
        soft: "rgba(74, 144, 194, 0.14)",
        ring: "rgba(74, 144, 194, 0.32)",
    },
    plum: {
        key: "plum",
        label: "Plum",
        dot: "#8a6bb0",
        soft: "rgba(138, 107, 176, 0.14)",
        ring: "rgba(138, 107, 176, 0.32)",
    },
    rose: {
        key: "rose",
        label: "Rose",
        dot: "#c26a86",
        soft: "rgba(194, 106, 134, 0.14)",
        ring: "rgba(194, 106, 134, 0.32)",
    },
    clay: {
        key: "clay",
        label: "Clay",
        dot: "#c17d54",
        soft: "rgba(193, 125, 84, 0.14)",
        ring: "rgba(193, 125, 84, 0.32)",
    },
    teal: {
        key: "teal",
        label: "Teal",
        dot: "#3f9d92",
        soft: "rgba(63, 157, 146, 0.14)",
        ring: "rgba(63, 157, 146, 0.32)",
    },
};

export const FOLDER_COLOR_KEYS = Object.keys(FOLDER_COLORS) as FolderColorKey[];

export const DEFAULT_FOLDER_COLOR: FolderColorKey = "slate";

/** Resolve a stored value to a FolderColor, falling back to the default. */
export function resolveFolderColor(color?: string | null): FolderColor {
    if (color && color in FOLDER_COLORS) {
        return FOLDER_COLORS[color as FolderColorKey];
    }
    return FOLDER_COLORS[DEFAULT_FOLDER_COLOR];
}

/**
 * Deterministically pick a palette color from a seed (e.g. folder name or id)
 * so auto-assigned folder colors are stable and reasonably well distributed.
 */
export function pickFolderColor(seed: string): FolderColorKey {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return FOLDER_COLOR_KEYS[hash % FOLDER_COLOR_KEYS.length];
}
