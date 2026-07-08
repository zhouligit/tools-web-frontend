import { FormEvent, useEffect, useRef, useState } from "react";
import {
  createTaskFromURL,
  formatTime,
  getTask,
  Task,
  uploadTask,
} from "../api/client";

export default function MediaToText() {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setURL] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("zh");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function pollTask(taskID: string) {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(async () => {
      try {
        const latest = await getTask(taskID);
        setTask(latest);
        if (latest.status === "completed" || latest.status === "failed") {
          window.clearInterval(timerRef.current);
          setLoading(false);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "poll failed");
        setLoading(false);
        window.clearInterval(timerRef.current);
      }
    }, 2000);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTask(null);
    try {
      const created =
        mode === "url"
          ? await createTaskFromURL(url.trim(), language)
          : await uploadTask(file!, language);
      setTask(created);
      pollTask(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "submit failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">音视频转文字</h1>
      <p className="mb-6 text-slate-400">
        支持 mp4 / mp3 / wav 等格式，或粘贴公网视频链接（需服务器安装 yt-dlp）。
      </p>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`rounded-lg px-4 py-2 text-sm ${
            mode === "upload" ? "bg-indigo-600 text-white" : "bg-slate-800"
          }`}
        >
          本地文件
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-lg px-4 py-2 text-sm ${
            mode === "url" ? "bg-indigo-600 text-white" : "bg-slate-800"
          }`}
        >
          粘贴链接
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        {mode === "upload" ? (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              选择文件
            </button>
            <p className="mt-3 text-sm text-slate-400">
              {file ? (
                <>
                  已选择：<span className="text-slate-200">{file.name}</span>
                  <span className="ml-2 text-slate-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </>
              ) : (
                "支持 mp3 / mp4 / wav 等，选好后点击「开始转写」"
              )}
            </p>
          </div>
        ) : (
          <input
            value={url}
            onChange={(e) => setURL(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        )}

        <label className="mb-4 block text-sm text-slate-400">
          语言
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="auto">自动</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading || (mode === "upload" ? !file : !url.trim())}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "处理中..." : "开始转写"}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {task && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span>任务 ID: {task.id}</span>
            <span className="rounded bg-slate-800 px-2 py-1">{task.status}</span>
          </div>
          {task.status === "processing" || task.status === "pending" ? (
            <div className="mb-4">
              <div className="mb-1 text-sm text-slate-400">进度 {task.progress}%</div>
              <div className="h-2 overflow-hidden rounded bg-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ) : null}
          {task.status === "failed" && (
            <p className="text-red-300">{task.error_message}</p>
          )}
          {task.status === "completed" && (
            <>
              <h3 className="mb-2 font-semibold">全文</h3>
              <pre className="mb-6 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-7">
                {task.full_text}
              </pre>
              {task.segments && task.segments.length > 0 && (
                <>
                  <h3 className="mb-2 font-semibold">分段（带时间轴）</h3>
                  <div className="space-y-2">
                    {task.segments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-slate-950 px-4 py-3 text-sm"
                      >
                        <span className="mr-3 text-indigo-300">
                          [{formatTime(seg.start)} - {formatTime(seg.end)}]
                        </span>
                        {seg.text}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
