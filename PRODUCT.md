# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and self-directed learners who capture learning material, organize it by subject or topic, and return to it for study. Lecture notes are an important use case within this broader learning audience.

## Product Purpose

Eton Note helps learners turn varied study material into useful, readable notes. Its primary promise is mixed-content study notes: text, code, math, tables, images, and freehand sketches can live together on one page and be rearranged as understanding develops.

Success means a learner can capture the material they need, organize and revise it, and return to a note that supports studying. AI assistance and PDF export support that core job.

## Positioning

A learning-focused, block-based notebook. Each piece of material is an independently editable and reorderable block, allowing a single note to combine explanations, examples, formulas, diagrams, and code. Subject organization, AI generation, and export complement the notebook rather than replace its mixed-content purpose.

## Operating Context

- Capture material during lectures or independent study, then rearrange and revisit it for revision.
- Sign in with Google, open the dashboard, and create or find a note within a folder.
- Add and edit type-specific blocks; use the note outline to navigate and reorder them.
- Find notes through folders, search, favorites, and pinned notes.
- Preview a note, export it as a PDF for printing or submission, or explicitly enable public, read-only link sharing.

## Capabilities and Constraints

### Confirmed product commitments

- Google sign-in remains an available account entry point.
- Notes are private by default. Owners can explicitly opt into public, read-only link sharing.
- The product is free to start. This confirms free entry, not a particular free-tier limit or a promise that all future capabilities are free.

### Current implementation

These facts are grounded in the existing repository; they describe current behavior rather than independently approved roadmap commitments.

- Block types include rich text, headings, code, images, tables, dividers, LaTeX formulas, and a freehand canvas.
- Notes belong to folders and support favorites and pinning. The dashboard includes search, sorting, and grid/list views.
- The editor includes manual saving, autosave, undo/redo, an outline, and a preview mode.
- Rich text supports formatted paste where compatible, inline images, and LaTeX in `$$…$$`. General blocks can present definitions and examples; designs and color choices are selected per block.
- Blocks can be reordered, duplicated, copied into another note, inserted between existing blocks, searched, edited, and deleted.
- AI Block Generator accepts a user prompt and streams generated blocks from a configured external endpoint. It currently sends the prompt, not the contents of the open note.
- PDF export uses a configured external PDF service and an internal note-rendering route.
- Public note links currently require the viewer to sign in. A non-owner viewing a public note receives a read-only session.
- The application uses Next.js App Router with React and TypeScript; account, folder, note, and block persistence uses Prisma and PostgreSQL.

### Open decisions

- Whole-note AI summarization: the inspected editor integration only establishes prompt-based block generation. Its intended behavior and availability need confirmation before it is treated as a delivered capability.
- Anonymous access to public links: current viewers must authenticate; a guest-viewing requirement has not been established.
- Free-tier limits, paid plans, and any billing model beyond free entry are undecided.
- Device priorities and product-specific accessibility or localization requirements have not been established. Responsive layouts and reduced-motion handling exist in the current web implementation.

## Brand Commitments

- Preserve the product name **Eton Note**.
- Preserve the existing logo asset at `public/logo.png`.
- The package name `notemaker` is an implementation identifier; the confirmed user-facing name is Eton Note.
- No additional voice or visual-direction commitments were established during init.

## Evidence on Hand

- `script.txt`: supplied product-presentation script covering mixed-content notes, designs, block management, subjects, autosave, themes, PDF export, and prompt-based AI generation.
- `src/app/page.tsx` and `docs/landing-page.md`: landing copy, feature placement, and explicitly illustrative, replaceable product previews for students and self-directed learners.
- `src/components/Dashboard/`, `src/components/CreateNoteModal.tsx`, and `src/app/(protected)/note/[id]/page.tsx`: implemented organization, note creation, and editing workflows.
- `docs/editor-data-flow.md`: documented block types, editing, validation, persistence, and AI-generated block integration.
- `src/components/note/AiBlockGenerator.tsx` and `src/lib/generate-note.ts`: current prompt-based AI generation flow.
- `src/app/api/notes/[id]/route.ts`: authenticated public-link access and owner-scoped note updates.
- `src/app/api/pdf/route.ts` and `src/app/internal/pdf/note/[id]/`: PDF service integration and note rendering.
- `prisma/schema.prisma`: persisted account, folder, note, and block data model.
- `public/logo.png`: existing brand asset.
- No user research, verified testimonials, adoption metrics, or outcome benchmarks were supplied during init. Existing promotional timing claims are not verified product evidence.

## Product Principles

1. Keep varied learning material together in one mixed-content note.
2. Make captured material easy to rearrange, organize, and revisit for study.
3. Let AI assistance and export serve the learner's notebook workflow.
4. Keep publication an explicit owner choice and shared viewing read-only.
5. Preserve free entry for students and self-directed learners.
