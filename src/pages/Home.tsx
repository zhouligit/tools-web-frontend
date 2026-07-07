import { Link } from "react-router-dom";

const tools = [
  {
    title: "音视频转文字",
    desc: "支持上传文件或粘贴链接，自动提取语音并转成文本。",
    path: "/tools/media-to-text",
    tag: "ASR",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">实用在线工具</h1>
      <p className="mb-8 text-slate-400">免费自建部署，数据可控。</p>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-indigo-500"
          >
            <span className="mb-2 inline-block rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
              {tool.tag}
            </span>
            <h2 className="mb-2 text-xl font-semibold">{tool.title}</h2>
            <p className="text-sm text-slate-400">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
