export type SourceId =
  | "gutenberg"
  | "internet_archive"
  | "open_library"
  | "opds"
  | "scrape"
  | "user";

export type BookResult = {
  id: string;
  source: SourceId;
  title: string;
  authors: string[];
  year?: number;
  cover?: string;
  pdfUrl?: string;
  readUrl?: string;
};
