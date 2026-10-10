import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ImageTool from "./pages/ImageTool";
import MediaToText from "./pages/MediaToText";
import RandomStats from "./pages/RandomStats";
import ReportCreate from "./pages/report/ReportCreate";
import ReportView from "./pages/report/ReportView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/report" element={<ReportCreate />} />
        <Route path="/r/:id" element={<ReportView />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools/media-to-text" element={<MediaToText />} />
          <Route path="/tools/image" element={<ImageTool />} />
          <Route path="/tools/random-stats" element={<RandomStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
