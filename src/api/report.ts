import { apiJSON } from "./http";

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

export function createReport(payload: CreateReportPayload) {
  return apiJSON<Report>("/api/v1/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getReport(id: string) {
  return apiJSON<Report>(`/api/v1/reports/${id}`);
}

/** 二维码/公开链接优先用 VITE_PUBLIC_ORIGIN（如 http://106.13.115.166:18082） */
export function reportPublicURL(id: string) {
  const configured = (import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined)?.replace(
    /\/$/,
    "",
  );
  const origin = configured || window.location.origin;
  return `${origin}/r/${id}`;
}
