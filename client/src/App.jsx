import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing_page";
import ArtisanPage from "./pages/artisan_page";
import CooperativePage from "./pages/cooperative_page";
import PassportPage from "./pages/passport_page";
import ArtisanPortalLayout from "./pages/artisan/ArtisanPortalLayout";
import ArtisanHome from "./pages/artisan/ArtisanHome";
import ArtisanProducts from "./pages/artisan/ArtisanProducts";
import ArtisanCreatePassport from "./pages/artisan/ArtisanCreatePassport";
import ArtisanQR from "./pages/artisan/ArtisanQR";
import ArtisanEarnings from "./pages/artisan/ArtisanEarnings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/artisan" element={<ArtisanPage />} />
        <Route element={<ArtisanPortalLayout />}>
          <Route path="/artisan/home" element={<ArtisanHome />} />
          <Route path="/artisan/products" element={<ArtisanProducts />} />
          <Route path="/artisan/create" element={<ArtisanCreatePassport />} />
          <Route path="/artisan/qr" element={<ArtisanQR />} />
          <Route path="/artisan/earnings" element={<ArtisanEarnings />} />
        </Route>
        <Route path="/passport/:passportId" element={<PassportPage />} />
        <Route path="/cooperative" element={<CooperativePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
