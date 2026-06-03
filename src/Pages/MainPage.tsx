import DefinitionBlock from "@/components/Blocks/DefinitionBlock";
import NoteBlock from "@/components/Blocks/NoteBlock";
import { ReactNode, ElementType } from "react";



const data: DataType[] = [
    {
        id: "1",
        node: DefinitionBlock,
        content: `I am a passionate fullstack developer with intermediate knowledge in building responsive and user-friendly
applications using modern technologies
`,
        title: "Definition 1.0",
    },
    {
        id: "2",
        node: NoteBlock,
        content: `I am a passionate fullstack developer with intermediate knowledge in building responsive and user-friendly
applications using modern technologies
`,
        title: "Definition 1.0",
    },
];

const MainPage = () => {
    return (
        <div className="max-w-7xl mx-auto min-h-screen bg-orange-50 px-10">
            {data.map((item) => (
                <item.node
                    key={item.id}
                    title={item.title}
                >
                    {item.content}
                </item.node>
            ))}
        </div>
    );
};

export default MainPage;
