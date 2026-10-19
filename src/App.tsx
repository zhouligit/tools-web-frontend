import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import ImageTool from "./pages/ImageTool";
import Login from "./pages/Login";
import MediaToText from "./pages/MediaToText";
import RandomStats from "./pages/RandomStats";
import Register from "./pages/Register";
import ReportCreate from "./pages/report/ReportCreate";
import ReportView from "./pages/report/ReportView";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 公开：微信扫码看报告 */}
          <Route path="/r/:id" element={<ReportView />} />

          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<Home />} />
              <Route path="/tools/media-to-text" element={<MediaToText />} />
              <Route path="/tools/image" element={<ImageTool />} />
              <Route path="/tools/random-stats" element={<RandomStats />} />
            </Route>
          </Route>

          {/* 独立视觉，仍需登录 */}
          <Route element={<RequireAuth />}>
            <Route path="/report" element={<ReportCreate />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
