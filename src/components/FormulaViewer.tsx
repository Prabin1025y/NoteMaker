
import katex from "katex";
import "katex/dist/katex.min.css";

export default function FormulaViewer({
    latex,
    className,
}: {
    latex: string;
    className: string;
}) {
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{
                __html: katex.renderToString(latex, {
                    throwOnError: false,
                }),
            }}
        />
    );
}
