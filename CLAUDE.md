# Claude.md — NoteMaker

## Project Vision

**NoteMaker** is a block-based note creation platform built with Next.js that combines the flexibility of Notion with the structured formatting needed for educational content, technical documentation, tutorials, study materials, and knowledge bases.

Unlike traditional markdown editors, users build notes using predefined visual blocks such as definitions, notes, examples, code snippets, images, and formulas. The system should provide a highly intuitive drag-and-drop experience while maintaining beautiful formatting that can be exported directly as PDF with the exact visual appearance of the editor.

The primary goal is to allow users to create professional-looking notes without worrying about formatting details.

---

# Product Goals

The application should:

* Create structured notes using predefined blocks
* Support both educational notes and technical documentation
* Provide a Notion-like editing experience
* Allow visual drag-and-drop organization
* Support reusable note structures
* Persist notes locally and later in cloud storage
* Export notes to PDF with pixel-perfect visual fidelity
* Support future AI-assisted note generation

---

# Target Users

### Students

Creating:

* Class notes
* Exam preparation notes
* Revision materials
* Research summaries

### Developers

Creating:

* Technical documentation
* API documentation
* Learning notes
* Programming tutorials

### Educators

Creating:

* Teaching materials
* Course notes
* Study guides

### Content Creators

Creating:

* Blog drafts
* Documentation
* Knowledge repositories

---

# Application Layout

The application uses a 3-panel layout.

```
┌──────────────┬────────────────────────────┬──────────────┐
│              │                            │              │
│ Block        │       Note Editor          │ Document     │
│ Library      │                            │ Structure    │
│              │                            │              │
└──────────────┴────────────────────────────┴──────────────┘
```

---

# Left Sidebar — Block Library

Purpose:

Allow users to insert predefined blocks into the note.

### Available Blocks

#### Text Block

Normal paragraph content.

#### Heading Block

Supports:

* H1
* H2
* H3

#### Definition Block

Used for formal definitions.

Example:

```
Definition

Machine Learning is...
```

#### Note Block

Used for additional information.

Example:

```
Note

This algorithm requires normalization.
```

#### Example Block

Used for examples and demonstrations.

#### Warning Block

Used for cautions.

#### Tip Block

Used for recommendations.

#### Code Block

Programming code with syntax highlighting.

#### Quote Block

Blockquote style content.

#### Formula Block

LaTeX-based mathematical formulas.

#### Image Block

Image with optional caption.

#### Divider Block

Visual section separator.

#### Checklist Block

Task/check item list.

#### Table Block

Structured tabular information.

---

# Center Panel — Note Editor

This is the primary workspace.

The editor should feel similar to Notion.

Users should be able to:

* Click to edit blocks
* Reorder blocks
* Duplicate blocks
* Delete blocks
* Collapse blocks
* Expand blocks
* Drag blocks
* Insert blocks between existing blocks

---

## Inline Editing

Every block should be editable directly.

No separate edit modal should be required.

Example:

```
Heading
--------------------
Introduction to AI
```

Clicking the heading immediately enables editing.

---

## Block Toolbar

When hovering a block:

```
[ Drag ]
[ Duplicate ]
[ Delete ]
[ Collapse ]
```

should appear.

---

# Right Sidebar — Document Structure

Purpose:

Provide a compact overview of the note.

Example:

```
Introduction
Definition
Example
Code
Note
Conclusion
```

Capabilities:

* Drag reorder
* Jump to block
* Visual hierarchy
* Collapse groups

---

# Block System

All blocks share a common structure.

```typescript
interface BaseBlock {
  id: string;
  type: BlockType;

  createdAt: string;
  updatedAt: string;
}
```

---

# Block Definitions

## Text Block

```typescript
{
  id: string;
  type: "text";
  content: string;
}
```

---

## Heading Block

```typescript
{
  id: string;
  type: "heading";
  level: 1 | 2 | 3;
  content: string;
}
```

---

## Definition Block

```typescript
{
  id: string;
  type: "definition";
  title: string;
  content: string;
}
```

---

## Note Block

```typescript
{
  id: string;
  type: "note";
  title: string;
  content: string;
}
```

---

## Example Block

```typescript
{
  id: string;
  type: "example";
  title: string;
  content: string;
}
```

---

## Warning Block

```typescript
{
  id: string;
  type: "warning";
  title: string;
  content: string;
}
```

---

## Code Block

```typescript
{
  id: string;
  type: "code";
  language: string;
  code: string;
}
```

---

## Formula Block

```typescript
{
  id: string;
  type: "formula";
  latex: string;
}
```

---

## Image Block

```typescript
{
  id: string;
  type: "image";
  src: string;
  caption: string;
}
```

---

## Table Block

```typescript
{
  id: string;
  type: "table";
  rows: string[][];
}
```

---

# Nested Block Support

The system must support nested blocks.

Example:

```
Machine Learning

 ├── Definition
 ├── Example
 │     ├── Code
 │     └── Note
 └── Summary
```

Nested blocks enable:

* Grouping related content
* Creating learning modules
* Building structured documents

Block schema:

```typescript
interface Block {
  id: string;
  type: BlockType;

  children?: Block[];
}
```

---

# Note Schema

```typescript
interface Note {
  id: string;

  title: string;

  description?: string;

  createdAt: string;
  updatedAt: string;

  blocks: Block[];
}
```

---

# State Management

Use Zustand.

Store should manage:

```typescript
{
  currentNote,

  selectedBlock,

  addBlock,
  updateBlock,
  deleteBlock,

  moveBlock,
  duplicateBlock,

  collapseBlock,
  expandBlock,

  saveNote,
  loadNote,

  undo,
  redo
}
```

---

# Drag and Drop

Use dnd-kit.

Features:

### Editor Dragging

Users can:

* Move blocks
* Nest blocks
* Reorder blocks

### Sidebar Dragging

Users can:

* Reorder via outline view

### Block Library

Users can:

* Drag new blocks into editor

---

# Persistence

## Phase 1

Local Storage

Store notes in browser.

```typescript
localStorage.notes
```

Capabilities:

* Save
* Update
* Delete
* Duplicate

---

## Future Phase

Supabase

Features:

* Authentication
* Sync
* Multi-device access

---

# PDF Export

## Primary Requirement

PDF must look exactly like the editor.

Visual consistency is critical.

The exported PDF should preserve:

* Colors
* Typography
* Block styles
* Spacing
* Images
* Code blocks

---

## Recommended Solution

Use:

```bash
html2canvas
jspdf
```

Workflow:

```
Editor
   ↓
Render Snapshot
   ↓
PDF Export
```

This ensures exported PDF matches editor visuals.

---

# Rich Content Support

## Syntax Highlighting

Use:

```bash
shiki
```

Features:

* Multiple languages
* Dark mode support
* Consistent PDF rendering

---

## Formula Rendering

Use:

```bash
katex
```

Support:

* Inline formulas
* Block formulas

---

## Image Support

Required:

* Drag upload
* Paste image
* Resize image
* Caption support

---

# Slash Commands

Typing:

```
/
```

opens:

```
/text
/heading
/definition
/note
/example
/warning
/code
/image
/formula
```

Similar to Notion.

---

# Keyboard Shortcuts

## Global

```text
Ctrl + S
Save Note
```

```text
Ctrl + Z
Undo
```

```text
Ctrl + Shift + Z
Redo
```

---

## Block Operations

```text
Ctrl + D
Duplicate Block
```

```text
Delete
Remove Block
```

```text
Ctrl + Shift + ↑
Move Up
```

```text
Ctrl + Shift + ↓
Move Down
```

---

# Public Sharing

Users should be able to generate shareable note links.

Example:

```
notemaker.app/note/abc123
```

Sharing modes:

### Public

Anyone can view.

### Unlisted

Link-only access.

### Private

Owner only.

---

# UI/UX Philosophy

The product should feel like:

### 80% Notion

* Clean
* Minimal
* Fast

### 20% Educational Tool

* Rich note blocks
* Structured content
* Learning-focused design

---

# Design Language

### Typography

Modern and readable.

Suggested:

```
Inter
```

---

### Styling

Use:

```
Tailwind CSS
```

and

```
shadcn/ui
```

---

### Visual Principles

* Spacious layout
* Minimal distractions
* Soft shadows
* Subtle borders
* Consistent spacing

---

# Theme Support

Required:

### Light Theme

Default mode.

### Dark Theme

Full support.

All block types must render correctly.

---

# Future AI Features

Not included in MVP.

Potential roadmap:

### AI Summary

Generate concise summaries.

### Quiz Generator

Create quizzes from notes.

### Flashcard Generator

Generate flashcards.

### Blog Generator

Convert notes into articles.

### Presentation Generator

Convert notes into slides.

---

# MVP Scope

## Included

✅ Text Block

✅ Heading Block

✅ Definition Block

✅ Note Block

✅ Example Block

✅ Warning Block

✅ Code Block

✅ Formula Block

✅ Image Block

✅ Table Block

✅ Nested Blocks

✅ Drag & Drop

✅ Local Storage

✅ PDF Export

✅ Public Sharing

✅ Slash Commands

✅ Keyboard Shortcuts

✅ Dark Mode

✅ Undo / Redo

---

## Excluded

❌ Authentication

❌ Real-time Collaboration

❌ AI Features

❌ Presentation Mode

❌ Executable Code Blocks

❌ Cloud Sync

---

# Suggested Tech Stack

## Frontend

* Next.js 15
* React 19
* TypeScript

## Styling

* Tailwind CSS
* shadcn/ui

## State

* Zustand

## Drag and Drop

* dnd-kit

## Code Rendering

* Shiki

## Formula Rendering

* KaTeX

## PDF Export

* html2canvas
* jsPDF

## Storage

* LocalStorage

## Validation

* Zod

## Utilities

* uuid
* date-fns

---

# Architecture Principle

Every feature should be implemented as a reusable block.

The editor should never contain block-specific logic.

Instead:

```typescript
BlockRenderer
    ↓
DefinitionBlock
NoteBlock
ExampleBlock
CodeBlock
ImageBlock
...
```

This makes future block types easy to add without modifying the editor core.

The system should be designed as a scalable block engine first, and a note-taking application second.
