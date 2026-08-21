import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  IdCard,
  QrCode,
  Wallet,
  LogOut,
} from "lucide-react";
import { getArtisanMe } from "../../api/client";
import { clearArtisanToken, getArtisanToken } from "../../utils/artisanAuth";

const navItems = [
  { to: "/artisan/home", label: "Home", icon: Home, end: true },
  { to: "/artisan/products", label: "My Products", icon: Package },
  { to: "/artisan/create", label: "Create Passport", icon: IdCard },
  { to: "/artisan/qr", label: "My QR Code", icon: QrCode },
  { to: "/artisan/earnings", label: "My Earnings", icon: Wallet },
];

export default function ArtisanPortalLayout() {
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getArtisanToken();
    if (!token) {
      navigate("/artisan", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await getArtisanMe(token);
        if (!cancelled) setArtisan(me);
      } catch {
        clearArtisanToken();
        if (!cancelled) navigate("/artisan", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleLogout() {
    clearArtisanToken();
    navigate("/artisan", { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3E9] flex items-center justify-center text-[#3E5641] text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420] flex flex-col">
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#2B2420]/10 sticky top-0 bg-[#FAF3E9] z-20">
        <Link to="/artisan/home" className="text-2xl font-bold text-[#3E5641]">
          Karigar
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-[#3E5641] text-[#3E5641] font-semibold text-base hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 pb-28 max-w-3xl w-full mx-auto">
        <Outlet context={{ artisan, setArtisan }} />
      </main>

      <nav
        className="fixed bottom-0 inset-x-0 bg-[#FAF3E9] border-t border-[#2B2420]/15 z-30"
        aria-label="Artisan portal"
      >
        <div className="max-w-3xl mx-auto grid grid-cols-5 gap-1 px-1 py-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-h-[4.25rem] rounded-2xl px-1 py-2 text-center transition-colors ${
                  isActive
                    ? "bg-[#3E5641] text-[#FAF3E9]"
                    : "text-[#2B2420]/80 hover:bg-[#3E5641]/10"
                }`
              }
            >
              <Icon className="w-6 h-6" strokeWidth={2.25} />
              <span className="text-[10px] sm:text-xs font-semibold leading-tight px-0.5">
                {label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
