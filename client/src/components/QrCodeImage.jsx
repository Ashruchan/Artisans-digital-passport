/** Simple QR display without extra npm packages. */
export default function QrCodeImage({ value, size = 240, label = "QR code" }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${encodeURIComponent(
    value || ""
  )}`;

  return (
    <img
      src={src}
      alt={label}
      width={size}
      height={size}
      className="mx-auto rounded-2xl bg-white p-2 border border-[#2B2420]/10"
    />
  );
}
