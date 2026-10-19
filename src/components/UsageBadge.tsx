import { useEffect, useState } from "react";
import { getToolUsage, incrementToolUsage } from "../api/usage";

export function useToolUsage(toolKey: string) {
  const [useCount, setUseCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const count = await getToolUsage(toolKey);
        if (!cancelled) setUseCount(count);
      } catch {
        if (!cancelled) setUseCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toolKey]);

  async function bump() {
    try {
      const count = await incrementToolUsage(toolKey);
      setUseCount(count);
    } catch {
      // 统计失败不影响主流程
    }
  }

  return { useCount, bump };
}

export function UsageBadge({ count }: { count: number | null }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm">
      <span className="text-slate-500">累计使用 </span>
      <span className="font-mono text-indigo-300">
        {count == null ? "—" : count.toLocaleString()}
      </span>
      <span className="text-slate-500"> 次</span>
    </div>
  );
}
