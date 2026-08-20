import { Link } from "react-router-dom";
import { Hammer, ScanLine } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="text-2xl font-bold" aria-label="Karigar home">
          <span className="text-[#3E5641]">Karigar</span>
        </Link>
        <a
          href="#how-it-works"
          className="text-base font-medium hover:text-[#C1613C] transition-colors"
        >
          How it works
        </a>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-12 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-5 text-[#3E5641]">
          Know who made it. Trust what you buy.
        </h1>
        <p className="text-lg md:text-xl text-[#2B2420] max-w-xl mx-auto mb-12 opacity-90">
          See who made a handmade product and whether it is real.
        </p>

        <div className="flex flex-col items-center justify-center gap-5 max-w-md mx-auto">
          <Link
            to="/artisan"
            className="w-full bg-[#C1613C] text-[#FAF3E9] px-10 py-4 rounded-2xl text-lg font-semibold shadow-md hover:bg-[#8A3B23] transition-colors"
          >
            I am an Artisan
          </Link>
          <Link
            to="/cooperative"
            className="w-full bg-[#3E5641] text-[#FAF3E9] px-10 py-4 rounded-2xl text-lg font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            I am a Cooperative
          </Link>
          <a
            href="#status"
            className="w-full px-10 py-4 rounded-2xl text-lg font-semibold border-2 border-[#D9A441] text-[#2B2420] hover:bg-[#D9A441] hover:text-[#2B2420] transition-colors"
          >
            Check a Product
          </a>
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Hammer className="w-8 h-8" />}
            title="Your craft story"
            description="Tell buyers about you and your work."
          />
          <FeatureCard
            icon={<ScanLine className="w-8 h-8" />}
            title="QR code on each product"
            description="Buyers can scan it to learn more."
          />
          <FeatureCard
            title="Clear labels"
            description="Each product is marked: Checked, Waiting, or Reported."
          />
        </div>
      </section>

      {/* Status preview */}
      <section id="status" className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-[#3E5641]">
            Product status
          </h2>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <StatusBadge label="Checked" bg="#3E5641" fg="#FAF3E9" />
            <StatusBadge label="Waiting" bg="#D9A441" fg="#2B2420" />
            <StatusBadge label="Reported" bg="#A83E3E" fg="#FAF3E9" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#FAF3E9] border-t border-[#2B2420]/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#3E5641]">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <Step number="1" text="The artisan adds their product." />
            <Step number="2" text="The cooperative checks and confirms it." />
            <Step number="3" text="A QR code is put on the product." />
            <Step number="4" text="The buyer scans and reads the full story." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3E5641] text-[#FAF3E9] text-center py-8 text-base">
        A simple way to know who made your handmade product
      </footer>
    </div>
  );
}

function Step({ number, text }) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1">
      <div className="w-12 h-12 rounded-full bg-[#D9A441] text-[#FAF3E9] flex items-center justify-center text-lg font-bold">
        {number}
      </div>
      <p className="text-base text-[#2B2420]/80">{text}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-3xl border border-[#2B2420]/10 bg-[#FAF3E9] p-7 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#C1613C]/15 text-[#C1613C] flex items-center justify-center mb-5">
        {icon ?? <span className="font-bold text-lg">•</span>}
      </div>
      <h3 className="font-bold text-xl mb-2 text-[#2B2420]">{title}</h3>
      <p className="text-base text-[#2B2420]/80">{description}</p>
    </div>
  );
}

function StatusBadge({ label, bg, fg }) {
  return (
    <div
      className="rounded-2xl px-8 py-5 text-lg font-semibold shadow-sm"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </div>
  );
}
