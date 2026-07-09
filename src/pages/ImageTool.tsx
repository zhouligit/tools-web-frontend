import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  compressImage,
  compressionRatio,
  convertImage,
  formatFileSize,
  ImageProcessResult,
} from "../api/image";
import { OCRResult, ocrImage } from "../api/ocr";

type Tab = "convert" | "compress" | "ocr";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp";

export default function ImageTool() {
  const [tab, setTab] = useState<Tab>("convert");
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState("");
  const [resultURL, setResultURL] = useState("");
  const [result, setResult] = useState<ImageProcessResult | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [targetFormat, setTargetFormat] = useState("jpg");
  const [convertQuality, setConvertQuality] = useState(85);
  const [compressQuality, setCompressQuality] = useState(85);
  const [maxEdge, setMaxEdge] = useState(0);
  const [outputFormat, setOutputFormat] = useState("keep");
  const [ocrLang, setOcrLang] = useState("ch");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewURL("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!result?.blob) {
      setResultURL("");
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setResultURL(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const ratio = useMemo(() => {
    if (!result) return 0;
    return compressionRatio(result.originalSize, result.outputSize);
  }, [result]);

  function resetResult() {
    setResult(null);
    setOcrResult(null);
    setError("");
    setCopied(false);
  }

  function onPickFile(next: File | null) {
    resetResult();
    setFile(next);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      onPickFile(dropped);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    resetResult();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    setOcrResult(null);
    try {
      if (tab === "ocr") {
        setOcrResult(await ocrImage(file, ocrLang));
      } else {
        const data =
          tab === "convert"
            ? await convertImage(file, targetFormat, convertQuality)
            : await compressImage(file, compressQuality, maxEdge, outputFormat);
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "process failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadResult() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = resultURL;
    a.download = result.filename;
    a.click();
  }

  async function copyText() {
    if (!ocrResult?.text) return;
    await navigator.clipboard.writeText(ocrResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadText() {
    if (!ocrResult?.text || !file) return;
    const base = file.name.includes(".") ? file.name.slice(0, file.name.lastIndexOf(".")) : file.name;
    const blob = new Blob([ocrResult.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const submitLabel =
    tab === "convert" ? "开始转换" : tab === "compress" ? "开始压缩" : "开始识别";

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">图片处理</h1>
      <p className="mb-6 text-slate-400">
        格式转换、体积压缩与文字提取。单张建议不超过 20MB；GIF 动图仅处理第一帧。
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => switchTab("convert")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "convert" ? "bg-indigo-600 text-white" : "bg-slate-800"
          }`}
        >
          格式转换
        </button>
        <button
          type="button"
          onClick={() => switchTab("compress")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "compress" ? "bg-indigo-600 text-white" : "bg-slate-800"
          }`}
        >
          压缩体积
        </button>
        <button
          type="button"
          onClick={() => switchTab("ocr")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "ocr" ? "bg-indigo-600 text-white" : "bg-slate-800"
          }`}
        >
          文字提取
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="mb-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            选择图片
          </button>
          <p className="mt-3 text-sm text-slate-400">或拖拽图片到此处</p>
          {file ? (
            <p className="mt-2 text-sm text-slate-300">
              {file.name} · {formatFileSize(file.size)}
            </p>
          ) : null}
        </div>

        {tab === "convert" ? (
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-400">
              转换为
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1"
              >
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </label>
            {targetFormat !== "png" ? (
              <label className="block text-sm text-slate-400">
                质量 {convertQuality}
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={convertQuality}
                  onChange={(e) => setConvertQuality(Number(e.target.value))}
                  className="ml-2 w-40 align-middle"
                />
              </label>
            ) : (
              <p className="text-sm text-slate-500">PNG 为无损格式，不使用质量参数</p>
            )}
          </div>
        ) : null}

        {tab === "compress" ? (
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-400">
              质量 {compressQuality}
              <input
                type="range"
                min={10}
                max={100}
                value={compressQuality}
                onChange={(e) => setCompressQuality(Number(e.target.value))}
                className="mt-2 block w-full"
              />
            </label>
            <label className="block text-sm text-slate-400">
              最大边长
              <select
                value={maxEdge}
                onChange={(e) => setMaxEdge(Number(e.target.value))}
                className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1"
              >
                <option value={0}>不限制</option>
                <option value={1920}>1920 px</option>
                <option value={1280}>1280 px</option>
                <option value={1024}>1024 px</option>
              </select>
            </label>
            <label className="block text-sm text-slate-400 md:col-span-2">
              输出格式
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1"
              >
                <option value="keep">保持原格式</option>
                <option value="webp">转为 WebP</option>
              </select>
            </label>
          </div>
        ) : null}

        {tab === "ocr" ? (
          <div className="mb-4">
            <label className="block text-sm text-slate-400">
              识别语言
              <select
                value={ocrLang}
                onChange={(e) => setOcrLang(e.target.value)}
                className="ml-2 rounded border border-slate-700 bg-slate-950 px-2 py-1"
              >
                <option value="ch">中文 / 中英混合</option>
                <option value="en">英文</option>
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-500">
              适合截图、扫描件、海报等印刷体文字；手写体与复杂背景准确率可能下降。
            </p>
          </div>
        ) : null}

        {tab === "convert" && targetFormat === "jpg" ? (
          <p className="mb-4 text-xs text-slate-500">
            透明 PNG 转 JPG 时，透明区域将变为白色背景。
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!file || loading}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "处理中..." : submitLabel}
        </button>
      </form>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      ) : null}

      {tab === "ocr" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">原图</h3>
            {previewURL ? (
              <img src={previewURL} alt="original" className="max-h-80 w-full object-contain" />
            ) : (
              <p className="text-sm text-slate-500">上传图片后预览将显示在这里</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">识别结果</h3>
            {ocrResult ? (
              <>
                <textarea
                  readOnly
                  value={ocrResult.text || "（未识别到文字）"}
                  className="h-48 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200"
                />
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-400">
                  <span>{ocrResult.line_count} 行</span>
                  <span>·</span>
                  <span>{ocrResult.duration_ms} ms</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyText}
                    disabled={!ocrResult.text}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {copied ? "已复制" : "复制文本"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadText}
                    disabled={!ocrResult.text}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 disabled:opacity-50"
                  >
                    下载 .txt
                  </button>
                </div>
                {ocrResult.lines.length > 0 ? (
                  <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-400">
                      <thead className="sticky top-0 bg-slate-900">
                        <tr>
                          <th className="p-2">文本</th>
                          <th className="p-2">置信度</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocrResult.lines.map((line, idx) => (
                          <tr key={idx} className="border-t border-slate-800">
                            <td className="p-2 text-slate-300">{line.text}</td>
                            <td className="p-2">{Math.round(line.confidence * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-500">识别文字将显示在这里</p>
            )}
          </div>
        </div>
      ) : (previewURL || resultURL) ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">原图</h3>
            {previewURL ? (
              <img src={previewURL} alt="original" className="max-h-80 w-full object-contain" />
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">结果</h3>
            {resultURL ? (
              <>
                <img src={resultURL} alt="result" className="max-h-80 w-full object-contain" />
                {result ? (
                  <div className="mt-3 space-y-2 text-sm text-slate-400">
                    <p>
                      {formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)}
                      {ratio > 0 ? `（-${ratio}%）` : null}
                    </p>
                    <button
                      type="button"
                      onClick={downloadResult}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                    >
                      下载 {result.filename}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-500">处理后预览将显示在这里</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
