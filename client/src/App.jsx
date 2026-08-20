import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing_page";
import ArtisanPage from "./pages/artisan_page";
import CooperativePage from "./pages/cooperative_page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/artisan" element={<ArtisanPage />} />
        <Route path="/cooperative" element={<CooperativePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;