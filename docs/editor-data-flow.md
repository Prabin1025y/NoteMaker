# Block editor data flow

This guide follows `EditorData` from the point a block editor is opened, through the modal's type-specific editing and save preparation, into the note store and eventual API sync. The modal itself is [BlockEditorModal.tsx](../src/components/EditorModal/BlockEditorModal.tsx).

## The data being passed around

[`EditorData`](../src/types/Editor.ts) is the modal's input/output shape:

| Field | Purpose |
| --- | --- |
| `id` | Existing block identifier when editing; empty for a new block. |
| `type` | One of `block`, `heading`, `code`, `image`, `table`, `divider`, `formula`, or `canvas`. |
| `title` | Block title or caption; for code, the title field is reused to carry the language. |
| `content` | A string whose representation depends on `type` (see below). |
| `designId`, `colorOptionId` | Rendering/design selections. |
| `order` | Existing/explicit position or `"auto"` for append behavior. |
| `action` | `"add"` creates a block; `"save"` edits an existing one. |

The source of truth is split deliberately:

- The note-level Zustand store keeps the current `editorData` that initializes the modal and the note's current `blocks` list. See [`DataStore.tsx`](../src/Context/DataStore.tsx).
- While the modal is open, `useBlockEditorState` copies those values into reducer-owned `state`; editor controls dispatch actions to update that state. See [`block-editor-state.ts`](../src/components/EditorModal/block-editor-state.ts).
- On submit, the modal constructs a fresh `EditorData` object and calls its `onSave` prop. The note page hands that callback to `addSaveBlock`.

## End-to-end orchestration

```text
Add/edit entry point
  -> page.openBlockEditor(data)
  -> Zustand editorData = data; isEditorOpen = true
  -> BlockEditorModal initializes reducer state from editorData
  -> type-specific editor dispatches state changes
  -> handleSave validates only through the button's disabled state,
     converts/upload content where needed, and emits EditorData
  -> page.handleSaveBlock -> store.addSaveBlock
  -> optimistic blocks update + blocksToBeSynced queue
  -> /api/notes/save writes queued changes
```

### Opening the modal

On the note page, `openBlockEditor` stores the supplied data and opens the modal. The same page renders `<BlockEditorModal onSave={handleSaveBlock} />` while `isEditorOpen` is true. See [`page.tsx`](<../src/app/(protected)/note/[id]/page.tsx>).

The main add/edit entry points are:

- **Add from the outline/sidebar:** [`LeftAside.tsx`](../src/components/LeftAside.tsx) forwards the selected type with `action: "add"`, empty `id`/title, `order: "auto"`, and default content.
- **Add from the canvas:** [`MainPage.tsx`](../src/components/MainPage.tsx) opens a new general block at `"auto"` order, or calculates an intermediate order when adding between two blocks.
- **Edit an existing block:** the rendered block's `onEdit` opens the modal with its current `id`, `type`, title, content and design values, plus `action: "save"`; this is in [`MainPage.tsx`](../src/components/MainPage.tsx).
- **Keyboard shortcuts:** the note page maps Alt+B/H/W/D/C/F/I/T to block, heading, canvas, divider, code, formula, image and table. It provides per-type default content when opening. The same page's shortcut handler ignores those shortcuts while the modal is open.
- The store also has initial editor data for a new general block, so there is a valid initial shape before any explicit open action.

Closing with Cancel, the close button, or Escape hides the modal. After a successful save, the page's `closeBlockEditor` also resets the store's `editorData` to a fresh general-block/add payload.

### Initial state and changing type

`BlockEditorModal` reads `editorData` from Zustand and calls `useBlockEditorState(editorData)`. The hook creates reducer state with `getInitialState`, and also dispatches `initialize` when the `editorData` object changes. Initial content is chosen as follows:

- For `"add"`, `getInitialState` uses the selected type's `config.initialContent`; it does **not** use the supplied `editorData.content`.
- For `"save"`, it starts from the existing `editorData.content`.
- For code, the title is normalized as a Monaco language (unsupported/empty values become `javascript`); the language is also stored separately in state.
- A zero design id becomes the state fallback `1`, while `designEnabled` is initialized from whether the incoming design id is nonzero.
- File state starts as `null`. When editing an image, an effect fetches its existing URL and creates a local preview `File`.

The selected type shown in the settings sidebar is resolved from `allBlocks`. Choosing another type dispatches `setType`: it installs that type's `initialContent`, clears the title except for code (which sets it to the detected language), and clears the selected file unless the new type is image. These choices and defaults are defined in [`block-editor-state.ts`](../src/components/EditorModal/block-editor-state.ts) and [`block-editor-config.ts`](../src/components/EditorModal/block-editor-config.ts); the type menu's labels/icons come from [`BlocksInfo.tsx`](../src/utils/BlocksInfo.tsx).

### Type controls and content representation

[`BlockContentEditor.tsx`](../src/components/EditorModal/BlockContentEditor.tsx) selects the editor UI from `state.currentType`. Each editor reports changes through a callback which dispatches `setContent` (or, for images, updates `state.file`).

| Type | Editor and `content` representation | Default and validation |
| --- | --- | --- |
| `block` | Tiptap `SimpleEditor`; JSON-serialized Tiptap document. | `initialJsonForEditor`; JSON must parse and have a top-level content array with text or multiple entries. |
| `heading` | Same Tiptap document format; the initial document has a centered level-2 heading. No title input. | `initialHeadingJsonContent`; validation currently always returns true. |
| `code` | Monaco source text; selected language is stored in `state.language` and copied into the saved `title`. | `"// Do Something"`; content must be non-empty after trimming. |
| `image` | A locally selected `PreviewFile` is held separately in `state.file`; persisted `content` is the uploaded image URL. Optional title is the caption. | Empty initial content; valid only when a file is selected/loaded. The drop zone is [`ImageUploader.tsx`](../src/components/ImageUploader.tsx). |
| `table` | JSON string of `{ cols, rows, headers, data }`; rows/columns have generated ids and cell contents are strings. | Initial three-by-three empty table. `EditableTable` initializes its own table state and serializes each state update back to the modal. See [`TableSection.tsx`](../src/components/EditorModal/TableSection.tsx). |
| `divider` | Divider name string selected from `ALL_DIVIDERS`; selected color is stored separately in `colorOptionId`. | First/default divider name; trimmed content must be non-empty. |
| `formula` | Formula/LaTeX source string from the textarea. | `"E=mc^2"`; trimmed content must be non-empty. |
| `canvas` | JSON string containing drawing `data` and `config` (theme/grid). | `initialJsonForCanvas`; validation requires valid JSON. Drawing changes are serialized by [`DrawCanvasSection.tsx`](../src/components/EditorModal/DrawCanvasSection.tsx). |

The common initial JSON strings and `blockTypeOptions`-to-rendered-block mapping are in [`UtilFunctions.tsx`](../src/utils/UtilFunctions.tsx). Type-specific initial content, title-field visibility, design support, validation, and preview fallback rules are in [`block-editor-config.ts`](../src/components/EditorModal/block-editor-config.ts).

### Validation, design settings, and preview

The modal looks up the current type's config and calls `config.validate` with current type, title, content, file and language. The result is used as `disabled={!isValid}` on [`BlockEditorFooter.tsx`](../src/components/EditorModal/BlockEditorFooter.tsx). The settings sidebar uses the type config to disable design controls for types that do not support design; its state is dispatched separately from content. See [`BlockSettingsSidebar.tsx`](../src/components/EditorModal/BlockSettingsSidebar.tsx).

The preview in [`BlockPreview.tsx`](../src/components/EditorModal/BlockPreview.tsx) renders the block component selected by `mapTypeToElement`, but it supplies sample/fixed preview content for several types (for example, a fixed image URL and example formula/code), rather than consistently rendering the edited modal content. The preview should therefore not be treated as the exact serialized content that will be saved.

### Save-time transformation

`handleSave` in `BlockEditorModal` begins with `state.content` and prepares it based on type:

1. **Image:** when `state.file` exists, it posts one file as `image` to `/api/upload-image` and replaces `savedContent` with the response URL. The route authenticates and uploads it to Cloudinary; see [`upload-image/route.ts`](../src/app/api/upload-image/route.ts).
2. **Block and heading:** `uploadBlobImages` parses the Tiptap JSON, recursively finds image nodes with `blob:` sources registered in the local blob-image registry, sends those files together to `/api/upload-images`, substitutes returned URLs into the document, and removes the local blob entries. If there are no registered blob images, the JSON string passes through unchanged. The route accepts the images and uploads them to Cloudinary; see [`upload-images/route.ts`](../src/app/api/upload-images/route.ts) and [`tiptap-utils.ts`](../src/lib/tiptap-utils.ts).
3. **Other types:** their current string content is passed through unchanged.

The emitted payload uses the original `editorData.id`, `order`, and `action`; current `type`, title, transformed content, and color option; and either the selected design id or `0` when design is switched off. For code, title is `state.language`. The modal calls `onSave` with that payload and resets its `isAdding` flag after the callback returns.

### Applying and persisting the payload

The note page's `handleSaveBlock` forwards the payload to the Zustand store's `addSaveBlock`, then closes/resets the modal. The queued changes are sent when the user invokes Save or by the note page's 30-second autosave flow; if an autosave tick occurs while the editor is open, it defers until the modal closes. In [`DataStore.tsx`](../src/Context/DataStore.tsx):

- On add, the store assigns an id/public id, current note id and timestamps; `"auto"` order becomes one greater than the last block order (or `1`); explicit order is preserved. The new block is inserted into the local blocks array in order.
- On edit, the store finds the existing block by `id`, compares the design, color, content, title and type fields, updates the in-memory block with changed fields, and queues an edit diff.
- Both paths queue an operation in `blocksToBeSynced`; `BlockSyncType` distinguishes add, edit and delete payloads in [`dataSotoreTypes.ts`](../src/types/dataSotoreTypes.ts).
- The note page's save flow calls `syncToDB`, which posts the queued operations to `/api/notes/save`. The route validates the body and delegates to `saveBlocks`; see [`notes/save/route.ts`](../src/app/api/notes/save/route.ts). Newly created local blocks are reconciled with database ids from the response.

So the editor's submit does not itself write a block to the database: it emits an `EditorData` value, the store applies it optimistically and queues a sync, and a separate save/sync operation persists it.

## Behavioral details worth knowing

- The Add/Save button is disabled by validation, but the modal also wires Ctrl+Shift+Enter directly to `handleSave` without checking `isValid`. That shortcut can submit content the button would reject.
- The default canvas string in `initialJsonForCanvas` is not valid JSON as currently written, while canvas validation requires `JSON.parse` to succeed. The initial canvas value therefore does not validate until the canvas editor emits parseable JSON.
- If an image-edit preview fetch fails, the state hook catches the error and leaves `file` null; image validation then remains false even though the old URL remains in `content`.
- Uploads run before `onSave`. If a request fails, `handleSave` currently does not catch it or clear `isAdding` in a `finally` block, so the modal stays in its in-progress state and the block is not applied to the note store.
- `action` is named `"save"` for editing and `"add"` for creation; the modal header/footer use the same distinction.

## Main file reference index

- Modal orchestration: [`BlockEditorModal.tsx`](../src/components/EditorModal/BlockEditorModal.tsx)
- Reducer initialization and transitions: [`block-editor-state.ts`](../src/components/EditorModal/block-editor-state.ts)
- Type defaults and validation: [`block-editor-config.ts`](../src/components/EditorModal/block-editor-config.ts)
- Type-specific editors: [`BlockContentEditor.tsx`](../src/components/EditorModal/BlockContentEditor.tsx)
- Add/edit callers and modal callback: [`page.tsx`](<../src/app/(protected)/note/[id]/page.tsx>), [`MainPage.tsx`](../src/components/MainPage.tsx), [`LeftAside.tsx`](../src/components/LeftAside.tsx)
- Optimistic updates and server sync: [`DataStore.tsx`](../src/Context/DataStore.tsx), [`notes/save/route.ts`](../src/app/api/notes/save/route.ts)
