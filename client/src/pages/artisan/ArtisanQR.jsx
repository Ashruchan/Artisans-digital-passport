import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, Eye, Package } from "lucide-react";
import { getArtisanProducts } from "../../api/client";
import QrCodeImage from "../../components/QrCodeImage";
import {
  getArtisanToken,
  passportPublicUrl,
  statusColors,
  statusLabel,
} from "../../utils/artisanAuth";

export default function ArtisanQR() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getArtisanToken();
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getArtisanProducts(token);
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        if (list.length > 0) {
          setSelectedId(String(list[0].passportId || list[0].id));
        }
      } catch (err) {
        setError(err?.message || "Could not load QR codes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = products.find(
    (p) => String(p.passportId || p.id) === String(selectedId)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#3E5641]">My QR Code</h1>
        <p className="text-lg text-[#2B2420]/80 mt-1">
          Pick a product to show its code
        </p>
      </div>

      {loading ? (
        <p className="text-lg text-[#3E5641] font-semibold">Loading...</p>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-[#A83E3E] text-[#FAF3E9] px-4 py-3 font-semibold">
          {error}
        </p>
      ) : null}

      {!loading && products.length === 0 ? (
        <div className="rounded-3xl border border-[#2B2420]/10 p-8 text-center">
          <QrCode className="w-12 h-12 text-[#C1613C] mx-auto mb-4" />
          <p className="text-xl font-semibold">No passports yet</p>
          <Link
            to="/artisan/create"
            className="inline-block mt-6 bg-[#C1613C] text-[#FAF3E9] px-8 py-4 rounded-2xl text-lg font-semibold"
          >
            Create Passport
          </Link>
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => {
            const id = String(product.passportId || product.id);
            const active = id === String(selectedId);
            const colors = statusColors(product.status);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId(id)}
                className={`w-full text-left rounded-3xl border-2 p-4 flex items-center gap-4 transition-colors ${
                  active
                    ? "border-[#C1613C] bg-[#C1613C]/10"
                    : "border-[#2B2420]/10 bg-[#FAF3E9]"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#3E5641]/10 flex items-center justify-center shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-7 h-7 text-[#3E5641]/50" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold truncate">{product.name}</p>
                  <span
                    className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: colors.bg, color: colors.fg }}
                  >
                    {statusLabel(product.status)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {selected ? (
        <div className="rounded-3xl border border-[#2B2420]/10 p-6 bg-white space-y-5 text-center">
          <h2 className="text-xl font-bold text-[#3E5641]">{selected.name}</h2>
          <QrCodeImage
            value={passportPublicUrl(selected.passportId || selected.id)}
            size={260}
            label={`QR for ${selected.name}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={passportPublicUrl(selected.passportId || selected.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-lg font-semibold bg-[#3E5641] text-[#FAF3E9]"
            >
              <QrCode className="w-5 h-5" />
              View QR Code
            </a>
            <Link
              to={`/passport/${selected.passportId || selected.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-lg font-semibold bg-[#C1613C] text-[#FAF3E9]"
            >
              <Eye className="w-5 h-5" />
              View Passport
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
