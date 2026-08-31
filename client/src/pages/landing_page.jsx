import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Hammer,
  ScanLine,
  ShieldCheck,
  User,
  Users,
  Search,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import heroArt from "../photo/34c908af-b9bf-47c4-aa73-e01cabe5c1de.png";

export default function Landing() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [passportId, setPassportId] = useState("");
  const [checkError, setCheckError] = useState("");

  // --------------------------------------------------
  // TYPING SLOGAN
  // --------------------------------------------------

  const slogans = [
    t("hero.slogan"),
    t("hero.sloganAlt"),
  ];

  const [sloganIndex, setSloganIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Reset animation whenever language changes
    setSloganIndex(0);
    setDisplayText("");
    setIsDeleting(false);
  }, [i18n.language]);

  useEffect(() => {
    const currentSlogan = slogans[sloganIndex] || "";

    const typingSpeed = isDeleting ? 45 : 75;

    const timer = setTimeout(() => {
      // -----------------------------
      // TYPING
      // -----------------------------
      if (!isDeleting) {
        const nextText = currentSlogan.substring(
          0,
          displayText.length + 1
        );

        setDisplayText(nextText);

        // Finished typing
        if (nextText.length === currentSlogan.length) {
          setTimeout(() => {
            setIsDeleting(true);
          }, 1800);
        }
      }

      // -----------------------------
      // DELETING
      // -----------------------------
      else {
        const nextText = currentSlogan.substring(
          0,
          displayText.length - 1
        );

        setDisplayText(nextText);

        // Finished deleting
        if (nextText.length === 0) {
          setIsDeleting(false);

          setSloganIndex((prev) => {
            return (prev + 1) % slogans.length;
          });
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [
    displayText,
    isDeleting,
    sloganIndex,
    i18n.language,
    slogans,
  ]);

  // --------------------------------------------------
  // CHECK PRODUCT
  // --------------------------------------------------

  function handleCheckProduct(e) {
    e.preventDefault();

    const id = passportId.trim();

    if (!id) {
      setCheckError(t("checkProduct.enterId"));
      return;
    }

    setCheckError("");

    navigate(`/passport/${id}`);
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="relative min-h-screen text-[#2B2420] font-body">
      {/* --------------------------------------------
          BACKGROUND IMAGE
      --------------------------------------------- */}

      <div
        className="fixed inset-0 z-0 bg-[#F7F0E6] bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${heroArt})`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">

        {/* --------------------------------------------
            NAVBAR
        --------------------------------------------- */}

        <nav className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-4 bg-[#F7F0E6]/65 backdrop-blur-md border-b border-[#2B2420]/10">

          <Link
            to="/"
            className="text-[1.75rem] sm:text-3xl font-bold text-[#2F4A32] font-display tracking-tight"
            aria-label="Karigar home"
          >
            Karigar
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#how-it-works"
              className="text-base font-semibold text-[#2F4A32] hover:text-[#B3542D] transition-colors"
            >
              {t("nav.howItWorks")}
            </a>
            <LanguageSwitcher />
          </div>
        </nav>

        {/* --------------------------------------------
            HERO
        --------------------------------------------- */}

        <section className="px-5 sm:px-6 pt-8 sm:pt-14 pb-16 sm:pb-20 text-center">

          <h1
            className="
              text-[2rem]
              leading-tight
              sm:text-4xl
              md:text-5xl
              font-bold
              text-[#2F4A32]
              font-display
              max-w-2xl
              mx-auto
              min-h-[5rem]
              sm:min-h-[7rem]
              flex
              items-center
              justify-center
            "
          >
            <span>
              {displayText}

              <span className="animate-pulse ml-1">
                |
              </span>
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#2B2420]/85 max-w-md mx-auto">
            {t("hero.description")}
          </p>

          {/* BUTTONS */}

          <div className="mt-10 flex flex-col gap-3.5 max-w-sm mx-auto w-full">

            {/* ARTISAN */}

            <Link
              to="/artisan"
              className="
                inline-flex
                items-center
                justify-center
                gap-3
                w-full
                bg-[#B3542D]
                text-white
                px-6
                py-4
                rounded-2xl
                text-lg
                font-semibold
                shadow-sm
                hover:bg-[#8A3B23]
                transition-colors
              "
            >
              <User
                className="w-5 h-5 shrink-0"
                strokeWidth={2.25}
              />

              {t("home.artisan")}
            </Link>

            {/* COOPERATIVE */}

            <Link
              to="/cooperative"
              className="
                inline-flex
                items-center
                justify-center
                gap-3
                w-full
                bg-[#2F4A32]
                text-white
                px-6
                py-4
                rounded-2xl
                text-lg
                font-semibold
                shadow-sm
                hover:opacity-90
                transition-opacity
              "
            >
              <Users
                className="w-5 h-5 shrink-0"
                strokeWidth={2.25}
              />

              {t("home.cooperative")}
            </Link>

            {/* CHECK PRODUCT */}

            <a
              href="#check"
              className="
                inline-flex
                items-center
                justify-center
                gap-3
                w-full
                bg-white/90
                text-[#2B2420]
                px-6
                py-4
                rounded-2xl
                text-lg
                font-semibold
                border-2
                border-[#B3542D]
                hover:bg-[#B3542D]/10
                transition-colors
              "
            >
              <Search
                className="w-5 h-5 shrink-0"
                strokeWidth={2.25}
              />

              {t("home.checkProduct")}
            </a>

          </div>
        </section>

        {/* --------------------------------------------
            FEATURES
        --------------------------------------------- */}

        <section className="px-5 sm:px-6 pb-12">

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">

            <FeatureCard
              icon={<Hammer className="w-7 h-7" />}
              title={t("features.story.title")}
              description={t("features.story.description")}
            />

            <FeatureCard
              icon={<ScanLine className="w-7 h-7" />}
              title={t("features.qr.title")}
              description={t("features.qr.description")}
            />

            <FeatureCard
              icon={<ShieldCheck className="w-7 h-7" />}
              title={t("features.labels.title")}
              description={t("features.labels.description")}
            />

          </div>

        </section>

        {/* --------------------------------------------
            CHECK PRODUCT
        --------------------------------------------- */}

        <section
          id="check"
          className="px-5 sm:px-6 pb-14"
        >

          <form
            onSubmit={handleCheckProduct}
            className="
              max-w-md
              mx-auto
              rounded-3xl
              border
              border-[#2B2420]/10
              bg-white/90
              p-6
              sm:p-8
              shadow-sm
            "
          >

            <h2 className="
              text-2xl
              font-bold
              text-[#2F4A32]
              font-display
              text-center
              mb-2
            ">
              {t("checkProduct.title")}
            </h2>

            <p className="
              text-center
              text-[#2B2420]/75
              mb-6
            ">
              {t("checkProduct.description")}
            </p>

            <input
              value={passportId}
              onChange={(e) => {
                setPassportId(e.target.value);
                setCheckError("");
              }}
              placeholder={t("checkProduct.placeholder")}
              className="
                w-full
                rounded-2xl
                border-2
                border-[#2F4A32]/25
                bg-[#F7F0E6]
                px-5
                py-4
                text-lg
                outline-none
                focus:border-[#B3542D]
              "
            />

            {checkError ? (
              <p className="
                mt-3
                text-sm
                font-semibold
                text-[#A83E3E]
              ">
                {checkError}
              </p>
            ) : null}

            <button
              type="submit"
              className="
                mt-4
                w-full
                bg-[#B3542D]
                text-white
                px-6
                py-4
                rounded-2xl
                text-lg
                font-semibold
                hover:bg-[#8A3B23]
                transition-colors
              "
            >
              {t("checkProduct.button")}
            </button>

          </form>

        </section>

        {/* --------------------------------------------
            PRODUCT STATUS
        --------------------------------------------- */}

        <section
          id="status"
          className="px-5 sm:px-6 pb-14"
        >

          <div className="max-w-5xl mx-auto">

            <h2 className="
              text-3xl
              font-bold
              text-center
              mb-8
              text-[#2F4A32]
              font-display
            ">
              {t("status.title")}
            </h2>

            <div className="
              flex
              flex-col
              sm:flex-row
              gap-4
              justify-center
            ">

              <StatusBadge
                label={t("status.checked")}
                bg="#2F4A32"
                fg="#F7F0E6"
              />

              <StatusBadge
                label={t("status.waiting")}
                bg="#D9A441"
                fg="#2B2420"
              />

              <StatusBadge
                label={t("status.reported")}
                bg="#A83E3E"
                fg="#F7F0E6"
              />

            </div>

          </div>

        </section>

        {/* --------------------------------------------
            HOW IT WORKS
        --------------------------------------------- */}

        <section
          id="how-it-works"
          className="py-16 sm:py-20 px-5 sm:px-6"
        >

          <div className="
            max-w-5xl
            mx-auto
            rounded-3xl
            bg-white/80
            border
            border-[#2B2420]/10
            p-8
            sm:p-12
          ">

            <h2 className="
              text-3xl
              font-bold
              text-center
              mb-12
              text-[#2F4A32]
              font-display
            ">
              {t("howItWorks.title")}
            </h2>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-4
              gap-8
              text-center
            ">

              <Step
                number="1"
                text={t("howItWorks.step1")}
              />

              <Step
                number="2"
                text={t("howItWorks.step2")}
              />

              <Step
                number="3"
                text={t("howItWorks.step3")}
              />

              <Step
                number="4"
                text={t("howItWorks.step4")}
              />

            </div>

          </div>

        </section>

        {/* --------------------------------------------
            FOOTER
        --------------------------------------------- */}

        <footer className="
          bg-[#2F4A32]/95
          text-[#F7F0E6]
          text-center
          py-8
          text-base
        ">
          {t("footer")}
        </footer>

      </div>
    </div>
  );
}


// ======================================================
// STEP COMPONENT
// ======================================================

function Step({ number, text }) {
  return (
    <div className="
      flex
      flex-col
      items-center
      gap-3
      flex-1
    ">

      <div className="
        w-12
        h-12
        rounded-full
        bg-[#D9A441]
        text-[#2B2420]
        flex
        items-center
        justify-center
        text-lg
        font-bold
      ">
        {number}
      </div>

      <p className="
        text-base
        text-[#2B2420]/80
      ">
        {text}
      </p>

    </div>
  );
}


// ======================================================
// FEATURE CARD
// ======================================================

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="
      rounded-3xl
      border
      border-[#2B2420]/10
      bg-white/90
      p-7
      shadow-[0_8px_24px_rgba(43,36,32,0.08)]
    ">

      <div className="
        w-12
        h-12
        rounded-2xl
        bg-[#B3542D]/12
        text-[#B3542D]
        flex
        items-center
        justify-center
        mb-5
      ">
        {icon}
      </div>

      <h3 className="
        font-bold
        text-xl
        mb-2
        text-[#B3542D]
      ">
        {title}
      </h3>

      <p className="
        text-base
        text-[#2B2420]/80
      ">
        {description}
      </p>

    </div>
  );
}


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  label,
  bg,
  fg,
}) {
  return (
    <div
      className="
        rounded-2xl
        px-8
        py-5
        text-lg
        font-semibold
        shadow-sm
        text-center
      "
      style={{
        backgroundColor: bg,
        color: fg,
      }}
    >
      {label}
    </div>
  );
}