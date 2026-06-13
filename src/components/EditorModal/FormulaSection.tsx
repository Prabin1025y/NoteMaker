import FormulaViewer from "../FormulaViewer";
import FormulaEditor from "../FormulaViewer";
import ReadOnlyEditor from "../ReadOnlyEditor";

interface FormulaSectionProps {
    content: string;
    onChangeHandler: (content: string) => void;
}

const FormulaSection = ({ content, onChangeHandler }: FormulaSectionProps) => {
    return (
        <div className="flex-1 w-full flex flex-col gap-5">
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Formula
                </label>
                {/* <FormulaEditor
                    className="flex-1 border-2 rounded-md p-5 size-full"
                    content=""
                    
                    editable={true}
                /> */}
                <textarea
                defaultValue={content}
                    onChange={(e) => onChangeHandler(e.target.value)}
                    className="flex-1 border-2 rounded-md p-5 size-full"
                />
            </div>
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Preview
                </label>
                {/* <FormulaEditor
                    className="flex-1 border-2 rounded-md p-5 size-full"
                    content={content}
                    editable={false}
                /> */}
                <FormulaViewer
                    className="flex-1 border-2 rounded-md p-5 size-full grid place-items-center"
                    latex={content}
                />
            </div>
        </div>
    );
};

export default FormulaSection;
