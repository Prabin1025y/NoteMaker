import FormulaViewer from "../FormulaViewer";
// import FormulaEditor from "../FormulaViewer";
// import ReadOnlyEditor from "../ReadOnlyEditor";

interface FormulaSectionProps {
    content: string;
    onChangeHandler: (content: string) => void;
}

const FormulaSection = ({ content, onChangeHandler }: FormulaSectionProps) => {
    return (
        <div className="flex-1 w-full flex flex-col gap-5">
            <div className="flex-1 flex flex-col">
                <label className="mb-3 block text-[13px] font-semibold text-body">
                    Formula
                </label>
                <textarea
                defaultValue={content}
                    onChange={(e) => onChangeHandler(e.target.value)}
                    className="flex-1 size-full rounded-md border border-input bg-background/50 p-4 font-mono text-[13px] text-ink outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-[color:var(--ds-focus-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus-ring)]"
                />
            </div>
            <div className="flex-1 flex flex-col">
                <label className="mb-3 block text-[13px] font-semibold text-body">
                    Preview
                </label>
                <FormulaViewer
                    className="flex-1 size-full grid place-items-center rounded-md border border-muted bg-background/70 p-4"
                    latex={content}
                />
            </div>
        </div>
    );
};

export default FormulaSection;
