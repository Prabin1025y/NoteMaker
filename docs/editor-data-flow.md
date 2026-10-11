# Block editor data flow

This guide follows a block from its add/edit entry point, through the modal's
type-specific editing and save preparation, into the note store and API sync.
The modal is [`BlockEditorModal.tsx`](../src/components/EditorModal/BlockEditorModal.tsx).

## The data shapes

[`EditorDataType`](../src/types/Editor.ts) is a discriminated union. The
`type` field determines the shape of the remaining type-specific data:

| Block type | Editor payload |
| --- | --- |
| `block`, `heading` | `content: JSONContent` (Tiptap document) |
| `table` | `content: TableState` (columns, rows, headers, cell data) |
| `canvas` | `content: CanvasEditorContentType` (Quickdraw snapshot and config) |
| `code` | `content: string` and `language: MonacoLanguage` |
| `formula` | `content: string` containing the formula source |
| `divider` | `content` is one of the names in `ALL_DIVIDERS` |
| `image` | `url: string`; an upload `File` is held separately in modal state |

All variants also include `id`, `title`, `designId`, `colorOptionId`, `order`,
and `action`. In particular, code's language and an image's URL are not
substitutes for a generic `content` property in the modal payload.

The stored/API block shape is different by design: `BlockType.content` is a
string in [`dataSotoreTypes.ts`](../src/types/dataSotoreTypes.ts). Structured
Tiptap, table, and canvas values are serialized once when the store maps the
typed editor union into persisted block data. They are parsed and validated
when stored blocks are opened for editing or rendered.

## End-to-end orchestration

```text
Add/edit entry point
  -> page.openBlockEditor(EditorDataType)
  -> Zustand editorDataState + isEditorOpen
  -> BlockEditorModal initializes reducer state
  -> type-specific editor dispatches typed content changes
  -> handleSave validates and emits the matching EditorDataType variant
  -> page.handleSaveBlock -> store.addSaveBlock
  -> optimistic BlockType update + blocksToBeSynced queue
  -> /api/notes/save persists queued changes
```

### Opening the modal

The note page's `openBlockEditor` stores the payload in Zustand and opens the
modal. The main entry points are:

- **Add from the sidebar:** [`LeftAside.tsx`](../src/components/LeftAside.tsx)
  switches on the selected `BlockItem.type`, validates structured defaults,
  and constructs the matching union member.
- **Add between blocks:** [`MainPage.tsx`](../src/components/MainPage.tsx)
  creates a general block and computes an intermediate order.
- **Edit an existing block:** `MainPage` deserializes stored structured
  content, validates it with the schemas in
  [`editorData.ts`](../src/validation/editorData.ts), and only opens the
  editor when content matches that block type. Image content is mapped to the
  editor union's `url` field.
- **Keyboard shortcuts:** the note page maps shortcuts to block types and
  creates the corresponding typed initial payload.
- **AI-generated blocks:** [`generate-note.ts`](../src/lib/generate-note.ts)
  validates streamed block types, converts generated Markdown to Tiptap
  `JSONContent`, parses/validates table and canvas JSON, and constructs the
  appropriate `EditorDataType` variant before calling `addSaveBlock`.

The page renders the modal with its `handleSaveBlock` callback. Closing after
save resets the editor payload to a fresh general-block/add value.

### Reducer state and changing type

[`block-editor-state.ts`](../src/components/EditorModal/block-editor-state.ts)
initializes reducer state from the incoming union member. If the selected type
has no `content` property (image), the reducer starts `content` as an empty
string and separately initializes `url`. For an image being edited, an effect
fetches its existing URL and creates a local preview `File`.

Choosing a different block type dispatches `setType`. The reducer installs
that type's `initialContent`, keeps an image file only when the new type is
image, and initializes the code language from the title when switching to
code. Initial values are defined in
[`block-editor-config.ts`](../src/components/EditorModal/block-editor-config.ts)
and [`UtilFunctions.tsx`](../src/utils/UtilFunctions.tsx).

### Type-specific editing and content decisions

[`BlockContentEditor.tsx`](../src/components/EditorModal/BlockContentEditor.tsx)
switches on `state.currentType`. It validates union-shaped reducer content
before passing it to structured editors. Each editor reports changes via
`setContent`; image selection instead updates `state.file`.

| Type | Live editor content | Default / validation |
| --- | --- | --- |
| `block` | Tiptap `SimpleEditor` emits a `JSONContent` object. | `INITIAL_JSON_EDITOR`; schema validation plus non-whitespace text check. |
| `heading` | Tiptap emits a `JSONContent` object; no title input. | `INITIAL_JSON_HEADING`; must pass the Tiptap JSON schema. |
| `code` | Monaco source string; language is kept separately in reducer state. | `"// Do Something"`; content must be a non-empty string. |
| `image` | A `PreviewFile` lives in `state.file`; the typed save payload carries its uploaded URL in `url`. | Requires a selected or loaded file; optional title is a caption. See [`ImageUploader.tsx`](../src/components/ImageUploader.tsx). |
| `table` | `EditableTable` emits a `TableState` object, not JSON text. | A three-by-three empty table; validated with `TableStateSchema`. See [`TableSection.tsx`](../src/components/EditorModal/TableSection.tsx). |
| `divider` | A divider name string from `ALL_DIVIDERS`. | Defaults to the first divider; the value must match an allowed name. |
| `formula` | Formula/LaTeX source string. | `"E=mc^2"`; must be a non-empty string. |
| `canvas` | Quickdraw snapshot plus theme/grid config as a `CanvasEditorContentType` object. | `INITIAL_JSON_CANVAS`; validated with `CanvasEditorContentSchema`. See [`DrawCanvasSection.tsx`](../src/components/EditorModal/DrawCanvasSection.tsx). |

The runtime schemas are centralized in
[`editorData.ts`](../src/validation/editorData.ts). JSON serialization is not
performed by the Tiptap, table, or canvas editing callbacks; their in-memory
values remain structured objects.

### Save-time transformation

`handleSave` in `BlockEditorModal` first checks the current type's validation
result. It then constructs the correct discriminated union member:

1. **Image:** uploads `state.file` to `/api/upload-image`; the resulting URL is
   emitted as `url`.
2. **Block and heading:** validates the Tiptap JSON, uploads any registered
   blob-backed image nodes, and emits the updated `JSONContent` object.
3. **Table and canvas:** validates their respective schemas and emits the
   structured object unchanged.
4. **Code, divider, and formula:** checks their string/literal content and
   emits that type-specific value. Code also emits `state.language`.

The common payload contains the original `id`, `order`, and `action`, plus the
current title, design id, and color option. Turning design off saves
`designId: 0`. `onSave` receives `EditorDataType`; it does not receive a
generic string-content object.

### Store and persistence boundary

The note page forwards the typed payload to `addSaveBlock` in
[`DataStore.tsx`](../src/Context/DataStore.tsx). `getStoredContent` is the
explicit boundary where it becomes the persisted string representation:

- `block`, `heading`, `table`, and `canvas`: `JSON.stringify(content)`.
- `image`: the payload's `url`.
- `code`, `divider`, and `formula`: the string content.

On add, the store assigns ids, note id, timestamps, and final order; it updates
the local blocks list and queues an add sync. On edit, it compares the
serialized stored values and queues only changed fields. The note page's save
and autosave flows call `syncToDB`, which sends the queue to
`/api/notes/save`; the route validates the request and persists changes.

When reopening/rendering blocks, `MainPage` parses the persisted strings for
structured types and validates them before building editor data or rendering
the corresponding component. The PDF renderer follows the same parse/validate
pattern in [`MainContent.tsx`](<../src/app/internal/pdf/note/[id]/MainContent.tsx>).
Malformed structured content is not passed to a component as if it were valid
Tiptap/table/canvas data.

## File reference index

- Union and reducer-state types: [`Editor.ts`](../src/types/Editor.ts)
- Modal orchestration and type-specific save payloads: [`BlockEditorModal.tsx`](../src/components/EditorModal/BlockEditorModal.tsx)
- Reducer initialization and transitions: [`block-editor-state.ts`](../src/components/EditorModal/block-editor-state.ts)
- Type defaults and validation: [`block-editor-config.ts`](../src/components/EditorModal/block-editor-config.ts)
- Per-type editor routing: [`BlockContentEditor.tsx`](../src/components/EditorModal/BlockContentEditor.tsx)
- Add/edit callers and modal callback: [`page.tsx`](<../src/app/(protected)/note/[id]/page.tsx>), [`MainPage.tsx`](../src/components/MainPage.tsx), [`LeftAside.tsx`](../src/components/LeftAside.tsx)
- AI-generated typed payloads: [`generate-note.ts`](../src/lib/generate-note.ts)
- Persisted block type and string content: [`dataSotoreTypes.ts`](../src/types/dataSotoreTypes.ts)
- Optimistic updates and serialization/sync: [`DataStore.tsx`](../src/Context/DataStore.tsx)
- Runtime validators: [`editorData.ts`](../src/validation/editorData.ts)
