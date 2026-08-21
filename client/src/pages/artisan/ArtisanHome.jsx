import { Link, useOutletContext } from "react-router-dom";
import {
  Package,
  IdCard,
  QrCode,
  Wallet,
  BadgeCheck,
  User,
} from "lucide-react";

const actions = [
  {
    to: "/artisan/products",
    title: "My Products",
    hint: "See your items",
    icon: Package,
    bg: "#C1613C",
  },
  {
    to: "/artisan/create",
    title: "Create Passport",
    hint: "Add a new product",
    icon: IdCard,
    bg: "#3E5641",
  },
  {
    to: "/artisan/qr",
    title: "My QR Code",
    hint: "Show codes to buyers",
    icon: QrCode,
    bg: "#D9A441",
    fg: "#2B2420",
  },
  {
    to: "/artisan/earnings",
    title: "My Earnings",
    hint: "Money you received",
    icon: Wallet,
    bg: "#8A3B23",
  },
];

export default function ArtisanHome() {
  const { artisan } = useOutletContext();
  const name = artisan?.name || "Artisan";
  const craft = artisan?.craft || "Craft";
  const verified = Boolean(artisan?.phoneVerified);
  const photo = artisan?.photoUrl;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[#2B2420]/10 bg-[#FAF3E9] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-[#3E5641]/15 flex items-center justify-center shrink-0 border border-[#2B2420]/10">
            {photo ? (
              <img
                src={photo}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-[#3E5641]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-base text-[#2B2420]/70 mb-1">Welcome</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3E5641] truncate">
              {name}
            </h1>
            <p className="text-lg text-[#2B2420] mt-1 truncate">{craft}</p>
            {verified ? (
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-[#3E5641] text-[#FAF3E9] text-sm font-semibold">
                <BadgeCheck className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-[#D9A441] text-[#2B2420] text-sm font-semibold">
                Pending verify
              </span>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#3E5641] mb-4">What do you want to do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map(({ to, title, hint, icon: Icon, bg, fg }) => (
            <Link
              key={to}
              to={to}
              className="rounded-3xl p-6 min-h-[9.5rem] flex flex-col justify-between shadow-sm hover:opacity-95 transition-opacity"
              style={{ backgroundColor: bg, color: fg || "#FAF3E9" }}
            >
              <Icon className="w-10 h-10" strokeWidth={2} />
              <div>
                <p className="text-2xl font-bold leading-tight">{title}</p>
                <p className="text-base mt-1 opacity-90">{hint}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
