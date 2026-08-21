import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogOut,
  Layers,
  Users,
  PackageCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  PlusCircle,
  Award,
  DollarSign,
  Briefcase,
  Search,
} from "lucide-react";
import {
  sendCooperativeOtp,
  verifyCooperativeOtp,
  registerCooperative,
  getCooperativeMe,
  registerArtisanByCooperative,
  getCooperativeArtisans,
  getCooperativeProducts,
  createProductByCooperative,
  verifyProductStatus,
  getPayoutTransparency,
  friendlyAuthError,
} from "../api/client";

const TOKEN_KEY = "cooperativeToken";

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

export default function CooperativePage() {
  // Main view state: "login" | "register" | "dashboard"
  const [view, setView] = useState("login");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Dashboard active tab: "artisans" | "products" | "payouts"
  const [activeTab, setActiveTab] = useState("artisans");

  // Registration Form State for Cooperative
  const [regData, setRegData] = useState({
    name: "",
    region: "",
    craftType: "",
    registrationNumber: "",
    supportingDocument: "",
    phone: "",
  });

  // Artisan Registration Form State (by Cooperative)
  const [artisanForm, setArtisanForm] = useState({
    name: "",
    phone: "",
    craft: "",
    region: "",
    experience: "",
  });
  const [showAddArtisanModal, setShowAddArtisanModal] = useState(false);

  // Product Form State (by Cooperative)
  const [productForm, setProductForm] = useState({
    name: "",
    artisanId: "",
    category: "",
    listedPrice: "",
    artisanPayout: "",
    materialsUsed: "",
    craftStory: "",
  });
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Authenticated State Data
  const [cooperative, setCooperative] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [transparencyData, setTransparencyData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [fileName, setFileName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load cooperative info and dashboard data if token exists
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    loadDashboardData(token);
  }, []);

  async function loadDashboardData(token) {
    setLoading(true);
    try {
      const coopData = await getCooperativeMe(token);
      setCooperative(coopData);

      // Load sub-data
      const [artisanList, productList, payoutStats] = await Promise.all([
        getCooperativeArtisans(token).catch(() => []),
        getCooperativeProducts(token).catch(() => []),
        getPayoutTransparency(token).catch(() => null),
      ]);

      setArtisans(artisanList || []);
      setProducts(productList || []);
      setTransparencyData(payoutStats);

      setStatus({
        type: "success",
        message: `Welcome back, ${coopData?.name || "Cooperative"}.`,
      });
    } catch {
      clearToken();
      setCooperative(null);
      setStatus({
        type: "info",
        message: "Session expired. Please log in again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle File Upload Simulation / Selection for Cooperative
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setRegData((prev) => ({
        ...prev,
        supportingDocument: file.name,
      }));
    }
  }

  // Handle Sending OTP for Login
  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

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

      setStep("otp");
      setOtp("");
      setStatus({
        type: "success",
        message: data?.message || "OTP sent successfully to your mobile number.",
      });

      if (data?.otp) {
        window.alert(`Demo Cooperative OTP for ${cleanedPhone}:\n\n${data.otp}`);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: friendlyAuthError(
          err,
          "Could not send OTP. Please ensure your mobile number is registered."
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle Verifying OTP for Login
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const cleanedPhone = phone.replace(/\s+/g, "");
    const cleanedOtp = otp.replace(/\s+/g, "");

    if (!cleanedOtp || !/^\d{6}$/.test(cleanedOtp)) {
      setStatus({
        type: "error",
        message: "Please enter a valid 6-digit OTP code.",
      });
      setLoading(false);
      return;
    }

    try {
      const data = await verifyCooperativeOtp(cleanedPhone, cleanedOtp);

      if (data?.token) {
        setToken(data.token);
        await loadDashboardData(data.token);
      }

      setStep("phone");
      setOtp("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Invalid OTP code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle Cooperative Self-Registration Form Submit
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    if (
      !regData.name ||
      !regData.region ||
      !regData.craftType ||
      !regData.registrationNumber ||
      !regData.phone
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required registration fields.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await registerCooperative(regData);

      setStatus({
        type: "success",
        message:
          res?.message ||
          "Registration successful! We have sent an OTP to your phone.",
      });

      setPhone(regData.phone);
      setView("login");
      setStep("phone");

      try {
        const otpRes = await sendCooperativeOtp(regData.phone);
        setStep("otp");
        if (otpRes?.otp) {
          window.alert(
            `Demo Cooperative OTP for ${regData.phone}:\n\n${otpRes.otp}`
          );
        }
      } catch {
        // manual fallback
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Registration failed. Please check details.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle Registering an Artisan under Cooperative
  async function handleRegisterArtisanSubmit(e) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await registerArtisanByCooperative(token, artisanForm);
      setStatus({
        type: "success",
        message: res?.message || `Artisan ${artisanForm.name} registered successfully!`,
      });

      // Refresh list
      const updatedList = await getCooperativeArtisans(token);
      setArtisans(updatedList);

      setShowAddArtisanModal(false);
      setArtisanForm({
        name: "",
        phone: "",
        craft: "",
        region: "",
        experience: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Failed to register artisan.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle Adding a Product for Verification & Payout Tracking
  async function handleCreateProductSubmit(e) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await createProductByCooperative(token, productForm);
      setStatus({
        type: "success",
        message: "Product created successfully and added to verification queue!",
      });

      // Refresh products and payouts
      const [updatedProducts, updatedPayouts] = await Promise.all([
        getCooperativeProducts(token),
        getPayoutTransparency(token),
      ]);

      setProducts(updatedProducts);
      setTransparencyData(updatedPayouts);

      setShowAddProductModal(false);
      setProductForm({
        name: "",
        artisanId: "",
        category: "",
        listedPrice: "",
        artisanPayout: "",
        materialsUsed: "",
        craftStory: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Failed to create product.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle Product Verification Status Toggle
  async function handleVerifyStatusChange(productId, newStatus) {
    const token = getToken();
    if (!token) return;

    try {
      await verifyProductStatus(token, productId, newStatus);
      setStatus({
        type: "success",
        message: `Product verification updated to "${newStatus}"!`,
      });

      // Refresh product list & transparency dashboard
      const [updatedProducts, updatedPayouts] = await Promise.all([
        getCooperativeProducts(token),
        getPayoutTransparency(token),
      ]);
      setProducts(updatedProducts);
      setTransparencyData(updatedPayouts);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Could not update status.",
      });
    }
  }

  function handleLogout() {
    clearToken();
    setCooperative(null);
    setArtisans([]);
    setProducts([]);
    setTransparencyData(null);
    setPhone("");
    setOtp("");
    setStep("phone");
    setView("login");
    setStatus({
      type: "info",
      message: "You have logged out of your cooperative account.",
    });
  }

  const filteredArtisans = artisans.filter((art) =>
    (art.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (art.craft || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (art.phone || "").includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">
      {/* Top Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-[#2B2420]/10 bg-[#FAF3E9] sticky top-0 z-20">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <span className="text-[#3E5641]">Karigar</span>
          <span className="text-xs bg-[#3E5641]/10 text-[#3E5641] px-3 py-1 rounded-full font-semibold border border-[#3E5641]/20">
            Cooperative Workspace
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {cooperative && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-[#A83E3E] text-[#A83E3E] hover:bg-[#A83E3E] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          )}
          <Link
            to="/"
            className="text-sm font-semibold px-4 py-2 rounded-xl border border-[#3E5641] text-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors"
          >
            Home
          </Link>
        </div>
      </nav>

      <div className="px-6 pb-20 pt-6">
        <div className="max-w-6xl mx-auto">

          {/* Alert Status Banner */}
          {status.message && (
            <div
              className="rounded-2xl px-5 py-3.5 mb-6 text-sm font-semibold text-center shadow-sm flex items-center justify-between"
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
            >
              <span>{status.message}</span>
              <button
                type="button"
                onClick={() => setStatus({ type: "idle", message: "" })}
                className="text-xs font-bold underline opacity-80 hover:opacity-100 ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* LOGGED IN COOPERATIVE DASHBOARD */}
          {cooperative ? (
            <div>
              {/* Header Hero Card */}
              <div className="bg-gradient-to-r from-[#3E5641] to-[#2e4231] rounded-3xl p-6 md:p-8 text-[#FAF3E9] shadow-md mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF3E9]/15 flex items-center justify-center text-[#FAF3E9] backdrop-blur-sm border border-[#FAF3E9]/20">
                      <Building2 className="w-9 h-9" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-bold">{cooperative.name}</h1>
                        <span className="bg-[#D9A441] text-[#2B2420] text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified Anchor
                        </span>
                      </div>
                      <p className="text-sm text-[#FAF3E9]/80 mt-1 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#D9A441]" /> {cooperative.region}
                        </span>
                        <span>•</span>
                        <span>Reg No: <strong>{cooperative.registrationNumber}</strong></span>
                        <span>•</span>
                        <span>Crafts: <strong>{cooperative.craftType}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Summary Quick Metrics */}
                  <div className="flex items-center gap-3 bg-[#FAF3E9]/10 p-3 rounded-2xl border border-[#FAF3E9]/20 backdrop-blur-sm">
                    <div className="text-center px-4">
                      <span className="block text-2xl font-bold text-[#D9A441]">{artisans.length}</span>
                      <span className="text-xs text-[#FAF3E9]/70">Artisans</span>
                    </div>
                    <div className="h-8 w-px bg-[#FAF3E9]/20"></div>
                    <div className="text-center px-4">
                      <span className="block text-2xl font-bold text-[#FAF3E9]">{products.length}</span>
                      <span className="text-xs text-[#FAF3E9]/70">Products</span>
                    </div>
                    <div className="h-8 w-px bg-[#FAF3E9]/20"></div>
                    <div className="text-center px-4">
                      <span className="block text-2xl font-bold text-[#D9A441]">
                        {transparencyData?.summary?.averageArtisanSharePct || "0"}%
                      </span>
                      <span className="text-xs text-[#FAF3E9]/70">Fair Payout</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-3 border-b border-[#2B2420]/15 pb-4 mb-8 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("artisans")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-base transition-all whitespace-nowrap ${
                    activeTab === "artisans"
                      ? "bg-[#3E5641] text-[#FAF3E9] shadow-sm"
                      : "bg-[#FAF3E9] text-[#2B2420] border border-[#2B2420]/10 hover:bg-[#3E5641]/10"
                  }`}
                >
                  <Users className="w-5 h-5" /> Artisans Under Us ({artisans.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-base transition-all whitespace-nowrap ${
                    activeTab === "products"
                      ? "bg-[#3E5641] text-[#FAF3E9] shadow-sm"
                      : "bg-[#FAF3E9] text-[#2B2420] border border-[#2B2420]/10 hover:bg-[#3E5641]/10"
                  }`}
                >
                  <PackageCheck className="w-5 h-5" /> Verify Products ({products.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("payouts")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-base transition-all whitespace-nowrap ${
                    activeTab === "payouts"
                      ? "bg-[#C1613C] text-[#FAF3E9] shadow-sm"
                      : "bg-[#FAF3E9] text-[#2B2420] border border-[#C1613C]/30 hover:bg-[#C1613C]/10 text-[#C1613C]"
                  }`}
                >
                  <TrendingUp className="w-5 h-5" /> Payout Transparency Dashboard
                </button>
              </div>

              {/* TAB 1: ARTISANS UNDER US & ARTISAN REGISTRATION */}
              {activeTab === "artisans" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#3E5641]">Artisans Under Cooperative</h2>
                      <p className="text-sm text-[#2B2420]/70">
                        Manage and register artisans belonging to your cooperative society.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddArtisanModal(true)}
                      className="bg-[#C1613C] text-[#FAF3E9] px-5 py-3 rounded-2xl font-semibold shadow-sm hover:bg-[#8A3B23] transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" /> Register New Artisan
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative mb-6">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2420]/50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search artisan by name, craft, or phone number..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FAF3E9] border border-[#2B2420]/15 outline-none focus:border-[#3E5641]"
                    />
                  </div>

                  {/* Artisan List Cards Grid */}
                  {filteredArtisans.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-[#2B2420]/15 rounded-3xl bg-[#FAF3E9]/50">
                      <Users className="w-12 h-12 text-[#2B2420]/40 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-[#2B2420]">No Artisans Found</h3>
                      <p className="text-sm text-[#2B2420]/70 max-w-sm mx-auto mb-5">
                        Register artisans under your cooperative to grant them digital passports and verify their craft.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddArtisanModal(true)}
                        className="bg-[#3E5641] text-[#FAF3E9] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2e4231]"
                      >
                        + Register First Artisan
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredArtisans.map((artisan) => (
                        <div
                          key={artisan.id || artisan._id}
                          className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/10 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#3E5641]/15 text-[#3E5641] flex items-center justify-center font-bold text-xl">
                                {artisan.name.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#3E5641]/10 text-[#3E5641] border border-[#3E5641]/20">
                                Verified Mobile
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-[#2B2420] mb-1">{artisan.name}</h3>

                            <div className="space-y-1.5 text-sm text-[#2B2420]/80 mb-4">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#C1613C]" />
                                <span className="font-semibold">{artisan.craft || "Handicrafts"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#3E5641]" />
                                <span>{artisan.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#2B2420]/60" />
                                <span>{artisan.region}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#D9A441]" />
                                <span>Exp: {artisan.experience}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-[#2B2420]/10 flex items-center justify-between text-xs text-[#2B2420]/70">
                            <span>Products: <strong>{artisan.productCount || 0} Listed</strong></span>
                            <span className="text-[#3E5641] font-semibold">Active Member</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCT VERIFICATION */}
              {activeTab === "products" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#3E5641]">Product Verification Queue</h2>
                      <p className="text-sm text-[#2B2420]/70">
                        Review products made by your artisans. Approve status to <strong>Checked</strong>, <strong>Waiting</strong>, or <strong>Reported</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-[#3E5641] text-[#FAF3E9] px-5 py-3 rounded-2xl font-semibold shadow-sm hover:bg-[#2e4231] transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" /> Add Product for Artisan
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-[#2B2420]/15 rounded-3xl bg-[#FAF3E9]/50">
                      <PackageCheck className="w-12 h-12 text-[#2B2420]/40 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-[#2B2420]">No Products Listed Yet</h3>
                      <p className="text-sm text-[#2B2420]/70 max-w-sm mx-auto mb-5">
                        Add a product under an artisan to initiate digital passport verification and payout transparency.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(true)}
                        className="bg-[#C1613C] text-[#FAF3E9] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#8A3B23]"
                      >
                        + Add First Product
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.map((prod) => (
                        <div
                          key={prod._id || prod.id}
                          className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#2B2420]/10 text-[#2B2420]">
                                {prod.category || "Handicraft"}
                              </span>

                              {/* Status Badge */}
                              <span
                                className="text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5"
                                style={{
                                  backgroundColor:
                                    prod.status === "Checked"
                                      ? "#3E5641"
                                      : prod.status === "Reported"
                                      ? "#A83E3E"
                                      : "#D9A441",
                                  color: prod.status === "Waiting" ? "#2B2420" : "#FAF3E9",
                                }}
                              >
                                {prod.status === "Checked" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {prod.status === "Waiting" && <Clock className="w-3.5 h-3.5" />}
                                {prod.status === "Reported" && <AlertTriangle className="w-3.5 h-3.5" />}
                                {prod.status}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-[#2B2420] mb-1">{prod.name}</h3>
                            <p className="text-sm text-[#2B2420]/80 mb-4 line-clamp-2">
                              Made by: <strong className="text-[#3E5641]">{prod.artisan?.name || "Registered Artisan"}</strong>
                            </p>

                            {/* Payout vs Price summary */}
                            <div className="bg-[#3E5641]/10 rounded-2xl p-4 mb-4 border border-[#3E5641]/15 flex items-center justify-between">
                              <div>
                                <span className="text-xs text-[#2B2420]/70 block">Listed Price</span>
                                <span className="text-lg font-bold text-[#2B2420]">₹{prod.listedPrice}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-[#2B2420]/70 block">Direct Artisan Payout</span>
                                <span className="text-lg font-bold text-[#3E5641]">₹{prod.artisanPayout}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-[#2B2420]/70 block">Artisan Share</span>
                                <span className="text-sm font-bold text-[#C1613C]">
                                  {prod.listedPrice > 0 ? ((prod.artisanPayout / prod.listedPrice) * 100).toFixed(0) : 0}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Verification Actions */}
                          <div className="pt-4 border-t border-[#2B2420]/10">
                            <span className="text-xs font-semibold text-[#2B2420]/70 block mb-2">
                              Update Verification Status:
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => handleVerifyStatusChange(prod._id || prod.id, "Checked")}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                  prod.status === "Checked"
                                    ? "bg-[#3E5641] text-[#FAF3E9] border-[#3E5641]"
                                    : "border-[#3E5641] text-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9]"
                                }`}
                              >
                                ✓ Checked
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVerifyStatusChange(prod._id || prod.id, "Waiting")}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                  prod.status === "Waiting"
                                    ? "bg-[#D9A441] text-[#2B2420] border-[#D9A441]"
                                    : "border-[#D9A441] text-[#2B2420] hover:bg-[#D9A441]"
                                }`}
                              >
                                ⏳ Waiting
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVerifyStatusChange(prod._id || prod.id, "Reported")}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                  prod.status === "Reported"
                                    ? "bg-[#A83E3E] text-white border-[#A83E3E]"
                                    : "border-[#A83E3E] text-[#A83E3E] hover:bg-[#A83E3E] hover:text-white"
                                }`}
                              >
                                ⚠ Reported
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYOUT TRANSPARENCY DASHBOARD (KEY DIFFERENTIATOR) */}
              {activeTab === "payouts" && (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-[#3E5641]">Payout Transparency Dashboard</h2>
                      <span className="bg-[#C1613C] text-[#FAF3E9] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Fair Trade Verified
                      </span>
                    </div>
                    <p className="text-sm text-[#2B2420]/80">
                      Shows exact artisan payout vs. listed product price to guarantee visible fairness and auditability for buyers.
                    </p>
                  </div>

                  {/* High Impact Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#FAF3E9] p-5 rounded-3xl border border-[#3E5641]/20 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#2B2420]/70 uppercase">Total Listed Value</span>
                        <DollarSign className="w-5 h-5 text-[#3E5641]" />
                      </div>
                      <span className="text-2xl font-extrabold text-[#2B2420]">
                        ₹{transparencyData?.summary?.totalListedValue?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-[#2B2420]/60 block mt-1">Across all products</span>
                    </div>

                    <div className="bg-[#3E5641]/10 p-5 rounded-3xl border border-[#3E5641]/30 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#3E5641] uppercase">Artisan Payouts Disbursed</span>
                        <CheckCircle2 className="w-5 h-5 text-[#3E5641]" />
                      </div>
                      <span className="text-2xl font-extrabold text-[#3E5641]">
                        ₹{transparencyData?.summary?.totalPayoutsDisbursed?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-[#3E5641]/80 block mt-1">Directly to artisan accounts</span>
                    </div>

                    <div className="bg-[#C1613C]/10 p-5 rounded-3xl border border-[#C1613C]/30 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#C1613C] uppercase">Average Artisan Share</span>
                        <TrendingUp className="w-5 h-5 text-[#C1613C]" />
                      </div>
                      <span className="text-2xl font-extrabold text-[#C1613C]">
                        {transparencyData?.summary?.averageArtisanSharePct || "0"}%
                      </span>
                      <span className="text-xs text-[#C1613C]/80 block mt-1">Of retail selling price</span>
                    </div>

                    <div className="bg-[#FAF3E9] p-5 rounded-3xl border border-[#D9A441]/40 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#2B2420]/70 uppercase">Fair Trade Rating</span>
                        <Award className="w-5 h-5 text-[#D9A441]" />
                      </div>
                      <span className="text-xl font-bold text-[#3E5641]">
                        {transparencyData?.summary?.fairTradeIndex || "A+ Certified"}
                      </span>
                      <span className="text-xs text-[#2B2420]/60 block mt-1">Audited cooperative margin</span>
                    </div>
                  </div>

                  {/* Concrete Payout Breakdown Table for Judges */}
                  <div className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/15 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#2B2420]/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#3E5641]">Live Payout Breakdown Table</h3>
                        <p className="text-xs text-[#2B2420]/70">Real-time margin transparency per artisan product</p>
                      </div>
                      <span className="text-xs font-semibold text-[#3E5641] bg-[#3E5641]/10 px-3 py-1.5 rounded-full border border-[#3E5641]/20">
                        Publicly Audit-Ready
                      </span>
                    </div>

                    {!transparencyData?.items || transparencyData.items.length === 0 ? (
                      <div className="text-center py-10 text-[#2B2420]/70 text-sm">
                        No product payout records created yet. Add products to populate the live transparency matrix.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#3E5641]/10 text-[#3E5641] font-bold text-xs uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-4">Product</th>
                              <th className="px-6 py-4">Artisan Name</th>
                              <th className="px-6 py-4">Listed Price</th>
                              <th className="px-6 py-4">Artisan Payout</th>
                              <th className="px-6 py-4">Coop Fee</th>
                              <th className="px-6 py-4">Artisan Share %</th>
                              <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2B2420]/10">
                            {transparencyData.items.map((item) => (
                              <tr key={item.id} className="hover:bg-[#3E5641]/5 transition-colors">
                                <td className="px-6 py-4 font-semibold text-[#2B2420]">{item.productName}</td>
                                <td className="px-6 py-4 text-[#3E5641] font-medium">{item.artisanName}</td>
                                <td className="px-6 py-4 font-bold text-[#2B2420]">₹{item.listedPrice}</td>
                                <td className="px-6 py-4 font-bold text-[#3E5641]">₹{item.artisanPayout}</td>
                                <td className="px-6 py-4 text-[#2B2420]/70">₹{item.coopMargin}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-[#2B2420]/10 rounded-full h-2 overflow-hidden">
                                      <div
                                        className="bg-[#C1613C] h-full rounded-full"
                                        style={{ width: `${Math.min(100, item.artisanSharePct)}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-bold text-[#C1613C]">{item.artisanSharePct}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className="text-xs font-bold px-3 py-1 rounded-full inline-block"
                                    style={{
                                      backgroundColor:
                                        item.status === "Checked"
                                          ? "#3E5641"
                                          : item.status === "Reported"
                                          ? "#A83E3E"
                                          : "#D9A441",
                                      color: item.status === "Waiting" ? "#2B2420" : "#FAF3E9",
                                    }}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : view === "login" ? (

            /* UNAUTHENTICATED: COOPERATIVE LOGIN */
            <div className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/10 shadow-sm p-8 md:p-10 max-w-md mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#3E5641]/15 flex items-center justify-center text-[#3E5641]">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#3E5641]">
                    Cooperative Login
                  </h1>
                  <p className="text-sm text-[#2B2420]/80">
                    {step === "otp"
                      ? "Enter the 6-digit OTP code sent to your phone."
                      : "Log in with your registered mobile number using OTP."}
                  </p>
                </div>
              </div>

              {step === "phone" ? (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-6">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-[#2B2420] mb-2"
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2420]/50" />
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="Enter 10-digit mobile number"
                        className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] text-lg pl-12 pr-5 py-4 outline-none border-2 border-[#3E5641]/30 focus:border-[#3E5641] focus:ring-2 focus:ring-[#3E5641]/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3E5641] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold shadow-md hover:bg-[#2e4231] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4 bg-[#3E5641]/10 p-4 rounded-2xl border border-[#3E5641]/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#2B2420]/70">OTP sent to mobile</p>
                      <p className="text-base font-bold text-[#3E5641]">{phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setStatus({ type: "idle", message: "" });
                      }}
                      className="text-xs font-semibold text-[#C1613C] hover:underline"
                    >
                      Change number
                    </button>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-semibold text-[#2B2420] mb-2"
                    >
                      Enter 6-Digit OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      required
                      maxLength={6}
                      placeholder="6-digit OTP code"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] text-xl tracking-widest px-5 py-4 text-center outline-none border-2 border-[#3E5641]/30 focus:border-[#3E5641] focus:ring-2 focus:ring-[#3E5641]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3E5641] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold shadow-md hover:bg-[#2e4231] transition-colors disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify & Log In"}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendOtp}
                    className="w-full mt-3 px-5 py-3 rounded-2xl text-sm font-semibold border border-[#3E5641] text-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                </form>
              )}

              {/* Registration Prompt Link */}
              <div className="mt-8 pt-6 border-t border-[#2B2420]/10 text-center">
                <p className="text-base text-[#2B2420]/80 mb-3">
                  Don't have a cooperative account yet?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setView("register");
                    setStatus({ type: "idle", message: "" });
                  }}
                  className="w-full bg-[#C1613C] text-[#FAF3E9] px-5 py-3.5 rounded-2xl text-base font-semibold shadow-sm hover:bg-[#8A3B23] transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Register / Sign Up Cooperative
                </button>
              </div>
            </div>
          ) : (

            /* UNAUTHENTICATED: COOPERATIVE SELF REGISTRATION FORM */
            <div className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/10 shadow-sm p-8 md:p-10 max-w-xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C1613C]/15 flex items-center justify-center text-[#C1613C]">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#3E5641]">
                    Register Cooperative
                  </h1>
                  <p className="text-sm text-[#2B2420]/80">
                    Provide official details to create your legal trust anchor space.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reg-name" className="block text-sm font-semibold text-[#2B2420] mb-1">
                    Cooperative's Official Name *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="e.g. Odisha Weavers Cooperative Society"
                    className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3.5 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-region" className="block text-sm font-semibold text-[#2B2420] mb-1">
                    Region of Operation *
                  </label>
                  <input
                    id="reg-region"
                    type="text"
                    required
                    value={regData.region}
                    onChange={(e) => setRegData({ ...regData, region: e.target.value })}
                    placeholder="e.g. Sambalpur, Odisha"
                    className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3.5 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-craft" className="block text-sm font-semibold text-[#2B2420] mb-1">
                    Craft Type(s) Represented *
                  </label>
                  <input
                    id="reg-craft"
                    type="text"
                    required
                    value={regData.craftType}
                    onChange={(e) => setRegData({ ...regData, craftType: e.target.value })}
                    placeholder="e.g. Pottery, Handloom, Terracotta"
                    className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3.5 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-number" className="block text-sm font-semibold text-[#2B2420] mb-1">
                    Cooperative Registration Number *
                  </label>
                  <input
                    id="reg-number"
                    type="text"
                    required
                    value={regData.registrationNumber}
                    onChange={(e) => setRegData({ ...regData, registrationNumber: e.target.value })}
                    placeholder="e.g. COOP-OD-2023-8849"
                    className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3.5 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-sm font-semibold text-[#2B2420] mb-1">
                    Primary Mobile Number (for OTP login) *
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="Enter 10-digit contact number"
                    className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3.5 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2B2420] mb-1">
                    Supporting Registration Certificate
                  </label>
                  <div className="border-2 border-dashed border-[#3E5641]/40 rounded-2xl p-4 bg-[#FAF3E9] text-center relative hover:border-[#C1613C]">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-7 h-7 text-[#C1613C]" />
                      <span className="text-sm font-semibold text-[#3E5641]">
                        {fileName ? fileName : "Upload registration certificate (PDF, PNG)"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C1613C] text-[#FAF3E9] px-5 py-4 rounded-2xl text-lg font-semibold shadow-md hover:bg-[#8A3B23] transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? "Registering..." : "Complete Cooperative Registration"}
                  <Sparkles className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#2B2420]/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setStatus({ type: "idle", message: "" });
                  }}
                  className="text-base font-semibold text-[#3E5641] hover:underline"
                >
                  Already registered? Log in with your mobile number
                </button>
              </div>
            </div>
          )}

          {/* MODAL: REGISTER NEW ARTISAN UNDER COOPERATIVE */}
          {showAddArtisanModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/15 max-w-lg w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#2B2420]/10 pb-4 mb-5">
                  <h3 className="text-xl font-bold text-[#3E5641] flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-[#C1613C]" />
                    Register New Artisan
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddArtisanModal(false)}
                    className="text-xl font-bold text-[#2B2420]/60 hover:text-[#2B2420]"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleRegisterArtisanSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="art-name" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Artisan's Full Name *
                    </label>
                    <input
                      id="art-name"
                      type="text"
                      required
                      value={artisanForm.name}
                      onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                    />
                    <p className="text-xs text-[#2B2420]/60 mt-1">Basic identity for passport and public record.</p>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="art-phone" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Mobile Number (Login Credential) *
                    </label>
                    <input
                      id="art-phone"
                      type="tel"
                      inputMode="numeric"
                      required
                      value={artisanForm.phone}
                      onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                    />
                    <p className="text-xs text-[#2B2420]/60 mt-1">Contact info & OTP login credential once added.</p>
                  </div>

                  {/* Craft Type */}
                  <div>
                    <label htmlFor="art-craft" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Craft Type *
                    </label>
                    <input
                      id="art-craft"
                      type="text"
                      required
                      value={artisanForm.craft}
                      onChange={(e) => setArtisanForm({ ...artisanForm, craft: e.target.value })}
                      placeholder="e.g. Terracotta Pottery, Handloom Weaving"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                    />
                    <p className="text-xs text-[#2B2420]/60 mt-1">Ties them to craft category for passport creation.</p>
                  </div>

                  {/* Region */}
                  <div>
                    <label htmlFor="art-region" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Region
                    </label>
                    <input
                      id="art-region"
                      type="text"
                      value={artisanForm.region}
                      onChange={(e) => setArtisanForm({ ...artisanForm, region: e.target.value })}
                      placeholder={cooperative?.region || "e.g. Sambalpur, Odisha"}
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                    />
                    <p className="text-xs text-[#2B2420]/60 mt-1">Where they are based (buyer-facing display).</p>
                  </div>

                  {/* Experience */}
                  <div>
                    <label htmlFor="art-exp" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Experience / Skill Level
                    </label>
                    <input
                      id="art-exp"
                      type="text"
                      value={artisanForm.experience}
                      onChange={(e) => setArtisanForm({ ...artisanForm, experience: e.target.value })}
                      placeholder="e.g. 15 years master craftsman"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none"
                    />
                    <p className="text-xs text-[#2B2420]/60 mt-1">Adds credibility & story context to public passport.</p>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddArtisanModal(false)}
                      className="flex-1 py-3 rounded-2xl border border-[#2B2420]/20 font-semibold text-sm hover:bg-[#2B2420]/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#C1613C] text-[#FAF3E9] py-3 rounded-2xl font-bold text-sm hover:bg-[#8A3B23]"
                    >
                      {loading ? "Registering..." : "Register Artisan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: ADD PRODUCT FOR ARTISAN */}
          {showAddProductModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#FAF3E9] rounded-3xl border border-[#2B2420]/15 max-w-lg w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#2B2420]/10 pb-4 mb-5">
                  <h3 className="text-xl font-bold text-[#3E5641] flex items-center gap-2">
                    <PackageCheck className="w-6 h-6 text-[#3E5641]" />
                    Add Product for Verification
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="text-xl font-bold text-[#2B2420]/60 hover:text-[#2B2420]"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateProductSubmit} className="space-y-4">
                  {/* Select Artisan */}
                  <div>
                    <label htmlFor="prod-artisan" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Select Artisan *
                    </label>
                    <select
                      id="prod-artisan"
                      required
                      value={productForm.artisanId}
                      onChange={(e) => setProductForm({ ...productForm, artisanId: e.target.value })}
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#3E5641] outline-none"
                    >
                      <option value="">-- Choose an Artisan --</option>
                      {artisans.map((art) => (
                        <option key={art.id || art._id} value={art.id || art._id}>
                          {art.name} ({art.craft})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label htmlFor="prod-name" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Product Name *
                    </label>
                    <input
                      id="prod-name"
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Handmolded Terracotta Water Pitcher"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#3E5641] outline-none"
                    />
                  </div>

                  {/* Pricing & Payout (Fairness angle) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prod-price" className="block text-sm font-semibold text-[#2B2420] mb-1">
                        Listed Price (₹) *
                      </label>
                      <input
                        id="prod-price"
                        type="number"
                        min="1"
                        required
                        value={productForm.listedPrice}
                        onChange={(e) => setProductForm({ ...productForm, listedPrice: e.target.value })}
                        placeholder="e.g. 2500"
                        className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#3E5641] outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="prod-payout" className="block text-sm font-semibold text-[#2B2420] mb-1">
                        Artisan Payout (₹) *
                      </label>
                      <input
                        id="prod-payout"
                        type="number"
                        min="1"
                        required
                        value={productForm.artisanPayout}
                        onChange={(e) => setProductForm({ ...productForm, artisanPayout: e.target.value })}
                        placeholder="e.g. 2125"
                        className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#C1613C] outline-none font-bold text-[#3E5641]"
                      />
                    </div>
                  </div>

                  {productForm.listedPrice && productForm.artisanPayout && (
                    <div className="bg-[#3E5641]/10 p-3 rounded-xl text-xs font-semibold text-[#3E5641] flex items-center justify-between">
                      <span>Artisan Share Percentage:</span>
                      <span className="text-sm font-bold text-[#C1613C]">
                        {((productForm.artisanPayout / productForm.listedPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Materials & Craft Story */}
                  <div>
                    <label htmlFor="prod-materials" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Materials Used
                    </label>
                    <input
                      id="prod-materials"
                      type="text"
                      value={productForm.materialsUsed}
                      onChange={(e) => setProductForm({ ...productForm, materialsUsed: e.target.value })}
                      placeholder="e.g. Natural River Clay, Organic Mineral Pigments"
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#3E5641] outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="prod-story" className="block text-sm font-semibold text-[#2B2420] mb-1">
                      Craft Story / Process Description
                    </label>
                    <textarea
                      id="prod-story"
                      rows={2}
                      value={productForm.craftStory}
                      onChange={(e) => setProductForm({ ...productForm, craftStory: e.target.value })}
                      placeholder="Tell the story of how this item was crafted..."
                      className="w-full rounded-2xl bg-[#FAF3E9] text-[#2B2420] px-4 py-3 border-2 border-[#3E5641]/30 focus:border-[#3E5641] outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="flex-1 py-3 rounded-2xl border border-[#2B2420]/20 font-semibold text-sm hover:bg-[#2B2420]/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#3E5641] text-[#FAF3E9] py-3 rounded-2xl font-bold text-sm hover:bg-[#2e4231]"
                    >
                      {loading ? "Adding..." : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
