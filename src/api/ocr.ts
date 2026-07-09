export interface OCRLine {
  text: string;
  confidence: number;
  box: number[][];
}

export interface OCRResult {
  text: string;
  lines: OCRLine[];
  line_count: number;
  duration_ms: number;
}

export async function ocrImage(file: File, lang: string): Promise<OCRResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("lang", lang);

  const resp = await fetch(`${import.meta.env.VITE_API_BASE ?? ""}/api/v1/tools/image/ocr`, {
    method: "POST",
    body: form,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "request failed");
  }

  return resp.json();
}
