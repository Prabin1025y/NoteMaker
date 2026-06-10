"use client";
import GeneralBlock from "@/components/Blocks/GeneralBlock1";
import NoteBlock from "@/components/Blocks/NoteBlock";
import { Toolbar } from "@/components/ToolBar";
import MainPage from "@/Pages/MainPage";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Home() {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: "<p>Hello World</p>",
    });
    return <MainPage />;
}
