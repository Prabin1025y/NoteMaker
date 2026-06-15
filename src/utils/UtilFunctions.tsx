
export function isValidJson(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

export const initialJsonForEditor = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`;

export const MONACO_LANGUAGES = [
    "plaintext",
    "javascript",
    "typescript",
    "html",
    "css",
    "scss",
    "json",
    "markdown",
    "xml",
    "yaml",
    "sql",
    "python",
    "java",
    "c",
    "cpp",
    "csharp",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "shell",
    "powershell",
    "dockerfile",
];

export type MonacoLanguage = (typeof MONACO_LANGUAGES)[number];
