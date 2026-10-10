import { FormEvent, useMemo, useState } from "react";
import {
  generateWithMinMaxStd,
  maxAchievableStd,
  statsOf,
} from "../utils/randomStats";

const COUNT = 250;

export default function RandomStats() {
  const [minStr, setMinStr] = useState("0");
  const [maxStr, setMaxStr] = useState("100");
  const [stdStr, setStdStr] = useState("15");
  const [decimals, setDecimals] = useState(2);
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const previewMaxStd = useMemo(() => {
    const min = Number(minStr);
    const max = Number(maxStr);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
    return maxAchievableStd(COUNT, min, max);
  }, [minStr, maxStr]);

  const actual = useMemo(
    () => (numbers ? statsOf(numbers) : null),
    [numbers],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCopied(false);
    const min = Number(minStr);
    const max = Number(maxStr);
    const std = Number(stdStr);
    if (![min, max, std].every(Number.isFinite)) {
      setError("请输入有效数字");
      return;
    }
    try {
      const arr = generateWithMinMaxStd(COUNT, min, max, std);
      const rounded = arr.map((x) => Number(x.toFixed(decimals)));
      // 四舍五入后微调保证仍含 min/max（若精度允许）
      const rMin = Number(min.toFixed(decimals));
      const rMax = Number(max.toFixed(decimals));
      if (!rounded.includes(rMin)) rounded[0] = rMin;
      if (!rounded.includes(rMax)) rounded[1] = rMax;
      setNumbers(rounded);
    } catch (err) {
      setNumbers(null);
      setError(err instanceof Error ? err.message : "生成失败");
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const textBlock = numbers?.join("\n") ?? "";
  const csvBlock = numbers?.join(",") ?? "";

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">随机数生成</h1>
      <p className="mb-8 text-slate-400">
        已知最大值、最小值、标准差，随机生成 {COUNT} 个数字（均值取区间中点）。
      </p>

      <form
        onSubmit={onSubmit}
        className="mb-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-2"
      >
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">最小值</span>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={minStr}
            onChange={(e) => setMinStr(e.target.value)}
            inputMode="decimal"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">最大值</span>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={maxStr}
            onChange={(e) => setMaxStr(e.target.value)}
            inputMode="decimal"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">标准差</span>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={stdStr}
            onChange={(e) => setStdStr(e.target.value)}
            inputMode="decimal"
            required
          />
          {previewMaxStd != null && (
            <span className="mt-1 block text-xs text-slate-500">
              当前区间可达最大标准差约 {previewMaxStd.toFixed(4)}
            </span>
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">小数位数</span>
          <input
            type="number"
            min={0}
            max={10}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
          />
        </label>

        {error && (
          <p className="md:col-span-2 rounded border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="md:col-span-2 rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          生成 {COUNT} 个随机数
        </button>
      </form>

      {numbers && actual && (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm sm:grid-cols-4">
            <Stat label="实际最小值" value={actual.min} />
            <Stat label="实际最大值" value={actual.max} />
            <Stat label="实际均值" value={actual.mean} />
            <Stat label="实际标准差" value={actual.std} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(textBlock)}
              className="rounded border border-slate-700 px-3 py-1.5 text-sm hover:border-indigo-500"
            >
              {copied ? "已复制" : "复制（每行一个）"}
            </button>
            <button
              type="button"
              onClick={() => copyText(csvBlock)}
              className="rounded border border-slate-700 px-3 py-1.5 text-sm hover:border-indigo-500"
            >
              复制 CSV
            </button>
            <span className="self-center text-xs text-slate-500">
              共 {numbers.length} 个
            </span>
          </div>

          <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
            {textBlock}
          </pre>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className="font-mono text-slate-100">{value.toFixed(6)}</div>
    </div>
  );
}
