import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Eye } from "lucide-react";
import { getArtisanProducts } from "../../api/client";
import {
  getArtisanToken,
  statusColors,
  statusLabel,
} from "../../utils/artisanAuth";

export default function ArtisanProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getArtisanToken();
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getArtisanProducts(token);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Could not load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#3E5641]">My Products</h1>
        <p className="text-lg text-[#2B2420]/80 mt-1">Your registered items</p>
      </div>

      {loading ? (
        <p className="text-lg text-[#3E5641] font-semibold">Loading...</p>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-[#A83E3E] text-[#FAF3E9] px-4 py-3 font-semibold">
          {error}
        </p>
      ) : null}

      {!loading && !error && products.length === 0 ? (
        <div className="rounded-3xl border border-[#2B2420]/10 p-8 text-center">
          <Package className="w-12 h-12 text-[#C1613C] mx-auto mb-4" />
          <p className="text-xl font-semibold text-[#2B2420]">No products yet</p>
          <Link
            to="/artisan/create"
            className="inline-block mt-6 bg-[#C1613C] text-[#FAF3E9] px-8 py-4 rounded-2xl text-lg font-semibold"
          >
            Create Passport
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {products.map((product) => {
          const colors = statusColors(product.status);
          return (
            <article
              key={product.id}
              className="rounded-3xl border border-[#2B2420]/10 overflow-hidden bg-[#FAF3E9] shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#3E5641]/10 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-14 h-14 text-[#3E5641]/50" />
                )}
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <h2 className="text-xl font-bold text-[#2B2420] leading-snug">
                  {product.name}
                </h2>
                <span
                  className="self-start px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: colors.bg, color: colors.fg }}
                >
                  {statusLabel(product.status)}
                </span>
                <Link
                  to={`/passport/${product.passportId || product.id}`}
                  className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-[#3E5641] text-[#FAF3E9] px-5 py-3.5 rounded-2xl text-lg font-semibold"
                >
                  <Eye className="w-5 h-5" />
                  View
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
