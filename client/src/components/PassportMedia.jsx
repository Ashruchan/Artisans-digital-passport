import { Package } from "lucide-react";

/** Passport hero media — video on detail pages, poster in lists. */
export default function PassportMedia({
  passport,
  mode = "detail",
  className = "",
  fallbackClassName = "",
}) {
  const poster = passport?.posterUrl || passport?.imageUrl;
  const video = passport?.videoUrl;

  if (mode === "detail" && video) {
    return (
      <video
        src={video}
        poster={poster || undefined}
        controls
        preload="none"
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
