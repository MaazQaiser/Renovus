export type UploadStatus =
  | "pending"
  | "uploading"
  | "complete"
  | "error"
  | "restored";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  addedAt: string;
}

export interface FileRejection {
  id: string;
  name: string;
  reason: string;
}

export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 25 * 1024 * 1024,
  maxFiles: 10,
  acceptedExtensions: [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "csv",
    "ppt",
    "pptx",
    "txt",
  ],
} as const;

export const UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt";

export const REJECT_COPY = {
  type: "This file type isn’t supported. Use PDF, Word, Excel, CSV, PowerPoint, or TXT.",
  size: "Files must be 25 MB or smaller.",
  count: "You can attach up to 10 files.",
} as const;
