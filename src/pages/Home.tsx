import { Link } from "react-router-dom";

const tools = [
  {
    title: "视频 / 音频转文字",
    desc: "上传 mp4 等视频或音频文件，自动提取语音并转成带时间轴的文本。",
    path: "/tools/media-to-text",
    tag: "ASR",
  },
  {
    title: "图片处理",
    desc: "格式转换、体积压缩与图片文字提取（OCR），即传即得。",
    path: "/tools/image",
    tag: "Image",
  },
  {
    title: "随机数生成",
    desc: "已知最大值、最小值、标准差，随机生成 250 个数字。",
    path: "/tools/random-stats",
    tag: "Math",
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
