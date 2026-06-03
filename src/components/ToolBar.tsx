import { Editor} from "@tiptap/react"

export function Toolbar({ editor }:{editor: Editor}) {
  if (!editor) return null;

  return (
    <div className="flex gap-5">
      <button
      className="border rounded-sm p-2 aspect-square"
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
      >
        B
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
      >
        I
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleUnderline().run()
        }
      >
        U
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleBulletList().run()
        }
      >
        • List
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
      >
        1. List
      </button>

      <button
        onClick={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
      >
        Center
      </button>
    </div>
  );
}