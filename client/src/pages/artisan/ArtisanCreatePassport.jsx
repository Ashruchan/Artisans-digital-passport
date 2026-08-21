import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { createArtisanProduct } from "../../api/client";
import QrCodeImage from "../../components/QrCodeImage";
import {
  getArtisanToken,
  passportPublicUrl,
  readImageAsDataUrl,
} from "../../utils/artisanAuth";

const STEPS = [
  { key: "photo", title: "Add photo", hint: "Take or choose a product photo" },
  { key: "name", title: "Product name", hint: "What is this product called?" },
  { key: "craft", title: "Craft type", hint: "What craft is this?" },
  { key: "materials", title: "Materials", hint: "What did you use to make it?" },
  { key: "region", title: "Location", hint: "Where was it made?" },
  { key: "story", title: "Your story", hint: "A short story about this piece" },
  { key: "price", title: "Price (optional)", hint: "List price and your share" },
];

const emptyForm = {
  imageUrl: "",
  name: "",
  category: "",
  materialsUsed: "",
  region: "",
  craftStory: "",
  listedPrice: "",
  artisanPayout: "",
};

export default function ArtisanCreatePassport() {
  const { artisan } = useOutletContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    category: artisan?.craft || "",
    region: artisan?.region || "",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canContinue = useMemo(() => {
    if (step.key === "name") return Boolean(form.name.trim());
    if (step.key === "craft") return Boolean(form.category.trim());
    return true;
  }, [step.key, form.name, form.category]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const dataUrl = await readImageAsDataUrl(file);
      updateField("imageUrl", dataUrl);
    } catch (err) {
      setError(err?.message || "Could not add photo.");
    }
  }

  function goNext() {
    setError("");
    if (!canContinue) {
      setError("Please fill this step before continuing.");
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      submitPassport();
    }
  }

  function goBack() {
    setError("");
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function submitPassport() {
    const token = getArtisanToken();
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        materialsUsed: form.materialsUsed.trim(),
        region: form.region.trim(),
        craftStory: form.craftStory.trim(),
        description: form.craftStory.trim(),
        imageUrl: form.imageUrl,
        listedPrice: form.listedPrice === "" ? 0 : Number(form.listedPrice),
        artisanPayout:
          form.artisanPayout === ""
            ? form.listedPrice === ""
              ? 0
              : Number(form.listedPrice)
            : Number(form.artisanPayout),
      };

      const res = await createArtisanProduct(token, payload);
      setCreated(res?.product || null);
    } catch (err) {
      setError(err?.message || "Could not create passport. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const passportId = created.passportId || created.id;
    const url = passportPublicUrl(passportId);

    return (
      <div className="space-y-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-[#3E5641] mx-auto" />
        <h1 className="text-3xl font-bold text-[#3E5641]">Passport ready!</h1>
        <p className="text-lg text-[#2B2420]/80">Your product passport was created.</p>

        <div className="rounded-3xl border border-[#2B2420]/10 p-6 bg-[#FAF3E9] text-left space-y-3">
          <p className="text-base text-[#2B2420]/70">Passport ID</p>
          <p className="text-lg font-bold break-all text-[#2B2420]">{passportId}</p>
          <p className="text-base text-[#2B2420]/70 mt-4">Product</p>
          <p className="text-2xl font-bold text-[#3E5641]">{created.name}</p>
        </div>

        <div className="rounded-3xl border border-[#2B2420]/10 p-6 bg-white">
          <QrCodeImage value={url} size={220} label="Product QR code" />
        </div>

        <Link
          to={`/passport/${passportId}`}
          className="inline-flex items-center justify-center gap-2 w-full bg-[#C1613C] text-[#FAF3E9] px-6 py-4 rounded-2xl text-lg font-semibold"
        >
          <Eye className="w-5 h-5" />
          View passport
        </Link>

        <button
          type="button"
          onClick={() => {
            setCreated(null);
            setForm({
              ...emptyForm,
              category: artisan?.craft || "",
              region: artisan?.region || "",
            });
            setStepIndex(0);
          }}
          className="w-full px-6 py-4 rounded-2xl text-lg font-semibold border-2 border-[#3E5641] text-[#3E5641]"
        >
          Create another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#3E5641]">Create Passport</h1>
        <p className="text-lg text-[#2B2420]/80 mt-1">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <div className="mt-4 h-3 rounded-full bg-[#2B2420]/10 overflow-hidden">
          <div
            className="h-full bg-[#C1613C] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-[#2B2420]/10 p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#2B2420] mb-1">{step.title}</h2>
        <p className="text-base text-[#2B2420]/75 mb-6">{step.hint}</p>

        {step.key === "photo" ? (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center gap-3 min-h-[12rem] rounded-3xl border-2 border-dashed border-[#3E5641]/40 bg-[#3E5641]/5 cursor-pointer px-4 py-8">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt=""
                  className="max-h-56 rounded-2xl object-cover"
                />
              ) : (
                <>
                  <Camera className="w-12 h-12 text-[#C1613C]" />
                  <span className="text-lg font-semibold text-[#3E5641]">
                    Tap to add photo
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
            {form.imageUrl ? (
              <button
                type="button"
                onClick={() => updateField("imageUrl", "")}
                className="text-base font-semibold text-[#C1613C]"
              >
                Remove photo
              </button>
            ) : null}
          </div>
        ) : null}

        {step.key === "name" ? (
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
            placeholder="e.g. Terracotta water pot"
            autoFocus
          />
        ) : null}

        {step.key === "craft" ? (
          <input
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
            placeholder="e.g. Pottery"
            autoFocus
          />
        ) : null}

        {step.key === "materials" ? (
          <textarea
            value={form.materialsUsed}
            onChange={(e) => updateField("materialsUsed", e.target.value)}
            rows={4}
            className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
            placeholder="e.g. Natural clay, plant dyes"
            autoFocus
          />
        ) : null}

        {step.key === "region" ? (
          <input
            value={form.region}
            onChange={(e) => updateField("region", e.target.value)}
            className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
            placeholder="e.g. Sambalpur, Odisha"
            autoFocus
          />
        ) : null}

        {step.key === "story" ? (
          <textarea
            value={form.craftStory}
            onChange={(e) => updateField("craftStory", e.target.value)}
            rows={5}
            className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
            placeholder="Tell buyers how you made it"
            autoFocus
          />
        ) : null}

        {step.key === "price" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold mb-2">
                Selling price (₹)
              </label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={form.listedPrice}
                onChange={(e) => updateField("listedPrice", e.target.value)}
                className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
                placeholder="e.g. 2500"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-2">
                You receive (₹)
              </label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={form.artisanPayout}
                onChange={(e) => updateField("artisanPayout", e.target.value)}
                className="w-full rounded-2xl border-2 border-[#3E5641]/30 px-5 py-4 text-lg outline-none focus:border-[#C1613C]"
                placeholder="e.g. 2125"
              />
            </div>
            <p className="text-sm text-[#2B2420]/70">
              You can leave these blank for now.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-2xl bg-[#A83E3E] text-[#FAF3E9] px-4 py-3 font-semibold">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0 || loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-lg font-semibold border-2 border-[#3E5641] text-[#3E5641] disabled:opacity-40"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={loading || !canContinue}
          className="flex-[1.4] inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-lg font-semibold bg-[#C1613C] text-[#FAF3E9] disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : stepIndex === STEPS.length - 1
              ? "Create"
              : "Next"}
          {stepIndex < STEPS.length - 1 ? (
            <ChevronRight className="w-5 h-5" />
          ) : null}
        </button>
      </div>
    </div>
  );
}
