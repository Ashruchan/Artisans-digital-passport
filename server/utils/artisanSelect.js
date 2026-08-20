/** Fields that should never be returned in API responses */
const ARTISAN_SENSITIVE_EXCLUDE =
  "-password -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt";

/** Fields needed when reading/updating OTP state */
const ARTISAN_OTP_SELECT =
  "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt";

module.exports = {
  ARTISAN_SENSITIVE_EXCLUDE,
  ARTISAN_OTP_SELECT,
};
