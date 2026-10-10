import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReport, Report } from "../../api/report";

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prev = document.title;
    document.title = "\u200b";
    return () => {
      document.title = prev;
    };
  }, []);

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
      <div className="report-view report-view-page">
        <p className="report-view-status">加载中…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-view report-view-page">
        <p className="report-view-status">{error || "报告不存在"}</p>
      </div>
    );
  }

  const conclusions = pad3(report.conclusions);
  const explanations = pad3(report.conclusion_explanations);

  return (
    <div className="report-view report-view-page">
      <div className="report-view-inner">
        <p className="report-view-notice">
          该报告主要信息已上传至市住建委“北京市城镇房屋建筑使用
          <br />
          安全管理系统”
        </p>
        <table className="report-view-table">
          <tbody>
            <Row label="报告类型" value={report.report_type} />
            <Row label="报告唯一编码" value={report.report_code} />
            <Row label="机构备案编号" value={report.org_filing_no} />
            <Row label="鉴定机构" value={report.appraisal_org} />
            <Row label="项目名称" value={report.project_name} />
            <Row label="房屋建筑地址" value={report.building_address} />
            <MultiRow
              label="评估鉴定结论"
              items={conclusions.map((v, i) =>
                formatSlot(`鉴定结论${i + 1}`, v),
              )}
            />
            <MultiRow
              label="评估鉴定结论解释"
              items={explanations.map((v, i) =>
                formatSlot(`结论解释${i + 1}`, v),
              )}
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

/** 与样例一致：鉴定结论1): Asu级 */
function formatSlot(label: string, value: string) {
  return value ? `${label}): ${value}` : `${label}):`;
}

/** 左边栏一行最多四个字 */
function formatLabelLines(label: string) {
  const chars = Array.from(label);
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += 4) {
    lines.push(chars.slice(i, i + 4).join(""));
  }
  return lines;
}

function LabelCell({ label }: { label: string }) {
  return (
    <th>
      {formatLabelLines(label).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </th>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <LabelCell label={label} />
      <td>{value || "\u00A0"}</td>
    </tr>
  );
}

function MultiRow({ label, items }: { label: string; items: string[] }) {
  return (
    <tr>
      <LabelCell label={label} />
      <td>
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </td>
    </tr>
  );
}
