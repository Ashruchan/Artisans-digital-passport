/**
 * Normalize Indian phone numbers to +91XXXXXXXXXX format.
 * Accepts 10-digit local or 12-digit with country code.
 */
const normalizePhone = (phone) => {
  if (!phone) return null;

  let cleaned = String(phone).replace(/\D/g, "");

  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  return null;
};

module.exports = { normalizePhone };
