import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Props = {
  /** report 页浅色背景时用 light */
  variant?: "dark" | "light";
};

export default function UserMenu({ variant = "dark" }: Props) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <span className="flex gap-3 text-sm">
        <Link
          to="/login"
          className={variant === "dark" ? "text-slate-300 hover:text-white" : "text-stone-600 hover:text-stone-900"}
        >
          登录
        </Link>
        <Link
          to="/register"
          className={
            variant === "dark"
              ? "text-indigo-300 hover:text-indigo-200"
              : "text-stone-800 underline-offset-2 hover:underline"
          }
        >
          注册
        </Link>
      </span>
    );
  }

  async function onLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  const nameClass =
    variant === "dark" ? "text-slate-400" : "text-stone-500";
  const btnClass =
    variant === "dark"
      ? "rounded border border-slate-600 px-2.5 py-1 text-slate-200 hover:border-slate-400 hover:text-white disabled:opacity-50"
      : "rounded border border-stone-300 bg-white px-2.5 py-1 text-stone-700 hover:bg-stone-50 disabled:opacity-50";

  return (
    <span className="flex items-center gap-3 text-sm">
      <span className={nameClass}>{user.username}</span>
      <button type="button" onClick={onLogout} disabled={busy} className={btnClass}>
        {busy ? "退出中…" : "退出登录"}
      </button>
    </span>
  );
}
