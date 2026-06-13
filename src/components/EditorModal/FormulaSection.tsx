import ReadOnlyEditor from "../ReadOnlyEditor";

interface FormulaSectionProps {
    content: string;
}

const FormulaSection = ({ content }: FormulaSectionProps) => {
    return (
        <div className="flex-1 w-full flex flex-col gap-5">
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Formula
                </label>
                <textarea className="flex-1 border-2 rounded-md p-5 size-full" />
            </div>
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Preview
                </label>
                <ReadOnlyEditor
                    className="flex-1 border-2 rounded-md p-5 size-full"
                    hasTitle={false}
                    content={content}
                />
            </div>
        </div>
    );
};

export default FormulaSection;
