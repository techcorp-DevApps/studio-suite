import { BrowserRouter, Route, Routes } from "react-router-dom";

import Landing from "@/pages/Landing";
import { Login, Portal } from "@/pages/Portal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/studio" element={<Portal role="studio" />} />
        <Route path="/client" element={<Portal role="client" />} />
      </Routes>
    </BrowserRouter>
  );
}
