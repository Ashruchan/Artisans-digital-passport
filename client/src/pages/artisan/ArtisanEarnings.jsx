import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { getArtisanEarnings } from "../../api/client";
import { getArtisanToken } from "../../utils/artisanAuth";

function formatMoney(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ArtisanEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getArtisanToken();
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const res = await getArtisanEarnings(token);
        setData(res);
      } catch (err) {
        setError(err?.message || "Could not load earnings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#3E5641]">My Earnings</h1>
        <p className="text-lg text-[#2B2420]/80 mt-1">Money from your products</p>
      </div>

      {loading ? (
        <p className="text-lg text-[#3E5641] font-semibold">Loading...</p>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-[#A83E3E] text-[#FAF3E9] px-4 py-3 font-semibold">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="rounded-3xl bg-[#3E5641] text-[#FAF3E9] p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-8 h-8" />
            <p className="text-lg font-semibold opacity-90">Total earnings</p>
          </div>
          <p className="text-4xl sm:text-5xl font-bold tracking-tight">
            {formatMoney(data?.totalEarnings)}
          </p>
          <p className="text-base mt-3 opacity-80">
            {data?.productCount || 0} product
            {(data?.productCount || 0) === 1 ? "" : "s"}
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-[#2B2420]/10 bg-[#FAF3E9] p-5 shadow-sm"
          >
            <h2 className="text-xl font-bold text-[#2B2420] leading-snug">
              {item.productName}
            </h2>
            <p className="text-sm text-[#2B2420]/70 mt-1">
              {formatDate(item.date)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#D9A441]/25 px-4 py-3">
                <p className="text-sm text-[#2B2420]/70">List price</p>
                <p className="text-lg font-bold">{formatMoney(item.listedPrice)}</p>
              </div>
              <div className="rounded-2xl bg-[#3E5641]/15 px-4 py-3">
                <p className="text-sm text-[#2B2420]/70">You received</p>
                <p className="text-lg font-bold text-[#3E5641]">
                  {formatMoney(item.artisanPayout)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && !error && items.length === 0 ? (
        <p className="text-center text-lg text-[#2B2420]/70 py-8">
          No earnings yet. Create a passport to get started.
        </p>
      ) : null}
    </div>
  );
}
