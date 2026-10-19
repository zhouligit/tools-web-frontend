import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import UserMenu from "./UserMenu";

export default function Layout() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "在线工具箱";
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-white">
            在线工具箱
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">
              首页
            </Link>
            <Link to="/tools/media-to-text" className="hover:text-white">
              视频转文字
            </Link>
            <Link to="/tools/image" className="hover:text-white">
              图片处理
            </Link>
            <Link to="/tools/random-stats" className="hover:text-white">
              随机数
            </Link>
            <Link to="/report" className="hover:text-white">
              报告二维码
            </Link>
            <span className={user ? "border-l border-slate-700 pl-4" : ""}>
              <UserMenu variant="dark" />
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
