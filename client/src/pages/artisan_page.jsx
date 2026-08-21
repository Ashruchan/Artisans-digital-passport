import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hammer } from "lucide-react";
import {
  sendArtisanOtp,
  verifyArtisanOtp,
  getArtisanMe,
  friendlyAuthError,
} from "../api/client";
import {
  clearArtisanToken,
  getArtisanToken,
  setArtisanToken,
} from "../utils/artisanAuth";

export default function ArtisanPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    const token = getArtisanToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }

    (async () => {
      try {
        await getArtisanMe(token);
        navigate("/artisan/home", { replace: true });
      } catch {
        clearArtisanToken();
        setStatus({
          type: "info",
          message: "Please log in again.",
        });
        setCheckingSession(false);
      }
    })();
  }, [navigate]);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const cleanedPhone = phone.replace(/\s+/g, "");

    if (!cleanedPhone) {
      setStatus({
        type: "error",
        message: "Please enter your phone number.",
      });
      setLoading(false);
      return;
    }

    try {
      const data = await sendArtisanOtp(cleanedPhone);

      setStep("otp");
      setOtp("");
      setStatus({
        type: "success",
        message: data?.message || "OTP sent. Enter the code below.",
      });

      if (data?.otp) {
        window.alert(`Demo OTP for ${cleanedPhone}:\n\n${data.otp}`);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: friendlyAuthError(
          err,
          "Could not send OTP. Please try again."
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const cleanedPhone = phone.replace(/\s+/g, "");
    const cleanedOtp = otp.replace(/\s+/g, "");

    if (!cleanedOtp) {
      setStatus({
        type: "error",
        message: "Please enter the 6-digit OTP.",
      });
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(cleanedOtp)) {
      setStatus({
        type: "error",
        message: "OTP must be a 6-digit number.",
      });
      setLoading(false);
      return;
    }

    try {
      const data = await verifyArtisanOtp(cleanedPhone, cleanedOtp);

      if (data?.token) {
        setArtisanToken(data.token);
      }

      navigate("/artisan/home", { replace: true });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "OTP check failed. Please try again.",
      });
      setLoading(false);
    }
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setStatus({ type: "idle", message: "" });
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FAF3E9] flex items-center justify-center text-[#3E5641] text-xl font-semibold">
        Loading...
      </div>
    );
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
                {step === "otp"
                  ? "Enter the OTP sent to your phone."
                  : "Enter your phone number to continue."}
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

          {step === "phone" ? (
            <form onSubmit={handleSendOtp}>
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
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-base text-[#2B2420]/80 mt-6 text-center leading-relaxed">
                Not registered yet? Please contact your cooperative.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <p className="text-base text-[#2B2420]/80">
                  OTP sent to{" "}
                  <span className="font-semibold text-[#2B2420]">{phone}</span>
                </p>
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="mt-1 text-base font-semibold text-[#C1613C] hover:underline"
                >
                  Change number
                </button>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="otp"
                  className="block text-base font-semibold text-[#2B2420] mb-2"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  maxLength={6}
                  placeholder="6-digit code"
                  className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] text-lg tracking-widest px-5 py-4 outline-none border-2 border-[#3E5641]/30 focus:border-[#C1613C] focus:ring-2 focus:ring-[#C1613C]/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1613C] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold shadow-sm hover:bg-[#8A3B23] transition-colors disabled:opacity-60"
              >
                {loading ? "Checking..." : "Verify & log in"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full mt-3 px-5 py-3 rounded-2xl text-base font-semibold border border-[#3E5641] text-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Resend OTP"}
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
