import { BrowserRouter, Route, Routes } from "react-router-dom";

import Landing from "@/pages/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public, no-auth marketing entry point. Auth-gated studio and client
            portals are added in later, separately-gated tasks. */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
