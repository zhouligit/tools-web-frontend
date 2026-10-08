import { FormEvent, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  createReport,
  CreateReportPayload,
  Report,
  reportPublicURL,
} from "../../api/report";

const emptyForm: CreateReportPayload = {
  report_type: "房屋综合安全性（含抗震）鉴定报告（楼房）",
  report_code: "",
  org_filing_no: "",
  appraisal_org: "",
  project_name: "",
  building_address: "",
  conclusions: ["", "", ""],
  conclusion_explanations: ["", "", ""],
  person_in_charge: "",
  reviewer: "",
  approver: "",
  appraisers: "",
};

export default function ReportCreate() {
  const [form, setForm] = useState<CreateReportPayload>(emptyForm);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const publicURL = useMemo(
    () => (report ? reportPublicURL(report.id) : ""),
    [report],
  );

  function setField<K extends keyof CreateReportPayload>(
    key: K,
    value: CreateReportPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setSlot(
    key: "conclusions" | "conclusion_explanations",
    index: number,
    value: string,
  ) {
    setForm((prev) => {
      const next = [...prev[key]];
      next[index] = value;
      return { ...prev, [key]: next };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const created = await createReport(form);
      setReport(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  function downloadQR() {
    const canvas = document.getElementById(
      "report-qr-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `report-${report?.report_code || report?.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function printQR() {
    window.print();
  }

  return (
    <div className="report-create min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-wide">鉴定报告二维码</h1>
          <span className="text-xs text-stone-500">填写后生成 · 微信扫码查看</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm print:hidden"
        >
          <Field
            label="报告类型"
            required
            value={form.report_type}
            onChange={(v) => setField("report_type", v)}
          />
          <Field
            label="报告唯一编码"
            required
            value={form.report_code}
            onChange={(v) => setField("report_code", v)}
          />
          <Field
            label="机构备案编号"
            value={form.org_filing_no}
            onChange={(v) => setField("org_filing_no", v)}
          />
          <Field
            label="鉴定机构"
            value={form.appraisal_org}
            onChange={(v) => setField("appraisal_org", v)}
          />
          <Field
            label="项目名称"
            value={form.project_name}
            onChange={(v) => setField("project_name", v)}
          />
          <Field
            label="房屋建筑地址"
            value={form.building_address}
            onChange={(v) => setField("building_address", v)}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-stone-700">评估鉴定结论</p>
            {[0, 1, 2].map((i) => (
              <Field
                key={`c-${i}`}
                label={`鉴定结论${i + 1}`}
                value={form.conclusions[i] || ""}
                onChange={(v) => setSlot("conclusions", i, v)}
              />
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-700">
              评估鉴定结论解释
            </p>
            {[0, 1, 2].map((i) => (
              <Field
                key={`e-${i}`}
                label={`结论解释${i + 1}`}
                value={form.conclusion_explanations[i] || ""}
                onChange={(v) => setSlot("conclusion_explanations", i, v)}
              />
            ))}
          </div>

          <Field
            label="鉴定负责人"
            value={form.person_in_charge}
            onChange={(v) => setField("person_in_charge", v)}
          />
          <Field
            label="审核人"
            value={form.reviewer}
            onChange={(v) => setField("reviewer", v)}
          />
          <Field
            label="批准人"
            value={form.approver}
            onChange={(v) => setField("approver", v)}
          />
          <Field
            label="鉴定人"
            value={form.appraisers}
            onChange={(v) => setField("appraisers", v)}
          />

          {error && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {loading ? "提交中…" : "生成二维码"}
          </button>
        </form>

        {report && (
          <div
            ref={printRef}
            className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm print:mt-0 print:border-0 print:shadow-none"
          >
            <h2 className="mb-4 text-center text-base font-semibold">
              报告二维码已生成
            </h2>
            <div className="flex flex-col items-center gap-4">
              <QRCodeCanvas
                id="report-qr-canvas"
                value={publicURL}
                size={220}
                level="M"
                includeMargin
              />
              <div className="w-full break-all text-center text-sm text-stone-600">
                <p className="mb-1 font-medium text-stone-800">
                  {report.report_code}
                </p>
                <p>{publicURL}</p>
              </div>
              <div className="flex gap-3 print:hidden">
                <button
                  type="button"
                  onClick={downloadQR}
                  className="rounded border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
                >
                  下载二维码
                </button>
                <button
                  type="button"
                  onClick={printQR}
                  className="rounded border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
                >
                  打印
                </button>
                <a
                  href={publicURL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
                >
                  预览页面
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm text-stone-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input
        className="w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}
