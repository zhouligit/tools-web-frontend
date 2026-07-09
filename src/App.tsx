import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ImageTool from "./pages/ImageTool";
import MediaToText from "./pages/MediaToText";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools/media-to-text" element={<MediaToText />} />
          <Route path="/tools/image" element={<ImageTool />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
