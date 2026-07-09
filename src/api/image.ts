export interface ImageProcessResult {
  blob: Blob;
  originalSize: number;
  outputSize: number;
  filename: string;
}

function parseContentDisposition(disposition: string, fallback: string): string {
  const star = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      // ignore malformed encoding
    }
  }

  const quoted = disposition.match(/filename="([^"]+)"/i);
  if (quoted?.[1] && /^[\x20-\x7E]+$/.test(quoted[1])) {
    return quoted[1];
  }

  return fallback;
}

function outputFilenameFromOriginal(originalName: string, contentType: string): string {
  const extByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = extByType[contentType] || "out";
  const dot = originalName.lastIndexOf(".");
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  return `${base}.${ext}`;
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
  const contentType = resp.headers.get("Content-Type") || "";
  const filename = parseContentDisposition(
    disposition,
    outputFilenameFromOriginal(file.name, contentType),
  );

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
