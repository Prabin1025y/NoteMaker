# Block Editor Modal Refactor Plan

## Goal

Make `BlockEditorModal` stable, maintainable, and scalable by splitting responsibilities, centralizing state, simplifying conditional rendering, and using typed configuration.

## Problems in current implementation

- One giant component with many responsibilities
- Multiple `useEffect` hooks updating overlapping state
- Complex conditional rendering in JSX with nested logic
- State duplication between `editorData` and local state
- Block-specific forms and preview logic mixed together
- Hard to extend new block types or add validation rules

## High-level strategy

1. Model the editor as data-driven configuration.
2. Split the modal into smaller presentational and logic components.
3. Move state management into a custom hook or reducer.
4. Use shared helpers for validation and payload generation.
5. Avoid UI-specific side effects inside render logic.

## 1. Define the data model

Create a shared type/model for editor state and block configuration.

Example types:

- `BlockType = "image" | "code" | "formula" | "divider" | "block" | "heading" | "table"`
- `EditorAction = "add" | "save"`
- `BlockEditorPayload` with `type`, `title`, `content`, `designId`, `colorOptionId`, `order`, `id`, `action`
- `DesignSettings` object with `enabled`, `designId`, `colorOptionId`

Define a config map for block types:

- default title placeholder
- default content payload
- editor component
- preview content generator
- validation function
- whether design is available

This makes render decisions declarative instead of procedural.

## 2. Separate the modal into smaller components

Split the modal by concern:

- `BlockEditorModal`: modal shell, overlay, open/close, layout
- `BlockEditorHeader`: title and close button
- `BlockEditorBody`: two-column layout
- `BlockContentEditor`: renders block-specific editor form
- `BlockSettingsSidebar`: renders type selector, design settings, preview
- `BlockTypeSelector`: dropdown and block selection logic
- `BlockDesignControls`: apply design toggle and design/color pickers
- `BlockPreview`: type-aware preview component
- `BlockEditorFooter`: cancel/save buttons

Each component should receive minimal props and no duplicated logic.

## 3. Manage state with a reducer or custom hook

Use a single source of truth with one state object.

Example state shape:

```ts
interface BlockEditorState {
  currentBlockType: BlockType;
  title: string;
  content: string;
  file: PreviewFile | null;
  design: {
    enabled: boolean;
    designId: number;
    colorOptionId: number;
  };
  status: {
    isSaving: boolean;
    isVisible: boolean;
  };
}
```

Use `useReducer` or `useBlockEditorState` hook with actions such as:

- `initialize(editorData)`
- `setBlockType(type)`
- `setTitle(value)`
- `setContent(value)`
- `setFile(file)`
- `setDesignEnabled(enabled)`
- `setDesignId(id)`
- `setColorOptionId(id)`
- `startSaving()` / `finishSaving()`
- `reset()`

Benefits:

- central update logic
- easier debugging
- consistent transitions for dependent values
- avoids many separate `useState` calls

## 4. Move type-specific logic into dedicated modules

Create one configuration file like `block-editor-config.ts` or `block-type-config.ts`.

For each block type, define:

- `label`
- `icon`
- `description`
- `defaultContent`
- `validate(content, title, file)`
- `normalizePayload(state)`
- `renderEditor(props)`
- `renderPreview(props)`
- `designEnabled`

Example:

```ts
const blockTypeConfigs: Record<BlockType, BlockTypeConfig> = {
  image: {
    label: "Image",
    validate: ({ file, title }) => !!file,
    normalizePayload: ({ file, title, design }) => ({
      type: "image",
      content: file?.preview ?? "",
      title,
      designId: design.enabled ? design.designId : 0,
      colorOptionId: design.colorOptionId,
    }),
    renderEditor: ImageEditor,
    renderPreview: ImagePreview,
    designEnabled: false,
  },
  code: {
    label: "Code",
    validate: ({ content }) => content.trim().length > 0,
    ...
  },
  ...
};
```

This is the key to scalability: add a new block type once, not everywhere.

## 5. Simplify conditional rendering

Replace large inline `if/else` render blocks with component maps and configuration-driven rendering.

Instead of:

```tsx
{currentBlock.type === "code" ? <CodeSection ... /> : currentBlock.type === "image" ? <ImageDropZone ... /> : null}
```

Use:

```tsx
const EditorComponent = blockTypeConfig[currentBlockType].renderEditor;
return <EditorComponent {...editorProps} />;
```

Same for preview content and settings availability.

## 6. Use form abstractions for dynamic fields

For block-specific form fields:

- keep them in their own smaller components
- expose a simple `onChange` contract
- if you prefer, use `react-hook-form` for dynamic forms
- otherwise use controlled props with one state object

Example components:

- `CodeBlockForm` handles language dropdown + code editor
- `ImageBlockForm` handles caption + file upload
- `FormulaBlockForm` handles formula input and preview
- `DividerBlockForm` handles divider style selection
- `RichTextBlockForm` handles internal editor content

If multiple blocks share fields, move shared fields to reusable components.

## 7. Manage derived state in selectors/helpers

Avoid recomputing dependent state inside multiple `useEffect` hooks.

Use selectors and memoized helpers:

- `isValidBlock = validateBlock(currentBlockType, state)`
- `designUnavailable = !blockTypeConfig[currentBlockType].designEnabled`
- `previewProps = buildPreviewProps(state)`

If a value truly needs to be derived from props, compute it once in `useMemo` or inside reducer initialization.

## 8. Keep side effects isolated and safe

Current code downloads an image preview inside `useEffect` whenever the modal opens. Instead:

- move image file loading into `useBlockEditorState.initialize`
- keep side effects in one place
- revoke object URLs when the modal closes or file changes

Example:

```ts
useEffect(() => {
  return () => {
    if (state.file?.preview) URL.revokeObjectURL(state.file.preview);
  };
}, [state.file]);
```

## 9. Validation and save flow

Centralize save validation and payload creation:

- `const isSaveDisabled = !blockTypeConfig[currentBlockType].validate(state)`
- `const payload = blockTypeConfig[currentBlockType].normalizePayload(state)`
- `onSave(payload)`

Use one save handler in the modal shell rather than spreading upload logic across the rendering tree.

For image uploads, keep the upload logic in the modal or in a service module, not inside the render block.

## 10. Example component structure

```
src/components/EditorModal/
  BlockEditorModal.tsx
  BlockEditorHeader.tsx
  BlockEditorBody.tsx
  BlockContentEditor.tsx
  BlockSettingsSidebar.tsx
  BlockPreview.tsx
  BlockTypeSelector.tsx
  block-editor-state.ts
  block-editor-config.ts
  block-type-forms/
    CodeBlockForm.tsx
    ImageBlockForm.tsx
    FormulaBlockForm.tsx
    DividerBlockForm.tsx
    RichTextBlockForm.tsx
```

## 11. Incremental refactor path

1. Extract config and types first.
2. Build a simple `useBlockEditorState` reducer.
3. Extract the current block type selector and sidebar from `BlockEditorModal`.
4. Replace conditional content sections with `renderEditor` components.
5. Move preview logic into a dedicated component.
6. Add a validation hook and save payload helper.
7. Keep the old modal working behind the scenes while refactoring.

## 12. Stability best practices

- Use TypeScript for block data and editor payloads.
- Keep each component focused on one responsibility.
- Use small pure functions for validation and payload normalization.
- Avoid mixing UI markup, state mutation, and side effects.
- Prefer data-driven declarations over branching logic.
- Write tests for block-config mappings and save validation if possible.

## Summary

A stable refactor needs:

- a normalized state object managed by a reducer/hook
- block-type configuration rather than ad hoc if/else branches
- isolated block-specific forms/components
- a small shell component for layout and actions
- centralized validation and payload generation

This approach makes the modal easier to extend, debug, and maintain over time.
