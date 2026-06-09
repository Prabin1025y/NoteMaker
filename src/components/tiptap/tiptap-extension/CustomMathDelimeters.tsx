import { Extension, nodeInputRule, nodePasteRule } from "@tiptap/core";

export const CustomMathDelimiters = Extension.create({
    name: "customMathDelimiters",

    addPasteRules() {
        return [
            // 1. Block Math Paste ($$formula$$)
            nodePasteRule({
                find: /(?<!\$)\$\$(?!\$)(.+?)(?<!\$)\$\$(?!\$)/g,
                type: this.editor.schema.nodes.blockMath,
                getAttributes: (match) => ({ latex: match[1] }),
            }),
            // 2. Inline Math Paste ($formula$)
            // PROTECTS: Checks that the character after $ is NOT a digit, and there are no spaces flanking the formula
            nodePasteRule({
                find: /(?<!\$)\$([^\s$](?:[^$]*?[^\s$])?)\$(?!\d)(?!\$)/g,
                type: this.editor.schema.nodes.inlineMath,
                getAttributes: (match) => ({ latex: match[1] }),
            }),
        ];
    },

    addInputRules() {
        return [
            // 3. Block Math Typing
            nodeInputRule({
                find: /(?<!\$)\$\$(?!\$)(.+?)\$\$$/,
                type: this.editor.schema.nodes.blockMath,
                getAttributes: (match) => ({ latex: match[1] }),
            }),
            // 4. Inline Math Typing
            // PROTECTS: Prevents triggering if you type a space right after the opening $, or if you type a digit (like $5)
            nodeInputRule({
                find: /(?<!\$)\$([^\s$](?:[^$]*?[^\s$])?)\$$/,
                type: this.editor.schema.nodes.inlineMath,
                getAttributes: (match) => ({ latex: match[1] }),
            }),
        ];
    },
});
