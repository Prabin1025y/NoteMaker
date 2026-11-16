import { Editor } from "@monaco-editor/react";
import { MonacoLanguage } from "@/utils/UtilFunctions";

interface CodeSectionProps {
    language: MonacoLanguage;
    content: string;
    onChangeHandler: (content: string) => void;
    height?: string;
    autoFocus?: boolean;
}

const CodeSection = ({ language, content, onChangeHandler, height = "90vh", autoFocus = false }: CodeSectionProps) => {
    return (
        <Editor
            className="rounded-lg overflow-hidden py-5 bg-[#1e1e1e]"
            height={height}
            defaultLanguage="javascript"
            language={language}
            value={content}
            theme="vs-dark"
            onChange={(v) => onChangeHandler(v || "")}
            onMount={(editor) => { if (autoFocus) editor.focus(); }}
        />
    );
};

export default CodeSection;
