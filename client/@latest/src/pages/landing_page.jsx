import { Link } from "react-router-dom";
import { Hammer, Users, ScanLine } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream text-gray-800">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <span className="text-xl font-bold text-forest">Karigar</span>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <a href="#how-it-works" className="hover:text-terracotta">How it works</a>
          <a href="#verify" className="hover:text-terracotta">Verify a Product</a>
          <a href="#cooperatives" className="hover:text-terracotta">For Cooperatives</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-16">
        <h1 className="text-3xl md:text-5xl font-bold text-forest mb-4">
          Know the maker. Trust the craft.
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-10">
          A digital passport for every handmade product — verified origin,
          fair artisan pay, and authenticity you can check in seconds.
        </p>

        {/* Role buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <RoleCard
            icon={<Hammer className="w-8 h-8" />}
            title="I'm an Artisan"
            to="/artisan"
            color="bg-terracotta"
          />
          <RoleCard
            icon={<Users className="w-8 h-8" />}
            title="I'm a Cooperative"
            to="/cooperative"
            color="bg-ochre"
          />
          <RoleCard
            icon={<ScanLine className="w-8 h-8" />}
            title="Verify a Product"
            to="/verify"
            color="bg-forest"
          />
        </div>
      </section>

      {/* Explore inventory */}
      <div className="flex justify-center px-6 pb-16">
        <Link
          to="/inventory"
          className="bg-forest text-cream px-8 py-3 rounded-2xl font-semibold shadow-md hover:scale-105 transition-transform"
        >
          Explore the inventory
        </Link>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-10 text-forest">
          How it works
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto text-center">
          <Step number="1" text="Artisan creates a product profile" />
          <Step number="2" text="Cooperative verifies and approves it" />
          <Step number="3" text="A unique QR passport is generated" />
          <Step number="4" text="Buyer scans and sees the full story" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest text-cream text-center py-6 text-sm">
      </footer>
    </div>
  );
}

function RoleCard({ icon, title, to, color }) {
  return (
    <Link
      to={to}
      className={`${color} text-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-md hover:scale-105 transition-transform`}
    >
      {icon}
      <span className="font-semibold text-lg">{title}</span>
    </Link>
  );
}

function Step({ number, text }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-10 h-10 rounded-full bg-ochre text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}