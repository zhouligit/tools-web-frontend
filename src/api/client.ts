export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface Segment {
  start: number;
  end: number;
  text: string;
}

export interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  progress: number;
  source_url?: string;
  source_file?: string;
  language?: string;
  error_message?: string;
  full_text?: string;
  segments?: Segment[];
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, init);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "request failed");
  }
  return resp.json();
}

export function createTaskFromURL(sourceURL: string, language: string) {
  return request<Task>("/api/v1/tasks/media-to-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_url: sourceURL, language }),
  });
}

export function uploadTask(file: File, language: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  return request<Task>("/api/v1/tasks/media-to-text/upload", {
    method: "POST",
    body: form,
  });
}

export function getTask(id: string) {
  return request<Task>(`/api/v1/tasks/${id}`);
}

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
