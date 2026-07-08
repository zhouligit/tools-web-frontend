import { FormEvent, useEffect, useRef, useState } from "react";
import {
  createTaskFromURL,
  formatTime,
  getTask,
  getTaskSRTUrl,
  Task,
  uploadTask,
} from "../api/client";
import { downloadText, segmentsToSRT, STAGE_LABELS } from "../utils/export";

const ACCEPT =
  "audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg,.mkv,.mov,.avi,.flac";

function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

export default function MediaToText() {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setURL] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("zh");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
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
    setCopied(false);
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

  async function copyFullText() {
    if (!task?.full_text) return;
    await navigator.clipboard.writeText(task.full_text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function downloadTXT() {
    if (!task?.full_text) return;
    downloadText(`transcript-${task.id.slice(0, 8)}.txt`, task.full_text);
  }

  function downloadSRT() {
    if (!task) return;
    if (task.segments && task.segments.length > 0) {
      downloadText(
        `transcript-${task.id.slice(0, 8)}.srt`,
        segmentsToSRT(task.segments),
      );
      return;
    }
    window.open(getTaskSRTUrl(task.id), "_blank");
  }

  const stageLabel =
    task?.stage && STAGE_LABELS[task.stage]
      ? STAGE_LABELS[task.stage]
      : task?.status === "pending"
        ? "等待处理"
        : "";

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">视频 / 音频转文字</h1>
      <p className="mb-6 text-slate-400">
        上传 mp4、mov 等视频或 mp3、wav 音频，自动提取语音并转成文字（含时间轴）。
        粘贴链接时需服务器已安装 yt-dlp。
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
              accept={ACCEPT}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              选择视频 / 音频
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
                "支持 mp4 / mov / mkv / mp3 / wav 等，单文件建议不超过 500MB"
              )}
            </p>
          </div>
        ) : (
          <input
            value={url}
            onChange={(e) => setURL(e.target.value)}
            placeholder="https://example.com/video.mp4 或 B 站 / YouTube 链接"
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>任务 ID: {task.id}</span>
            <div className="flex items-center gap-2">
              {task.duration_sec ? (
                <span className="text-slate-400">
                  时长 {formatDuration(task.duration_sec)}
                </span>
              ) : null}
              <span className="rounded bg-slate-800 px-2 py-1">{task.status}</span>
            </div>
          </div>
          {task.status === "processing" || task.status === "pending" ? (
            <div className="mb-4">
              {stageLabel ? (
                <div className="mb-2 text-sm text-indigo-300">{stageLabel}</div>
              ) : null}
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
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyFullText}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
                >
                  {copied ? "已复制" : "复制全文"}
                </button>
                <button
                  type="button"
                  onClick={downloadTXT}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
                >
                  下载 TXT
                </button>
                <button
                  type="button"
                  onClick={downloadSRT}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
                >
                  下载 SRT 字幕
                </button>
              </div>
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
