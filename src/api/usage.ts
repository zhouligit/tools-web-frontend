const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function getToolUsage(toolKey: string): Promise<number> {
  const resp = await fetch(`${API_BASE}/api/v1/tools/${encodeURIComponent(toolKey)}/usage`);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "failed to get usage");
  }
  const data = await resp.json();
  return Number(data.count) || 0;
}

export async function incrementToolUsage(toolKey: string): Promise<number> {
  const resp = await fetch(`${API_BASE}/api/v1/tools/${encodeURIComponent(toolKey)}/usage`, {
    method: "POST",
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "failed to increment usage");
  }
  const data = await resp.json();
  return Number(data.count) || 0;
}
