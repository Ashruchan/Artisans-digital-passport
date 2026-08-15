import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing_page";
import ArtisanPage from "./pages/artisan_page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/artisan" element={<ArtisanPage />} />
        {/* Teammates add their routes below, e.g.: */}
        {/* <Route path="/cooperative" element={<CooperativeLogin />} /> */}
        {/* <Route path="/verify" element={<VerifyPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;