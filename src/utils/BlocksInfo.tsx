import {
    BookOpen,
    Code,
    FlaskConical,
    Divide,
    Table2,
    ImageIcon,
} from "lucide-react";
import { initialJsonForEditor } from "./UtilFunctions";
import { makeInitialState } from "@/components/EditorModal/TableSection";
import { ALL_DIVIDERS } from "./Dividers";
import { blockTypeOptions } from "@/types/Editor";

export interface BlockItem {
    defaultDesignId: number;
    type: blockTypeOptions;
    title: string;
    description: string;
    icon: React.ReactNode;
    defaultContent: string;
    color: string;
    bgColor: string;
    hoverColor: string;
}

export const allBlocks: BlockItem[] = [
    // {
    //     defaultDesignId: 1,
    //     type: "text",
    //     title: "Text",
    //     description: "Add a paragraph of text",
    //     icon: <Type size={20} />,
    //     color: "text-slate-600",
    //     bgColor: "bg-slate-50",
    //     hoverColor: "hover:bg-slate-100",
    // },
    // {
    //     type: "heading",
    //     title: "Heading",
    //     description: "Add a section heading",
    //     icon: <Heading2 size={20} />,
    //     color: "text-blue-600",
    //     bgColor: "bg-blue-50",
    //     hoverColor: "hover:bg-blue-100",
    // },
    {
        defaultDesignId: 1,
        type: "block",
        title: "General Block",
        description: "Definition, Example, Notes, Tips etc.",
        defaultContent: initialJsonForEditor,
        icon: <BookOpen size={20} />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        hoverColor: "hover:bg-purple-100",
    },
    // {
    //     defaultDesignId: 2,
    //     type: "note",
    //     title: "Note",
    //     description: "Add an important note",
    //     icon: <AlertCircle size={20} />,
    //     color: "text-amber-600",
    //     bgColor: "bg-amber-50",
    //     hoverColor: "hover:bg-amber-100",
    // },
    // {
    //     defaultDesignId: 3,
    //     type: "example",
    //     title: "Example",
    //     description: "Show an example or use case",
    //     icon: <FlaskConical size={20} />,
    //     color: "text-green-600",
    //     bgColor: "bg-green-50",
    //     hoverColor: "hover:bg-green-100",
    // },
    // {
    //     defaultDesignId: 1,
    //     type: "tips",
    //     title: "Tip",
    //     description: "Share a helpful tip",
    //     icon: <Lightbulb size={20} />,
    //     color: "text-yellow-600",
    //     bgColor: "bg-yellow-50",
    //     hoverColor: "hover:bg-yellow-100",
    // },
    // {
    // defaultDesignId: 1,//
    // type: "warning",
    //     title: "Warning",
    //     description: "Highlight a warning or caution",
    //     icon: <AlertCircle size={20} />,
    //     color: "text-red-600",
    //     bgColor: "bg-red-50",
    //     hoverColor: "hover:bg-red-100",
    // },
    {
        defaultDesignId: 1,
        type: "code",
        title: "Code",
        defaultContent: "// Do Something",
        description: "Insert code snippet",
        icon: <Code size={20} />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        hoverColor: "hover:bg-indigo-100",
    },
    {
        defaultDesignId: 1,
        type: "formula",
        title: "Formula",
        description: "Add a math formula",
        defaultContent: "E=mc^2",
        icon: <FlaskConical size={20} />,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        hoverColor: "hover:bg-cyan-100",
    },
    {
        defaultDesignId: 1,
        type: "image",
        title: "Image",
        defaultContent: "",
        description: "Insert an image",
        icon: <ImageIcon size={20} />,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        hoverColor: "hover:bg-pink-100",
    },
    {
        defaultDesignId: 1,
        type: "table",
        title: "Table",
        defaultContent: JSON.stringify(makeInitialState()),
        description: "Create a data table",
        icon: <Table2 size={20} />,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        hoverColor: "hover:bg-teal-100",
    },
    // {
    // defaultDesignId: 1,
    // type: "quote",
    //     title: "Quote",
    //     description: "Add a blockquote",
    //     icon: <Quote size={20} />,
    //     color: "text-gray-600",
    //     bgColor: "bg-gray-50",
    //     hoverColor: "hover:bg-gray-100",
    // },
    // {
    // defaultDesignId: 1,
    // type: "checklist",
    //     title: "Checklist",
    //     description: "Create a task list",
    //     icon: <CheckSquare size={20} />,
    //     color: "text-lime-600",
    //     bgColor: "bg-lime-50",
    //     hoverColor: "hover:bg-lime-100",
    // },
    {
        defaultDesignId: 1,
        type: "divider",
        title: "Divider",
        defaultContent: ALL_DIVIDERS[0].name,
        description: "Add a section divider",
        icon: <Divide size={20} />,
        color: "text-neutral-600",
        bgColor: "bg-neutral-50",
        hoverColor: "hover:bg-neutral-100",
    },
];