import { Editor } from "@monaco-editor/react";
import { MonacoLanguage } from "@/utils/UtilFunctions";
import { EditorData } from "@/types/Editor";

interface CodeSectionProps {
    language: MonacoLanguage;
    onChangeHandler: (content: string) => void;
    // content: string;
    editorData: EditorData;
}

const CodeSection = ({
    language,
    onChangeHandler,
    editorData,
}: CodeSectionProps) => {
    return (
        <>
            <Editor
                className="rounded-lg overflow-hidden py-5 bg-[#1e1e1e]"
                height="90vh"
                defaultLanguage="javascript"
                language={language}
                defaultValue={
                    editorData.action === "add" || editorData.type !== "code"
                        ? "// Do Something"
                        : editorData.content
                }
                theme="vs-dark"
                onChange={(v, e) => onChangeHandler(v || "Invalid Content")}
            />
        </>
    );
};

export default CodeSection;
