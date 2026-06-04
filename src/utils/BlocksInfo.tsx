import { blockTypeOptions } from "@/Context/DataStore";
import {
    Type,
    BookOpen,
    Lightbulb,
    AlertCircle,
    Code,
    FlaskConical,
    Image,
    Divide,
    Table2,
} from "lucide-react";

export interface BlockItem {
    type: blockTypeOptions;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    hoverColor: string;
}

export const allBlocks: BlockItem[] = [
    {
        type: "text",
        title: "Text",
        description: "Add a paragraph of text",
        icon: <Type size={20} />,
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        hoverColor: "hover:bg-slate-100",
    },
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
        type: "definition",
        title: "Definition",
        description: "Define a term or concept",
        icon: <BookOpen size={20} />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        hoverColor: "hover:bg-purple-100",
    },
    {
        type: "note",
        title: "Note",
        description: "Add an important note",
        icon: <AlertCircle size={20} />,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        hoverColor: "hover:bg-amber-100",
    },
    {
        type: "example",
        title: "Example",
        description: "Show an example or use case",
        icon: <FlaskConical size={20} />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        hoverColor: "hover:bg-green-100",
    },
    {
        type: "tips",
        title: "Tip",
        description: "Share a helpful tip",
        icon: <Lightbulb size={20} />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        hoverColor: "hover:bg-yellow-100",
    },
    // {
    //     type: "warning",
    //     title: "Warning",
    //     description: "Highlight a warning or caution",
    //     icon: <AlertCircle size={20} />,
    //     color: "text-red-600",
    //     bgColor: "bg-red-50",
    //     hoverColor: "hover:bg-red-100",
    // },
    {
        type: "code",
        title: "Code",
        description: "Insert code snippet",
        icon: <Code size={20} />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        hoverColor: "hover:bg-indigo-100",
    },
    {
        type: "formula",
        title: "Formula",
        description: "Add a math formula",
        icon: <FlaskConical size={20} />,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        hoverColor: "hover:bg-cyan-100",
    },
    {
        type: "image",
        title: "Image",
        description: "Insert an image",
        icon: <Image size={20} />,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        hoverColor: "hover:bg-pink-100",
    },
    {
        type: "table",
        title: "Table",
        description: "Create a data table",
        icon: <Table2 size={20} />,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        hoverColor: "hover:bg-teal-100",
    },
    // {
    //     type: "quote",
    //     title: "Quote",
    //     description: "Add a blockquote",
    //     icon: <Quote size={20} />,
    //     color: "text-gray-600",
    //     bgColor: "bg-gray-50",
    //     hoverColor: "hover:bg-gray-100",
    // },
    // {
    //     type: "checklist",
    //     title: "Checklist",
    //     description: "Create a task list",
    //     icon: <CheckSquare size={20} />,
    //     color: "text-lime-600",
    //     bgColor: "bg-lime-50",
    //     hoverColor: "hover:bg-lime-100",
    // },
    {
        type: "divider",
        title: "Divider",
        description: "Add a section divider",
        icon: <Divide size={20} />,
        color: "text-neutral-600",
        bgColor: "bg-neutral-50",
        hoverColor: "hover:bg-neutral-100",
    },
];
