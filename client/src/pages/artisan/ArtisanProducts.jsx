import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Eye, Trash2 } from "lucide-react";
import { getArtisanProducts, deleteArtisanProduct } from "../../api/client";
import PassportMedia from "../../components/PassportMedia";
import {
  artisanPassportPath,
  getArtisanToken,
  statusColors,
  statusLabel,
} from "../../utils/artisanAuth";

export default function ArtisanProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    const token = getArtisanToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await getArtisanProducts(token);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    const token = getArtisanToken();
    if (!token) return;

    setDeletingId(productId);
    try {
      await deleteArtisanProduct(token, productId);
      setProducts((prev) => prev.filter((p) => (p.id || p.passportId) !== productId));
    } catch (err) {
      alert(err?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

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
          const pId = product.passportId || product.id;
          const isDeleting = deletingId === pId;

          return (
            <article
              key={product.id}
              className="rounded-3xl border border-[#2B2420]/10 overflow-hidden bg-[#FAF3E9] shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#3E5641]/10 flex items-center justify-center">
                <PassportMedia
                  passport={product}
                  mode="poster"
                  className="w-full h-full object-cover"
                />
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
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Link
                    to={artisanPassportPath(pId)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#3E5641] text-[#FAF3E9] px-4 py-3 rounded-2xl text-base font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(pId, product.name)}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#A83E3E] text-[#FAF3E9] px-4 py-3 rounded-2xl text-base font-semibold hover:bg-[#8A3232] transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
