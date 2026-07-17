import { Editor } from "@monaco-editor/react";
import { MonacoLanguage } from "@/utils/UtilFunctions";

interface CodeSectionProps {
    language: MonacoLanguage;
    content: string;
    onChangeHandler: (content: string) => void;
}

const CodeSection = ({ language, content, onChangeHandler }: CodeSectionProps) => {
    return (
        <Editor
            className="rounded-lg overflow-hidden py-5 bg-[#1e1e1e]"
            height="90vh"
            defaultLanguage="javascript"
            language={language}
            value={content}
            theme="vs-dark"
            onChange={(v) => onChangeHandler(v || "")}
        />
    );
};

export default CodeSection;
