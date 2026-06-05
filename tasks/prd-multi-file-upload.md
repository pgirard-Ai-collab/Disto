# PRD: Multi-File Upload in Pipeline

## Introduction

Replace the current single-file upload step in the import pipeline with a multi-file upload experience that supports 2–10 PDF files at once. All selected files are uploaded together and processed as a single batch job, resulting in one merged brand structure.

The current pipeline accepts one PDF and runs it through 4 sequential steps: upload → extract → LLM structuring → save. This feature expands the upload step to accept multiple PDFs, concatenates their extracted text, and runs the unified content through the same LLM and save steps.

---

## Goals

- Allow users to select 2–10 PDF files in a single upload session
- Support drag-and-drop and file picker for multiple files
- Display all selected files with individual size and remove controls
- Process all files as one batch (one ingestion job, one brand structure output)
- Keep the existing pipeline step display intact — only the upload step UI changes
- Store all PDF paths in the ingestion job record

---

## User Stories

### US-001: Replace single-file input with multi-file drop zone
**Description:** As an agency user, I want to drag-and-drop or select multiple PDFs at once so I don't have to restart the pipeline for each file.

**Acceptance Criteria:**
- [ ] Drop zone accepts multiple files simultaneously (drag-and-drop)
- [ ] File picker input has `multiple` attribute set
- [ ] Existing single-file state (`file: File | null`) replaced with `files: File[]`
- [ ] Typecheck passes

### US-002: Display file list with per-file remove control
**Description:** As an agency user, I want to see all selected files listed with their names and sizes, and be able to remove individual files before launching.

**Acceptance Criteria:**
- [ ] Each selected file is shown as a row: PDF icon · filename · size · remove button
- [ ] Removing a file updates the list without resetting the others
- [ ] When no files remain, the drop zone returns to its empty state
- [ ] List is scrollable if it overflows (max ~4 visible rows before scroll)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Enforce per-file and batch validation
**Description:** As an agency user, I want clear error messages if I add invalid files so I know what to fix before launching.

**Acceptance Criteria:**
- [ ] Each file must be `application/pdf`; non-PDFs are rejected with an inline error
- [ ] Each file must be ≤ 50 MB; oversized files are rejected with an inline error
- [ ] Total batch is capped at 10 files; adding more shows an error and ignores the excess
- [ ] Validation runs on drop and on file picker change
- [ ] Valid files already in the list are unaffected when a new invalid file is rejected
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Update `/api/ingest` to accept multiple files
**Description:** As a developer, I need the ingest API route to receive multiple PDFs and upload them all to Supabase Storage.

**Acceptance Criteria:**
- [ ] `FormData` field changed from `file` (single) to `files` (array, up to 10 entries)
- [ ] Each file is uploaded to `disto-deliverables` bucket at `{clientSlug}/{timestamp}_{sanitizedFilename}`
- [ ] `ingestion_jobs` table stores all paths (see US-005 for schema change)
- [ ] Upload step marks done only after all files are stored successfully
- [ ] Upload step `meta` shows e.g. `"3 fichiers · 4.2 Mo total"`
- [ ] If any file upload fails, the job is marked `error` and remaining uploads are aborted
- [ ] Typecheck passes

### US-005: Extend `ingestion_jobs` schema for multiple PDF paths
**Description:** As a developer, I need the database to store an array of PDF paths so all uploaded files are tracked.

**Acceptance Criteria:**
- [ ] Add column `pdf_paths jsonb` (array of strings) to `ingestion_jobs`
- [ ] Existing `pdf_path text` column kept for backwards compatibility (nullable)
- [ ] Migration runs cleanly against local Supabase (`supabase db reset` passes)
- [ ] API route writes to `pdf_paths`; existing code reading `pdf_path` still compiles
- [ ] Typecheck passes

### US-006: Concatenate extracted text from all PDFs before LLM step
**Description:** As a developer, I need the extract step to process all uploaded PDFs and merge their text so the LLM receives a unified input.

**Acceptance Criteria:**
- [ ] Extract step downloads each PDF from storage and runs `PDFParse` on each
- [ ] Extracted texts are concatenated in upload order, separated by a clear delimiter (e.g. `\n\n--- [filename] ---\n\n`)
- [ ] Vision fallback triggers if any single file has < 500 words — when triggered, the entire batch switches to vision mode (all files sent as base64)
- [ ] Extract step `meta` shows e.g. `"3 fichiers · 5 847 mots extraits"`
- [ ] Typecheck passes

### US-007: Update `ImportPanel` to send multiple files to the API
**Description:** As a developer, I need the client-side panel to build a multi-file `FormData` payload and send it to the updated API route.

**Acceptance Criteria:**
- [ ] `startIngestion` appends each file from `files[]` under the key `files`
- [ ] Launch button disabled until at least 1 valid file is selected
- [ ] Launch button label: `"Lancer"` for 1 file, `"Lancer (N fichiers)"` for N > 1
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- **FR-1:** The upload drop zone must accept multiple files via drag-and-drop and `<input multiple>`.
- **FR-2:** Selected files are displayed as a list; each row shows PDF icon, filename, formatted size, and a remove button.
- **FR-3:** Validation rules per file: `application/pdf` only, max 50 MB. Batch cap: 10 files.
- **FR-4:** The `ingestion_jobs` table gains a `pdf_paths jsonb` column; the existing `pdf_path` column is preserved but no longer the primary write target.
- **FR-5:** The `/api/ingest` route accepts `FormData` with multiple `files` entries (up to 10).
- **FR-6:** Each PDF is uploaded independently to Supabase Storage; all paths are stored in `pdf_paths`.
- **FR-7:** The extract step runs `PDFParse` on each PDF in order and concatenates the results with a filename delimiter.
- **FR-8:** Vision fallback applies to the entire batch if any single PDF has < 500 words after extraction. When in vision mode, all files are sent as base64 document blocks.
- **FR-9:** The LLM and save steps are unchanged — they receive the same merged text string as before.
- **FR-10:** Upload step `meta` reports file count and total size; extract step `meta` reports file count and word count.
- **FR-11:** If any individual file upload fails, the entire job is aborted and marked `error`.
- **FR-12:** The launch button is disabled with no files selected; shows file count in label when N > 1.

---

## Non-Goals

- No parallel/concurrent LLM calls per file (all files → one LLM call)
- No per-file progress tracking within the upload step (one step covers all files)
- No file reordering UI
- No support for file types other than PDF
- No batch size > 10 files
- No resumable uploads or chunked transfer

---

## Design Considerations

- The drop zone replaces the current single-file area in `ImportPanel.tsx`. All layout and color tokens stay the same (`C.*` values, dashed border, drag highlight).
- The file list appears below the drop zone (or replaces the single-file display area). Use the same PDF icon currently used for single-file display.
- Remove buttons on each row: small ghost `Btn` (`variant="ghost"`, `size="sm"`) with an `×` label.
- The existing mode dialog (Replace vs. New Version) is triggered the same way — after file selection, on launch click.
- Refer to `design/screens/` for any visual references on the upload zone.

---

## Technical Considerations

- **`ImportPanel.tsx`**: Replace `file: File | null` state with `files: File[]`. Update all references.
- **`/api/ingest/route.ts`**: Change `formData.get('file')` to `formData.getAll('files')`. Loop uploads. Concatenate extracted texts.
- **Migration**: New file at `supabase/migrations/{timestamp}_ingestion_jobs_multi_file.sql`. Add `pdf_paths jsonb DEFAULT '[]'`.
- **Storage path**: Same pattern as today — `{clientSlug}/{Date.now()}_{sanitizedFilename}` — one path per file.
- **Text concatenation delimiter**: `\n\n--- {originalFilename} ---\n\n` between files.
- **Vision fallback**: Check `combinedText.split(/\s+/).length < 500` after concatenation. If any single file triggers vision mode, use vision mode for the entire batch.
- **Text pruning**: Do not hard-truncate at 100k characters. Instead, prune content intelligently (e.g. remove redundant whitespace, repeated boilerplate) to stay within the model's context window without arbitrary cutoffs.
- **Backwards compatibility**: Existing jobs with only `pdf_path` set will still render correctly because no UI reads `pdf_paths` for display yet.

---

## Success Metrics

- User can upload 2–5 PDFs in a single pipeline run with no errors
- Single-file upload still works identically (no regression)
- `ingestion_jobs.pdf_paths` contains the correct array of storage paths after a multi-file job
- Extracted text from all files reaches the LLM step as one merged string

---

## Open Questions

_All questions resolved._

| Question | Decision |
|---|---|
| Text length limit across multiple files | No hard truncation — prune intelligently to fit context window |
| File concatenation order | Upload order (order files appear in the list), not alphabetical |
| Vision fallback scope | If any one file triggers vision mode, apply vision mode to the entire batch |
