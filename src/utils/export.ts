import { Segment } from "../api/client";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function formatSRTTime(sec: number) {
  const totalMs = Math.max(0, Math.floor(sec * 1000));
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(ms)}`;
}

export function segmentsToSRT(segments: Segment[]) {
  return segments
    .map((seg, idx) => {
      const text = seg.text.trim();
      if (!text) return "";
      return `${idx + 1}\n${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}\n${text}\n`;
    })
    .filter(Boolean)
    .join("\n");
}

export function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const STAGE_LABELS: Record<string, string> = {
  queued: "排队中",
  downloading: "下载媒体",
  loading_upload: "读取文件",
  probing: "分析音轨",
  extracting_audio: "提取音频（视频仅保留语音）",
  transcribing: "语音转写中（CPU 较慢，请耐心等待）",
  completed: "完成",
  failed: "失败",
};
