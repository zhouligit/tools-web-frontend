import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReport, Report } from "../../api/report";

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("无效链接");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getReport(id);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="report-view flex min-h-screen items-center justify-center bg-white text-stone-500">
        加载中…
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-view flex min-h-screen items-center justify-center bg-white px-4 text-center text-stone-600">
        {error || "报告不存在"}
      </div>
    );
  }

  const conclusions = pad3(report.conclusions);
  const explanations = pad3(report.conclusion_explanations);

  return (
    <div className="report-view min-h-screen bg-white px-3 py-6 text-black">
      <div className="mx-auto max-w-xl">
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <Row label="报告类型" value={report.report_type} />
            <Row label="报告唯一编码" value={report.report_code} />
            <Row label="机构备案编号" value={report.org_filing_no} />
            <Row label="鉴定机构" value={report.appraisal_org} />
            <Row label="项目名称" value={report.project_name} />
            <Row label="房屋建筑地址" value={report.building_address} />
            <MultiRow
              label="评估鉴定结论"
              items={conclusions.map((v, i) => `鉴定结论${i + 1}）：${v}`)}
            />
            <MultiRow
              label="评估鉴定结论解释"
              items={explanations.map((v, i) => `结论解释${i + 1}）：${v}`)}
            />
            <Row label="鉴定负责人" value={report.person_in_charge} />
            <Row label="审核人" value={report.reviewer} />
            <Row label="批准人" value={report.approver} />
            <Row label="鉴定人" value={report.appraisers} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function pad3(items?: string[]) {
  const out = ["", "", ""];
  if (!items) return out;
  for (let i = 0; i < 3 && i < items.length; i++) out[i] = items[i] || "";
  return out;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="w-[38%] border border-black bg-white px-2 py-2.5 text-left font-normal align-top">
        {label}
      </th>
      <td className="border border-black px-2 py-2.5 align-top break-words">
        {value || "\u00A0"}
      </td>
    </tr>
  );
}

function MultiRow({ label, items }: { label: string; items: string[] }) {
  return (
    <tr>
      <th className="w-[38%] border border-black bg-white px-2 py-2.5 text-left font-normal align-top">
        {label}
      </th>
      <td className="border border-black px-2 py-2.5 align-top">
        {items.map((item, index) => (
          <div key={index} className="leading-relaxed">
            {item}
          </div>
        ))}
      </td>
    </tr>
  );
}
