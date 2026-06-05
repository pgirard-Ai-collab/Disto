-- Add pdf_paths column to support multi-file uploads.
-- pdf_path (single) is kept for backwards compatibility with existing jobs.
ALTER TABLE ingestion_jobs
  ADD COLUMN IF NOT EXISTS pdf_paths jsonb NOT NULL DEFAULT '[]'::jsonb;
