export interface ImageProcessResult {
  blob: Blob;
  originalSize: number;
  outputSize: number;
  filename: string;
}

async function postImage(
  path: string,
  file: File,
  fields: Record<string, string>,
): Promise<ImageProcessResult> {
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  const resp = await fetch(`${import.meta.env.VITE_API_BASE ?? ""}${path}`, {
    method: "POST",
    body: form,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "request failed");
  }

  const originalSize = Number(resp.headers.get("X-Original-Size") || file.size);
  const outputSize = Number(resp.headers.get("X-Output-Size") || 0);
  const disposition = resp.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename=\"?([^\";]+)/);
  const filename = match?.[1] || "image.out";

  const blob = await resp.blob();
  return {
    blob,
    originalSize,
    outputSize: outputSize || blob.size,
    filename,
  };
}

export function convertImage(file: File, format: string, quality: number) {
  return postImage("/api/v1/tools/image/convert", file, {
    format,
    quality: String(quality),
  });
}

export function compressImage(
  file: File,
  quality: number,
  maxEdge: number,
  outputFormat: string,
) {
  return postImage("/api/v1/tools/image/compress", file, {
    quality: String(quality),
    max_edge: String(maxEdge),
    output_format: outputFormat,
  });
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function compressionRatio(before: number, after: number) {
  if (before <= 0) return 0;
  return Math.round((1 - after / before) * 100);
}
