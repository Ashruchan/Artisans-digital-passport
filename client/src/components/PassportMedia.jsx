import { Package } from "lucide-react";

/** Passport hero media — video on detail pages, poster in lists. */
export default function PassportMedia({
  passport,
  mode = "detail",
  className = "",
  fallbackClassName = "",
}) {
  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const apiBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "";
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const poster = getFullUrl(passport?.posterUrl || passport?.imageUrl);
  const video = getFullUrl(passport?.videoUrl);

  if (mode === "detail" && video) {
    return (
      <video
        src={video}
        poster={poster || undefined}
        controls
        preload="metadata"
        playsInline
        className={className}
      />
    );
  }

  if (poster) {
    return <img src={poster} alt="" className={className} />;
  }

  return (
    <Package
      className={fallbackClassName || "w-16 h-16 text-[#3E5641]/40"}
    />
  );
}
