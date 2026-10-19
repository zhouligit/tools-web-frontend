import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "在线工具箱";
  }, []);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-white">
            在线工具箱
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {user && (
              <>
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
              </>
            )}
            {!loading && user && (
              <span className="flex items-center gap-3 border-l border-slate-700 pl-4">
                <span className="text-slate-400">{user.username}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="hover:text-white"
                >
                  退出
                </button>
              </span>
            )}
            {!loading && !user && (
              <span className="flex gap-3">
                <Link to="/login" className="hover:text-white">
                  登录
                </Link>
                <Link to="/register" className="text-indigo-300 hover:text-indigo-200">
                  注册
                </Link>
              </span>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
