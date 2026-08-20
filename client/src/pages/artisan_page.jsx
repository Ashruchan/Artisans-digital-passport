import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

const TOKEN_KEY = "artisanToken";

function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export default function ArtisanPage() {
  const [phone, setPhone] = useState("");
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/artisans/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          clearToken();
          setStatus({
            type: "info",
            message: "Please log in again.",
          });
          return;
        }

        const data = await res.json();
        setArtisan(data);
        setStatus({
          type: "success",
          message: `Welcome back${data?.name ? `, ${data.name}` : ""}.`,
        });
      } catch {
        setStatus({
          type: "error",
          message: "Could not load your account. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function tryLoginWithCandidates(payload) {
    const candidates = [
      "/api/artisans/login",
      "/api/auth/artisan/login",
      "/api/auth/login",
    ];

    let lastError = null;

    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.status === 404) continue;

        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (res.ok) {
          const token =
            data?.token ??
            data?.accessToken ??
            data?.jwt ??
            data?.access_token ??
            null;

          if (token) {
            setToken(token);
            return { ok: true, token, data };
          }

          return { ok: true, token: null, data };
        }

        const msg = data?.message ?? data?.error ?? `Login failed (${res.status}).`;
        lastError = new Error(msg);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError ?? new Error("Could not log in. Please try again.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const cleanedPhone = phone.replace(/\s+/g, "");

    try {
      const result = await tryLoginWithCandidates({
        phone: cleanedPhone,
        mobile: cleanedPhone,
      });

      if (result.token) {
        const res = await fetch("/api/artisans/me", {
          headers: { Authorization: `Bearer ${result.token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setArtisan(data);
          setStatus({
            type: "success",
            message: `Welcome${data?.name ? `, ${data.name}` : ""}!`,
          });
          return;
        }
      }

      setStatus({
        type: "info",
        message: "Could not log in with this number. Please ask your cooperative for help.",
      });

      if (result.data) setArtisan(result.data);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message ?? "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">
      <nav className="px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-[#3E5641]">Karigar</span>
        </Link>
        <Link
          to="/"
          className="text-base font-semibold px-5 py-2.5 rounded-2xl border border-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors"
        >
          Back
        </Link>
      </nav>

      <div className="px-6 pb-16 pt-4">
        <div className="max-w-md mx-auto bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/10 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#C1613C]/15 flex items-center justify-center">
              <Hammer className="w-7 h-7 text-[#C1613C]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#3E5641]">
                Artisan login
              </h1>
              <p className="text-base text-[#2B2420]/80">
                Enter your phone number to continue.
              </p>
            </div>
          </div>

          {status.message ? (
            <div
              className="rounded-2xl px-4 py-3 mb-6 text-base font-semibold"
              style={{
                backgroundColor:
                  status.type === "success"
                    ? "#3E5641"
                    : status.type === "error"
                      ? "#A83E3E"
                      : "#D9A441",
                color: status.type === "info" ? "#2B2420" : "#FAF3E9",
              }}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          ) : null}

          {artisan ? (
            <div className="mb-6">
              <p className="text-lg font-semibold text-[#2B2420]">
                {artisan?.name ? `${artisan.name}` : "Artisan"}, you are logged in.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  clearToken();
                  setArtisan(null);
                  setPhone("");
                  setStatus({
                    type: "info",
                    message: "You have logged out.",
                  });
                }}
                className="mt-4 px-5 py-3 rounded-2xl text-base font-semibold border border-[#3E5641] text-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors disabled:opacity-60"
              >
                Log out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="phone"
                  className="block text-base font-semibold text-[#2B2420] mb-2"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter your 10-digit number"
                  className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] text-lg px-5 py-4 outline-none border-2 border-[#3E5641]/30 focus:border-[#C1613C] focus:ring-2 focus:ring-[#C1613C]/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1613C] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold shadow-sm hover:bg-[#8A3B23] transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Log in"}
              </button>

              <p className="text-base text-[#2B2420]/80 mt-6 text-center leading-relaxed">
                Not registered yet? Please contact your cooperative.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
