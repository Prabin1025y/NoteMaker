import { Extension } from "@tiptap/core";

export const EditorShortcuts = Extension.create({
    name: "editorShortcuts",

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                this.editor.commands.insertContent("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");
                return true;
            },
            "Mod-Alt--": () => {
                this.editor.commands.toggleSubscript();
                return true;
            },

            "Mod-Alt-=": () => {
                this.editor.commands.toggleSuperscript();
                return true;
            },

            "Mod-Alt-t": () => {
                this.editor.commands.toggleHighlight({
                    color: "var(--tt-color-highlight-red)",
                });
                return true;
            },

            "Mod-Alt-y": () => {
                this.editor.commands.toggleHighlight({
                    color: "var(--tt-color-highlight-yellow)",
                });
                return true;
            },

            "Mod-Alt-l": () => {
                this.editor.commands.setTextAlign("left");
                return true;
            },

            "Mod-Alt-e": () => {
                this.editor.commands.setTextAlign("center");
                return true;
            },

            "Mod-Alt-r": () => {
                this.editor.commands.setTextAlign("right");
                return true;
            },

            "Mod-Alt-j": () => {
                this.editor.commands.setTextAlign("justify");
                return true;
            },
        };
    },
});
