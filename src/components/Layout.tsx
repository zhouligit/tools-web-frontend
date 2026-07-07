import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-white">
            在线工具箱
          </Link>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">
              首页
            </Link>
            <Link to="/tools/media-to-text" className="hover:text-white">
              音视频转文字
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
