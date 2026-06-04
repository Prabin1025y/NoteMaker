import { blockTypeOptions, useNoteStore } from "@/Context/DataStore";

interface MainPageProps {
    openBlockEditor: (
        title?: string,
        content?: string,
        type?: blockTypeOptions,
    ) => void;
}

const MainPage = ({ openBlockEditor }: MainPageProps) => {
    const { blocks, mapTypeToElement } = useNoteStore();
    return (
        <main className="flex-none w-[1000px] h-[1123px] rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
            <div className="flex h-full flex-col gap-6">
                <div className="space-y-3 flex flex-col gap-1">
                    <input
                        placeholder="Title"
                        className="text-4xl font-semibold text-slate-900 outline-none"
                        aria-label="Note title"
                    />
                    <input
                        placeholder="Description"
                        className="text-base leading-7 text-slate-600 outline-none"
                        aria-label="Note description"
                    />
                    <hr className="border-t bg-transparent border-dashed border-slate-300" />
                </div>
                <div>
                    {blocks.map((block) => {
                        const Component = mapTypeToElement(block.type);
                        if (!Component) return null;

                        return (
                            <Component
                                key={block.id}
                                title={block.title}
                                onEdit={() =>
                                    openBlockEditor(
                                        block.title,
                                        block.content,
                                        block.type,
                                    )
                                }
                            >
                                {block.content}
                            </Component>
                        );
                    })}
                </div>
                {/* <div className="flex justify-center">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 font-medium">
                        Add Block
                    </button>
                </div> */}
            </div>
        </main>
    );
};

export default MainPage;
