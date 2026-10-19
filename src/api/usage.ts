import { apiJSON } from "./http";

export async function getToolUsage(toolKey: string): Promise<number> {
  const data = await apiJSON<{ count: number }>(
    `/api/v1/tools/${encodeURIComponent(toolKey)}/usage`,
  );
  return Number(data.count) || 0;
}

export async function incrementToolUsage(toolKey: string): Promise<number> {
  const data = await apiJSON<{ count: number }>(
    `/api/v1/tools/${encodeURIComponent(toolKey)}/usage`,
    { method: "POST" },
  );
  return Number(data.count) || 0;
}
