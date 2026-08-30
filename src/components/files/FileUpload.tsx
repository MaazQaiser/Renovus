"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/primitives/Text";
import { fileExtension, validateIncomingFiles } from "@/lib/files/validate";
import type { FileRejection, UploadedFile } from "@/types/file";
import { FileDropzone } from "./FileDropzone";
import { FileItem } from "./FileItem";

export interface FileUploadProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

function fileId(): string {
  return `file-${Math.random().toString(36).slice(2, 10)}`;
}

export function FileUpload({ files, onChange, disabled, className }: FileUploadProps) {
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const timers = useRef<Record<string, number>>({});
  const latestRef = useRef(files);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    latestRef.current = files;
    onChangeRef.current = onChange;
  }, [files, onChange]);

  useEffect(() => {
    const active = timers.current;
    return () => {
      Object.values(active).forEach((id) => window.clearInterval(id));
    };
  }, []);

  const filesFromLatest = (map: (current: UploadedFile[]) => UploadedFile[]) => {
    const next = map(latestRef.current);
    latestRef.current = next;
    return next;
  };

  const simulate = (id: string) => {
    timers.current[id] = window.setInterval(() => {
      onChangeRef.current(
        filesFromLatest((current) =>
          current.map((file) => {
            if (file.id !== id || file.status !== "uploading") return file;
            const next = Math.min(100, file.progress + 18 + Math.random() * 16);
            if (next >= 100) {
              window.clearInterval(timers.current[id]);
              delete timers.current[id];
              return { ...file, progress: 100, status: "complete" };
            }
            return { ...file, progress: next };
          }),
        ),
      );
    }, 140);
  };

  const handleAdd = (incoming: File[]) => {
    const { accepted, rejections: nextRejections } = validateIncomingFiles(
      incoming,
      files.length,
    );
    setRejections(nextRejections);

    if (accepted.length === 0) return;

    const added: UploadedFile[] = accepted.map((file) => ({
      id: fileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExtension(file.name),
      status: "uploading",
      progress: 8,
      addedAt: new Date().toISOString(),
    }));

    const next = [...files, ...added];
    latestRef.current = next;
    onChange(next);
    added.forEach((file) => simulate(file.id));
  };

  const handleRemove = (id: string) => {
    if (timers.current[id]) {
      window.clearInterval(timers.current[id]);
      delete timers.current[id];
    }
    const next = files.filter((file) => file.id !== id);
    latestRef.current = next;
    onChange(next);
  };

  return (
    <div className={className}>
      <FileDropzone onFilesAdded={handleAdd} disabled={disabled} />

      {rejections.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1" role="alert">
          {rejections.map((rejection) => (
            <li key={rejection.id}>
              <Text size="body-sm" tone="error">
                {rejection.name}: {rejection.reason}
              </Text>
            </li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file) => (
            <li key={file.id}>
              <FileItem file={file} onRemove={handleRemove} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
