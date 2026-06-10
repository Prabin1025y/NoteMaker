export function isValidJson(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

export const initialJsonForEditor = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":" "}]}]}`;
