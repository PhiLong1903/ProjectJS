const sendPasswordResetEmail = async (input) => {
  const { toEmail, fullName, resetLink, expiresInMinutes } = input;

  // Demo fallback: log reset link to server console.
  // Can be replaced by SMTP provider later without touching auth flow.
  console.log(
    `[auth][forgot-password] reset-link for ${toEmail} (${fullName ?? "user"}) expires in ${expiresInMinutes} minutes: ${resetLink}`
  );
};

module.exports = {
  sendPasswordResetEmail,
};
