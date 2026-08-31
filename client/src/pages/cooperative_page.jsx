import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  IndianRupee,
  ShieldCheck,
  Plus,
  ArrowLeft,
  LogOut,
  Search,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Phone,
  MapPin,
  Hammer,
  RefreshCw,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import LanguageSwitcher from "../components/LanguageSwitcher";
import BackButton from "../components/BackButton";
import {
  registerCooperative,
  sendCooperativeOtp,
  verifyCooperativeOtp,
  getCooperativeMe,
  registerArtisanByCooperative,
  getCooperativeArtisans,
  getCooperativeProducts,
  createProductByCooperative,
  verifyProductStatus,
  getPayoutTransparency,
  friendlyAuthError,
} from "../api/client";


/*
  Adjust these imports if your existing cooperative auth
  utility uses different function names.
*/
import {
  clearCooperativeToken,
  getCooperativeToken,
  setCooperativeToken,
} from "../utils/cooperativeAuth";

const EMPTY_ARTISAN = {
  name: "",
  phone: "",
  craft: "",
  region: "",
  experience: "",
};

const EMPTY_PRODUCT = {
  name: "",
  artisanId: "",
  category: "",
  listedPrice: "",
  artisanPayout: "",
  materialsUsed: "",
  craftStory: "",
};

const EMPTY_REGISTRATION = {
  name: "",
  region: "",
  craftType: "",
  registrationNumber: "",
  phone: "",
};

export default function CooperativePage() {
  const navigate = useNavigate();

  const [view, setView] = useState("login");
  const [loginStep, setLoginStep] = useState("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [cooperative, setCooperative] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [transparencyData, setTransparencyData] = useState(null);

  const [activeTab, setActiveTab] = useState("artisans");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [status, setStatus] = useState({
    type: "idle",
    message: "",
  });

  const [demoOtp, setDemoOtp] = useState(null);

  const [showAddArtisan, setShowAddArtisan] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [artisanForm, setArtisanForm] = useState(EMPTY_ARTISAN);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [regData, setRegData] = useState(EMPTY_REGISTRATION);

  const [artisanSearch, setArtisanSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  /*
   * ---------------------------------------------------------
   * INITIAL SESSION CHECK
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const token = getCooperativeToken();

    if (!token) {
      setCheckingSession(false);
      return;
    }

    loadDashboardData(token, true);
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD DASHBOARD
   * ---------------------------------------------------------
   */

  async function loadDashboardData(token, silent = false) {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const coopData = await getCooperativeMe(token);

      setCooperative(coopData?.cooperative || coopData);

      const [artisanList, productList, payoutStats] =
        await Promise.all([
          getCooperativeArtisans(token),
          getCooperativeProducts(token),
          getPayoutTransparency(token),
        ]);

      setArtisans(Array.isArray(artisanList) ? artisanList : []);
      setProducts(Array.isArray(productList) ? productList : []);
      setTransparencyData(payoutStats || null);

      setView("dashboard");
      setLoginStep("phone");
      setStatus({ type: "idle", message: "" });
    } catch (err) {
      clearCooperativeToken();
      setCooperative(null);

      setStatus({
        type: "info",
        message: "Your session expired. Please log in again.",
      });

      setView("login");
      setLoginStep("phone");
    } finally {
      setLoading(false);
      setCheckingSession(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * COOPERATIVE LOGIN
   * ---------------------------------------------------------
   */

  async function handleSendOtp(e) {
    e.preventDefault();

    setLoading(true);
    setStatus({ type: "idle", message: "" });
    setDemoOtp(null);

    const cleanedPhone = phone.replace(/\s+/g, "");

    if (!cleanedPhone) {
      setStatus({
        type: "error",
        message: "Please enter your registered mobile number.",
      });
      setLoading(false);
      return;
    }

    try {
      const data = await sendCooperativeOtp(cleanedPhone);

      setPhone(cleanedPhone);
      setOtp("");
      setLoginStep("otp");

      setStatus({
        type: "success",
        message:
          data?.message ||
          "OTP sent successfully. Enter the code below.",
      });

      if (data?.otp) {
        setDemoOtp(data.otp);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: friendlyAuthError(
          err,
          "Could not send OTP. Please check your number and try again."
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

    if (!/^\d{6}$/.test(cleanedOtp)) {
      setStatus({
        type: "error",
        message: "Please enter the 6-digit OTP.",
      });
      setLoading(false);
      return;
    }

    try {
      const data = await verifyCooperativeOtp(
        cleanedPhone,
        cleanedOtp
      );

      if (!data?.token) {
        throw new Error("Login failed. Please try again.");
      }

      setCooperativeToken(data.token);

      setStatus({
        type: "success",
        message: "Login successful.",
      });

      await loadDashboardData(data.token);
    } catch (err) {
      setStatus({
        type: "error",
        message: friendlyAuthError(
          err,
          "The OTP could not be verified. Please try again."
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  function handleChangeNumber() {
    setLoginStep("phone");
    setOtp("");
    setDemoOtp(null);
    setStatus({ type: "idle", message: "" });
  }

  /*
   * ---------------------------------------------------------
   * COOPERATIVE REGISTRATION
   * ---------------------------------------------------------
   */

  async function handleRegisterSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    if (
      !regData.name.trim() ||
      !regData.region.trim() ||
      !regData.craftType.trim() ||
      !regData.registrationNumber.trim() ||
      !regData.phone.trim()
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await registerCooperative({
        ...regData,
        name: regData.name.trim(),
        region: regData.region.trim(),
        craftType: regData.craftType.trim(),
        registrationNumber:
          regData.registrationNumber.trim(),
        phone: regData.phone.replace(/\s+/g, ""),
      });

      setPhone(regData.phone.replace(/\s+/g, ""));

      setStatus({
        type: "success",
        message:
          result?.message ||
          "Registration successful. Please verify your phone number.",
      });

      setView("login");
      setLoginStep("phone");

      setRegData(EMPTY_REGISTRATION);

      /*
       * Automatically send OTP after registration.
       */
      try {
        const otpResult = await sendCooperativeOtp(
          regData.phone.replace(/\s+/g, "")
        );

        setLoginStep("otp");

        if (otpResult?.otp) {
          setDemoOtp(otpResult.otp);
        }
      } catch {
        /*
         * Registration succeeded even if automatic OTP sending
         * fails. User can press Send OTP again.
         */
      }
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err?.message ||
          "Registration failed. Please check your details.",
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ADD ARTISAN
   * ---------------------------------------------------------
   */

  async function handleAddArtisan(e) {
    e.preventDefault();

    const token = getCooperativeToken();

    if (!token) {
      handleLogout();
      return;
    }

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    if (
      !artisanForm.name.trim() ||
      !artisanForm.phone.trim() ||
      !artisanForm.craft.trim() ||
      !artisanForm.region.trim()
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required artisan details.",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await registerArtisanByCooperative(
        token,
        {
          ...artisanForm,
          name: artisanForm.name.trim(),
          phone: artisanForm.phone.replace(/\s+/g, ""),
          craft: artisanForm.craft.trim(),
          region: artisanForm.region.trim(),
          experience: artisanForm.experience
            ? Number(artisanForm.experience)
            : 0,
        }
      );

      setStatus({
        type: "success",
        message:
          result?.message ||
          `${artisanForm.name} was added successfully.`,
      });

      setArtisanForm(EMPTY_ARTISAN);
      setShowAddArtisan(false);

      const updatedArtisans =
        await getCooperativeArtisans(token);

      setArtisans(
        Array.isArray(updatedArtisans)
          ? updatedArtisans
          : []
      );
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err?.message ||
          "Could not add the artisan. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ADD PRODUCT
   * ---------------------------------------------------------
   */

  async function handleAddProduct(e) {
    e.preventDefault();

    const token = getCooperativeToken();

    if (!token) {
      handleLogout();
      return;
    }

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    if (
      !productForm.name.trim() ||
      !productForm.artisanId ||
      !productForm.category.trim() ||
      !productForm.listedPrice ||
      !productForm.artisanPayout
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required product details.",
      });
      setLoading(false);
      return;
    }

    if (
      Number(productForm.listedPrice) < 0 ||
      Number(productForm.artisanPayout) < 0
    ) {
      setStatus({
        type: "error",
        message: "Price values cannot be negative.",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await createProductByCooperative(
        token,
        {
          ...productForm,
          name: productForm.name.trim(),
          category: productForm.category.trim(),
          listedPrice: Number(productForm.listedPrice),
          artisanPayout: Number(productForm.artisanPayout),
          materialsUsed:
            productForm.materialsUsed.trim(),
          craftStory: productForm.craftStory.trim(),
        }
      );

      setStatus({
        type: "success",
        message:
          result?.message ||
          "Product created successfully.",
      });

      setProductForm(EMPTY_PRODUCT);
      setShowAddProduct(false);

      const [updatedProducts, updatedPayouts] =
        await Promise.all([
          getCooperativeProducts(token),
          getPayoutTransparency(token),
        ]);

      setProducts(
        Array.isArray(updatedProducts)
          ? updatedProducts
          : []
      );

      setTransparencyData(updatedPayouts || null);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err?.message ||
          "Could not create the product. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * PRODUCT VERIFICATION
   * ---------------------------------------------------------
   */

  async function handleVerifyStatus(productId, newStatus) {
    const token = getCooperativeToken();

    if (!token) {
      handleLogout();
      return;
    }

    try {
      await verifyProductStatus(
        token,
        productId,
        newStatus
      );

      setStatus({
        type: "success",
        message: `Product marked as ${newStatus}.`,
      });

      const [updatedProducts, updatedPayouts] =
        await Promise.all([
          getCooperativeProducts(token),
          getPayoutTransparency(token),
        ]);

      setProducts(
        Array.isArray(updatedProducts)
          ? updatedProducts
          : []
      );

      setTransparencyData(updatedPayouts || null);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err?.message ||
          "Could not update product status.",
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * REFRESH
   * ---------------------------------------------------------
   */

  async function handleRefresh() {
    const token = getCooperativeToken();

    if (!token) {
      handleLogout();
      return;
    }

    await loadDashboardData(token);
  }

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  function handleLogout() {
    clearCooperativeToken();

    setCooperative(null);
    setArtisans([]);
    setProducts([]);
    setTransparencyData(null);

    setPhone("");
    setOtp("");
    setDemoOtp(null);

    setLoginStep("phone");
    setView("login");

    setStatus({
      type: "info",
      message: "You have been logged out.",
    });
  }

  /*
   * ---------------------------------------------------------
   * FILTER DATA
   * ---------------------------------------------------------
   */

  const filteredArtisans = artisans.filter((artisan) => {
    const search = artisanSearch.toLowerCase().trim();

    if (!search) return true;

    return (
      String(artisan.name || "")
        .toLowerCase()
        .includes(search) ||
      String(artisan.phone || "")
        .toLowerCase()
        .includes(search) ||
      String(artisan.craft || "")
        .toLowerCase()
        .includes(search) ||
      String(artisan.region || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const filteredProducts = products.filter((product) => {
    const search = productSearch.toLowerCase().trim();

    if (!search) return true;

    return (
      String(product.name || "")
        .toLowerCase()
        .includes(search) ||
      String(product.category || "")
        .toLowerCase()
        .includes(search)
    );
  });

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const totalArtisans = artisans.length;
  const totalProducts = products.length;

  const waitingProducts = products.filter(
    (product) =>
      product.status === "Waiting" ||
      product.status === "Pending"
  ).length;

  const totalListedValue =
    transparencyData?.summary?.totalListedValue || 0;

  const totalArtisanPayout =
    transparencyData?.summary?.totalArtisanPayout || 0;

  /*
   * ---------------------------------------------------------
   * LOADING SCREEN
   * ---------------------------------------------------------
   */

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FAF3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#3E5641]/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#3E5641]" />
          </div>

          <p className="text-lg font-semibold text-[#3E5641]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * LOGIN / REGISTRATION
   * =========================================================
   */

  if (view === "login" || view === "register") {
    return (
      <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">
        <PageHeader fallback="/" />

        <div className="px-6 pb-16 pt-4">
          <div className="max-w-md mx-auto">
            <div className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/10 shadow-sm p-8">

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#3E5641]/10 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-[#3E5641]" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#3E5641]">
                    Cooperative Portal
                  </h1>

                  <p className="text-base text-[#2B2420]/70">
                    {view === "register"
                      ? "Register your cooperative"
                      : loginStep === "otp"
                      ? "Enter the OTP"
                      : "Login to manage artisans"}
                  </p>
                </div>
              </div>

              {status.message && (
                <div
                  className={`rounded-2xl px-4 py-3 mb-6 text-base font-semibold ${
                    status.type === "success"
                      ? "bg-[#3E5641] text-[#FAF3E9]"
                      : status.type === "error"
                      ? "bg-[#A83E3E] text-white"
                      : "bg-[#D9A441] text-[#2B2420]"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {status.message}
                </div>
              )}

              {view === "register" ? (
                /*
                 * REGISTRATION
                 */
                <form
                  onSubmit={handleRegisterSubmit}
                  className="space-y-5"
                >
                  <InputField
                    label="Cooperative name"
                    value={regData.name}
                    onChange={(value) =>
                      setRegData((prev) => ({
                        ...prev,
                        name: value,
                      }))
                    }
                    placeholder="Enter cooperative name"
                    required
                  />

                  <InputField
                    label="Region"
                    value={regData.region}
                    onChange={(value) =>
                      setRegData((prev) => ({
                        ...prev,
                        region: value,
                      }))
                    }
                    placeholder="Example: Odisha"
                    required
                  />

                  <InputField
                    label="Main craft"
                    value={regData.craftType}
                    onChange={(value) =>
                      setRegData((prev) => ({
                        ...prev,
                        craftType: value,
                      }))
                    }
                    placeholder="Example: Handloom"
                    required
                  />

                  <InputField
                    label="Registration number"
                    value={regData.registrationNumber}
                    onChange={(value) =>
                      setRegData((prev) => ({
                        ...prev,
                        registrationNumber: value,
                      }))
                    }
                    placeholder="Enter registration number"
                    required
                  />

                  <InputField
                    label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    value={regData.phone}
                    onChange={(value) =>
                      setRegData((prev) => ({
                        ...prev,
                        phone: value,
                      }))
                    }
                    placeholder="Enter 10-digit number"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#C1613C] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold hover:bg-[#8A3B23] transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? "Registering..."
                      : "Register Cooperative"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setStatus({
                        type: "idle",
                        message: "",
                      });
                    }}
                    className="w-full text-[#3E5641] font-semibold text-base"
                  >
                    Already registered? Login
                  </button>
                </form>
              ) : loginStep === "phone" ? (
                /*
                 * LOGIN PHONE
                 */
                <form
                  onSubmit={handleSendOtp}
                >
                  <InputField
                    label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={setPhone}
                    placeholder="Enter your registered number"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-[#C1613C] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold hover:bg-[#8A3B23] transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? "Sending OTP..."
                      : "Send OTP"}
                  </button>

                  <p className="text-center text-base text-[#2B2420]/70 mt-6">
                    New cooperative?
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setView("register");
                      setStatus({
                        type: "idle",
                        message: "",
                      });
                    }}
                    className="w-full mt-2 border-2 border-[#3E5641] text-[#3E5641] px-5 py-3.5 rounded-2xl text-base font-semibold hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors"
                  >
                    Register Cooperative
                  </button>
                </form>
              ) : (
                /*
                 * LOGIN OTP
                 */
                <form
                  onSubmit={handleVerifyOtp}
                >
                  <p className="text-base text-[#2B2420]/75 mb-2">
                    OTP sent to
                  </p>

                  <p className="text-lg font-bold text-[#3E5641] mb-2">
                    {phone}
                  </p>

                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="text-[#C1613C] font-semibold text-base hover:underline mb-6"
                  >
                    Change number
                  </button>

                  {demoOtp && (
                    <div className="mb-5 rounded-2xl px-4 py-3 bg-[#D9A441]/20 border border-[#D9A441]">
                      <p className="text-sm font-semibold text-[#2B2420]">
                        Demo OTP
                      </p>

                      <p className="text-2xl tracking-[0.4em] font-bold mt-1">
                        {demoOtp}
                      </p>
                    </div>
                  )}

                  <InputField
                    label="Enter OTP"
                    value={otp}
                    onChange={(value) =>
                      setOtp(
                        value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-[#C1613C] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold hover:bg-[#8A3B23] transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? "Checking..."
                      : "Verify & Login"}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendOtp}
                    className="w-full mt-3 border-2 border-[#3E5641] text-[#3E5641] px-5 py-3.5 rounded-2xl text-base font-semibold hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">

      {/* HEADER */}

      <header className="border-b border-[#2B2420]/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>
              <p className="text-2xl font-bold text-[#3E5641]">Karigar</p>

              <p className="text-sm text-[#2B2420]/65 mt-1">
                Cooperative Portal
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <LanguageSwitcher />
              <BackButton fallback="/" />

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 rounded-2xl border border-[#3E5641]/30 text-[#3E5641] hover:bg-[#3E5641]/10 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#A83E3E] text-[#A83E3E] hover:bg-[#A83E3E] hover:text-white transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* WELCOME */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-[#C1613C] uppercase tracking-wide">
            Welcome
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#3E5641] mt-1">
            {cooperative?.name || "Your Cooperative"}
          </h1>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#2B2420]/70">
            {cooperative?.region && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {cooperative.region}
              </span>
            )}

            {cooperative?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {cooperative.phone}
              </span>
            )}
          </div>
        </div>

        {/* STATUS */}

        {status.message && (
          <div
            className={`rounded-2xl px-5 py-4 mb-7 font-semibold ${
              status.type === "success"
                ? "bg-[#3E5641] text-[#FAF3E9]"
                : status.type === "error"
                ? "bg-[#A83E3E] text-white"
                : "bg-[#D9A441] text-[#2B2420]"
            }`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <StatCard
            icon={<Users />}
            label="Our Artisans"
            value={totalArtisans}
          />

          <StatCard
            icon={<Package />}
            label="Products"
            value={totalProducts}
          />

          <StatCard
            icon={<Clock />}
            label="Waiting"
            value={waitingProducts}
          />

          <StatCard
            icon={<IndianRupee />}
            label="Artisan Payout"
            value={`₹${Number(
              totalArtisanPayout
            ).toLocaleString()}`}
          />

        </div>

        {/* TABS */}

        <div className="bg-white/40 rounded-3xl border border-[#2B2420]/10 p-2 mb-7 flex flex-col sm:flex-row gap-2">

          <TabButton
            active={activeTab === "artisans"}
            onClick={() => setActiveTab("artisans")}
            icon={<Users />}
            label="Our Artisans"
          />

          <TabButton
            active={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            icon={<Package />}
            label="Products"
          />

          <TabButton
            active={activeTab === "payouts"}
            onClick={() => setActiveTab("payouts")}
            icon={<IndianRupee />}
            label="Payouts"
          />

        </div>

        {/* =================================================
            ARTISANS
        ================================================= */}

        {activeTab === "artisans" && (
          <section>

            <SectionHeader
              title="Our Artisans"
              description="Manage the artisans registered with your cooperative."
              buttonText="Add Artisan"
              onButtonClick={() =>
                setShowAddArtisan(true)
              }
              icon={<Plus />}
            />

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2B2420]/50" />

              <input
                value={artisanSearch}
                onChange={(e) =>
                  setArtisanSearch(e.target.value)
                }
                placeholder="Search artisans..."
                className="w-full rounded-2xl border-2 border-[#3E5641]/20 bg-[#FAF3E9] px-12 py-4 text-base outline-none focus:border-[#C1613C]"
              />
            </div>

            {filteredArtisans.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title="No artisans found"
                description={
                  artisanSearch
                    ? "Try another search."
                    : "Add your first artisan to get started."
                }
                buttonText={
                  artisanSearch
                    ? null
                    : "Add Artisan"
                }
                onButtonClick={() =>
                  setShowAddArtisan(true)
                }
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArtisans.map((artisan) => (
                  <div
                    key={artisan._id || artisan.id}
                    className="bg-white/50 rounded-3xl border border-[#2B2420]/10 p-6"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="w-12 h-12 rounded-2xl bg-[#C1613C]/10 flex items-center justify-center shrink-0">
                        <Hammer className="w-6 h-6 text-[#C1613C]" />
                      </div>

                      <span className="text-xs font-bold bg-[#3E5641]/10 text-[#3E5641] rounded-full px-3 py-1">
                        Artisan
                      </span>

                    </div>

                    <h3 className="text-xl font-bold text-[#3E5641] mt-5">
                      {artisan.name || "Unnamed Artisan"}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-[#2B2420]/75">

                      {artisan.phone && (
                        <p className="flex gap-2">
                          <Phone className="w-4 h-4 shrink-0" />
                          {artisan.phone}
                        </p>
                      )}

                      {artisan.craft && (
                        <p className="flex gap-2">
                          <Hammer className="w-4 h-4 shrink-0" />
                          {artisan.craft}
                        </p>
                      )}

                      {artisan.region && (
                        <p className="flex gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          {artisan.region}
                        </p>
                      )}

                      {artisan.experience !== undefined &&
                        artisan.experience !== null && (
                          <p>
                            <strong>
                              Experience:
                            </strong>{" "}
                            {artisan.experience} years
                          </p>
                        )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =================================================
            PRODUCTS
        ================================================= */}

        {activeTab === "products" && (
          <section>

            <SectionHeader
              title="Products"
              description="Create and verify products made by your artisans."
              buttonText="Add Product"
              onButtonClick={() =>
                setShowAddProduct(true)
              }
              icon={<Plus />}
            />

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2B2420]/50" />

              <input
                value={productSearch}
                onChange={(e) =>
                  setProductSearch(e.target.value)
                }
                placeholder="Search products..."
                className="w-full rounded-2xl border-2 border-[#3E5641]/20 bg-[#FAF3E9] px-12 py-4 text-base outline-none focus:border-[#C1613C]"
              />
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Package />}
                title="No products found"
                description={
                  productSearch
                    ? "Try another search."
                    : "Add a product to start tracking it."
                }
                buttonText={
                  productSearch
                    ? null
                    : "Add Product"
                }
                onButtonClick={() =>
                  setShowAddProduct(true)
                }
              />
            ) : (
              <div className="space-y-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="bg-white/50 rounded-3xl border border-[#2B2420]/10 p-6"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                      <div className="flex gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-[#3E5641]/10 flex items-center justify-center shrink-0">
                          <Package className="w-6 h-6 text-[#3E5641]" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-[#3E5641]">
                            {product.name}
                          </h3>

                          <p className="text-sm text-[#2B2420]/65 mt-1">
                            {product.category || "Craft product"}
                          </p>

                          {product.artisan?.name && (
                            <p className="text-sm font-semibold mt-3">
                              Artisan:{" "}
                              <span className="text-[#3E5641]">
                                {product.artisan.name}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <StatusBadge
                        status={product.status}
                      />

                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

                      <InfoBox
                        label="Listed Price"
                        value={`₹${Number(
                          product.listedPrice || 0
                        ).toLocaleString()}`}
                      />

                      <InfoBox
                        label="Artisan Gets"
                        value={`₹${Number(
                          product.artisanPayout || 0
                        ).toLocaleString()}`}
                      />

                      <InfoBox
                        label="Category"
                        value={
                          product.category || "-"
                        }
                      />

                      <InfoBox
                        label="Status"
                        value={
                          product.status || "Waiting"
                        }
                      />

                    </div>

                    <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[#2B2420]/10">

                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyStatus(
                            product._id ||
                              product.id,
                            "Checked"
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#3E5641] text-[#3E5641] font-semibold hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Checked
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyStatus(
                            product._id ||
                              product.id,
                            "Waiting"
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D9A441] text-[#2B2420] font-semibold hover:bg-[#D9A441] transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Waiting
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyStatus(
                            product._id ||
                              product.id,
                            "Reported"
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#A83E3E] text-[#A83E3E] font-semibold hover:bg-[#A83E3E] hover:text-white transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Reported
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =================================================
            PAYOUTS
        ================================================= */}

        {activeTab === "payouts" && (
          <section>

            <div className="mb-7">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-bold text-[#3E5641]">
                  Payout Transparency
                </h2>

                <span className="bg-[#C1613C] text-[#FAF3E9] text-xs font-bold px-3 py-1 rounded-full">
                  FAIR TRADE
                </span>
              </div>

              <p className="text-base text-[#2B2420]/70 mt-2">
                See how much each artisan receives from every product.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

              <PayoutCard
                label="Total Listed Value"
                value={`₹${Number(
                  totalListedValue
                ).toLocaleString()}`}
              />

              <PayoutCard
                label="Total Artisan Payout"
                value={`₹${Number(
                  totalArtisanPayout
                ).toLocaleString()}`}
              />

              <PayoutCard
                label="Products"
                value={
                  transparencyData?.items?.length ||
                  products.length ||
                  0
                }
              />

              <PayoutCard
                label="Average Artisan Share"
                value={`${Number(
                  transparencyData?.summary
                    ?.averageArtisanSharePercent ||
                    0
                ).toFixed(1)}%`}
              />

            </div>

            {!transparencyData?.items ||
            transparencyData.items.length === 0 ? (
              <EmptyState
                icon={<IndianRupee />}
                title="No payout records yet"
                description="Add products to see payout transparency."
                buttonText="Add Product"
                onButtonClick={() =>
                  setShowAddProduct(true)
                }
              />
            ) : (
              <div className="bg-white/50 rounded-3xl border border-[#2B2420]/10 overflow-hidden">

                <div className="p-5 border-b border-[#2B2420]/10">
                  <h3 className="font-bold text-lg text-[#3E5641]">
                    Payout Records
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#3E5641]/10">
                      <tr>
                        <th className="px-5 py-4 text-xs uppercase">
                          Product
                        </th>

                        <th className="px-5 py-4 text-xs uppercase">
                          Artisan
                        </th>

                        <th className="px-5 py-4 text-xs uppercase">
                          Listed
                        </th>

                        <th className="px-5 py-4 text-xs uppercase">
                          Artisan Gets
                        </th>

                        <th className="px-5 py-4 text-xs uppercase">
                          Share
                        </th>

                        <th className="px-5 py-4 text-xs uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#2B2420]/10">
                      {transparencyData.items.map(
                        (item) => (
                          <tr
                            key={
                              item.id ||
                              item._id ||
                              item.productName
                            }
                            className="hover:bg-[#3E5641]/5"
                          >
                            <td className="px-5 py-4 font-semibold">
                              {item.productName}
                            </td>

                            <td className="px-5 py-4">
                              {item.artisanName ||
                                "-"}
                            </td>

                            <td className="px-5 py-4">
                              ₹
                              {Number(
                                item.listedPrice || 0
                              ).toLocaleString()}
                            </td>

                            <td className="px-5 py-4 font-bold text-[#3E5641]">
                              ₹
                              {Number(
                                item.artisanPayout ||
                                  0
                              ).toLocaleString()}
                            </td>

                            <td className="px-5 py-4">
                              {Number(
                                item.artisanSharePercent ||
                                  0
                              ).toFixed(1)}
                              %
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={item.status}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

      </main>

      {/* =====================================================
          ADD ARTISAN MODAL
      ===================================================== */}

      {showAddArtisan && (
        <Modal
          title="Add Artisan"
          description="Enter the details of the artisan."
          onClose={() => {
            setShowAddArtisan(false);
            setArtisanForm(EMPTY_ARTISAN);
          }}
        >
          <form
            onSubmit={handleAddArtisan}
            className="space-y-5"
          >

            <InputField
              label="Artisan name"
              value={artisanForm.name}
              onChange={(value) =>
                setArtisanForm((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
              placeholder="Enter full name"
              required
            />

            <InputField
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              value={artisanForm.phone}
              onChange={(value) =>
                setArtisanForm((prev) => ({
                  ...prev,
                  phone: value,
                }))
              }
              placeholder="Enter 10-digit number"
              required
            />

            <InputField
              label="Craft"
              value={artisanForm.craft}
              onChange={(value) =>
                setArtisanForm((prev) => ({
                  ...prev,
                  craft: value,
                }))
              }
              placeholder="Example: Pottery"
              required
            />

            <InputField
              label="Region"
              value={artisanForm.region}
              onChange={(value) =>
                setArtisanForm((prev) => ({
                  ...prev,
                  region: value,
                }))
              }
              placeholder="Example: Puri, Odisha"
              required
            />

            <InputField
              label="Years of experience"
              type="number"
              min="0"
              value={artisanForm.experience}
              onChange={(value) =>
                setArtisanForm((prev) => ({
                  ...prev,
                  experience: value,
                }))
              }
              placeholder="Example: 15"
            />

            <ModalButtons
              loading={loading}
              submitText="Add Artisan"
              onCancel={() => {
                setShowAddArtisan(false);
                setArtisanForm(EMPTY_ARTISAN);
              }}
            />

          </form>
        </Modal>
      )}

      {/* =====================================================
          ADD PRODUCT MODAL
      ===================================================== */}

      {showAddProduct && (
        <Modal
          title="Add Product"
          description="Add a product made by one of your artisans."
          onClose={() => {
            setShowAddProduct(false);
            setProductForm(EMPTY_PRODUCT);
          }}
        >
          <form
            onSubmit={handleAddProduct}
            className="space-y-5"
          >

            <InputField
              label="Product name"
              value={productForm.name}
              onChange={(value) =>
                setProductForm((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
              placeholder="Example: Sambalpuri Saree"
              required
            />

            <div>
              <label className="block text-sm font-bold mb-2">
                Artisan
              </label>

              <select
                value={productForm.artisanId}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    artisanId: e.target.value,
                  }))
                }
                required
                className="w-full rounded-2xl border-2 border-[#3E5641]/20 bg-[#FAF3E9] px-4 py-4 outline-none focus:border-[#C1613C]"
              >
                <option value="">
                  Choose an artisan
                </option>

                {artisans.map((artisan) => (
                  <option
                    key={
                      artisan._id ||
                      artisan.id
                    }
                    value={
                      artisan._id ||
                      artisan.id
                    }
                  >
                    {artisan.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Category"
              value={productForm.category}
              onChange={(value) =>
                setProductForm((prev) => ({
                  ...prev,
                  category: value,
                }))
              }
              placeholder="Example: Handloom"
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">

              <InputField
                label="Listed price (₹)"
                type="number"
                min="0"
                value={productForm.listedPrice}
                onChange={(value) =>
                  setProductForm((prev) => ({
                    ...prev,
                    listedPrice: value,
                  }))
                }
                placeholder="Example: 2500"
                required
              />

              <InputField
                label="Artisan payout (₹)"
                type="number"
                min="0"
                value={productForm.artisanPayout}
                onChange={(value) =>
                  setProductForm((prev) => ({
                    ...prev,
                    artisanPayout: value,
                  }))
                }
                placeholder="Example: 1800"
                required
              />

            </div>

            <InputField
              label="Materials used"
              value={productForm.materialsUsed}
              onChange={(value) =>
                setProductForm((prev) => ({
                  ...prev,
                  materialsUsed: value,
                }))
              }
              placeholder="Example: Cotton, natural dye"
            />

            <div>
              <label className="block text-sm font-bold mb-2">
                Craft story
              </label>

              <textarea
                value={productForm.craftStory}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    craftStory: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Tell a short story about this product..."
                className="w-full rounded-2xl border-2 border-[#3E5641]/20 bg-[#FAF3E9] px-4 py-4 outline-none resize-none focus:border-[#C1613C]"
              />
            </div>

            <ModalButtons
              loading={loading}
              submitText="Add Product"
              onCancel={() => {
                setShowAddProduct(false);
                setProductForm(EMPTY_PRODUCT);
              }}
            />

          </form>
        </Modal>
      )}

    </div>
  );
}

/*
 * =========================================================
 * SMALL REUSABLE COMPONENTS
 * =========================================================
 */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
  maxLength,
  min,
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2">
        {label}
        {required && (
          <span className="text-[#C1613C] ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        className="w-full rounded-2xl border-2 border-[#3E5641]/20 bg-[#FAF3E9] px-4 py-4 text-base outline-none focus:border-[#C1613C] focus:ring-2 focus:ring-[#C1613C]/10"
      />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/50 rounded-3xl border border-[#2B2420]/10 p-5">
      <div className="w-10 h-10 rounded-xl bg-[#3E5641]/10 text-[#3E5641] flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-sm font-semibold text-[#2B2420]/65">
        {label}
      </p>

      <p className="text-2xl font-extrabold text-[#3E5641] mt-1">
        {value}
      </p>
    </div>
  );
}

function PayoutCard({ label, value }) {
  return (
    <div className="bg-white/50 rounded-3xl border border-[#2B2420]/10 p-5">
      <p className="text-sm font-semibold text-[#2B2420]/65">
        {label}
      </p>

      <p className="text-2xl font-extrabold text-[#3E5641] mt-2">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-bold transition-colors ${
        active
          ? "bg-[#3E5641] text-[#FAF3E9]"
          : "text-[#3E5641] hover:bg-[#3E5641]/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHeader({
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">

      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E5641]">
          {title}
        </h2>

        <p className="text-base text-[#2B2420]/70 mt-1">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onButtonClick}
        className="flex items-center justify-center gap-2 bg-[#C1613C] text-[#FAF3E9] px-5 py-3.5 rounded-2xl font-bold hover:bg-[#8A3B23] transition-colors"
      >
        {icon}
        {buttonText}
      </button>

    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#3E5641]/5 p-4">
      <p className="text-xs font-semibold text-[#2B2420]/60 uppercase">
        {label}
      </p>

      <p className="font-bold text-[#3E5641] mt-1 break-words">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(
    status || "Waiting"
  ).toLowerCase();

  if (normalized === "checked" ||
      normalized === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3E5641]/10 text-[#3E5641] text-xs font-bold">
        <CheckCircle className="w-3.5 h-3.5" />
        Checked
      </span>
    );
  }

  if (normalized === "reported") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A83E3E]/10 text-[#A83E3E] text-xs font-bold">
        <AlertTriangle className="w-3.5 h-3.5" />
        Reported
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D9A441]/20 text-[#2B2420] text-xs font-bold">
      <Clock className="w-3.5 h-3.5" />
      Waiting
    </span>
  );
}

function EmptyState({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-[#3E5641]/20 p-10 text-center">

      <div className="w-14 h-14 rounded-2xl bg-[#3E5641]/10 text-[#3E5641] flex items-center justify-center mx-auto">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-[#3E5641] mt-4">
        {title}
      </h3>

      <p className="text-[#2B2420]/65 mt-2">
        {description}
      </p>

      {buttonText && (
        <button
          type="button"
          onClick={onButtonClick}
          className="mt-5 bg-[#C1613C] text-[#FAF3E9] px-5 py-3 rounded-2xl font-bold hover:bg-[#8A3B23]"
        >
          {buttonText}
        </button>
      )}

    </div>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#2B2420]/50 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF3E9] rounded-3xl shadow-2xl border border-[#2B2420]/10">

        <div className="sticky top-0 bg-[#FAF3E9] px-6 py-5 border-b border-[#2B2420]/10 flex items-start justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold text-[#3E5641]">
              {title}
            </h2>

            <p className="text-sm text-[#2B2420]/65 mt-1">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#2B2420]/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}

function ModalButtons({
  loading,
  submitText,
  onCancel,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-[#3E5641] text-[#3E5641] font-bold hover:bg-[#3E5641] hover:text-[#FAF3E9] disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="flex-1 px-5 py-3.5 rounded-2xl bg-[#C1613C] text-[#FAF3E9] font-bold hover:bg-[#8A3B23] disabled:opacity-50"
      >
        {loading ? "Please wait..." : submitText}
      </button>

    </div>
  );
}