import {
  REJECT_COPY,
  UPLOAD_LIMITS,
  type FileRejection,
} from "@/types/file";

export function fileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export function isAcceptedType(name: string): boolean {
  const extension = fileExtension(name);
  return (UPLOAD_LIMITS.acceptedExtensions as readonly string[]).includes(
    extension,
  );
}

export function validateIncomingFiles(
  incoming: File[],
  currentCount: number,
): { accepted: File[]; rejections: FileRejection[] } {
  const accepted: File[] = [];
  const rejections: FileRejection[] = [];
  let remaining = UPLOAD_LIMITS.maxFiles - currentCount;

  incoming.forEach((file, index) => {
    const id = `reject-${Date.now()}-${index}`;

    if (remaining <= 0) {
      rejections.push({ id, name: file.name, reason: REJECT_COPY.count });
      return;
    }

    if (!isAcceptedType(file.name)) {
      rejections.push({ id, name: file.name, reason: REJECT_COPY.type });
      return;
    }

    if (file.size > UPLOAD_LIMITS.maxFileSizeBytes) {
      rejections.push({ id, name: file.name, reason: REJECT_COPY.size });
      return;
    }

    accepted.push(file);
    remaining -= 1;
  });

  return { accepted, rejections };
}
