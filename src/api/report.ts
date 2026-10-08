const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export interface Report {
  id: string;
  report_type: string;
  report_code: string;
  org_filing_no: string;
  appraisal_org: string;
  project_name: string;
  building_address: string;
  conclusions: string[];
  conclusion_explanations: string[];
  person_in_charge: string;
  reviewer: string;
  approver: string;
  appraisers: string;
  created_at: string;
  updated_at: string;
}

export type CreateReportPayload = Omit<Report, "id" | "created_at" | "updated_at">;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, init);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "request failed");
  }
  return resp.json();
}

export function createReport(payload: CreateReportPayload) {
  return request<Report>("/api/v1/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getReport(id: string) {
  return request<Report>(`/api/v1/reports/${id}`);
}

export function reportPublicURL(id: string) {
  return `${window.location.origin}/r/${id}`;
}
