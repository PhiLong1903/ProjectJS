const STATUS_LABELS = {
  PENDING: "Dang cho tiep nhan",
  REVIEWING: "Dang xem xet",
  ACCEPTED: "Da duoc chap nhan",
  REJECTED: "Da bi tu choi",
};

const buildRecruitmentFeedbackMessage = (input) => {
  const applicantName = input.fullName ?? "Ung vien";
  const statusLabel = STATUS_LABELS[input.status] ?? input.status;
  const baseLine = `Ho so cua ban hien o trang thai: ${statusLabel}.`;
  const feedbackLine = input.feedbackMessage?.trim()
    ? `Phan hoi tu benh vien: ${input.feedbackMessage.trim()}`
    : "Chung toi se lien he them neu can bo sung thong tin.";

  return `${applicantName}, ${baseLine}\n${feedbackLine}`;
};

const sendRecruitmentFeedbackEmail = async (input) => {
  const content = buildRecruitmentFeedbackMessage(input);

  // Demo mode: log email output for do an.
  // This function can be replaced by real SMTP provider later.
  console.log(
    `[recruitment][email] to=${input.toEmail} status=${input.status} subject="${input.subject}" content="${content}"`
  );

  return {
    delivered: true,
    channel: "console",
  };
};

exports.sendRecruitmentFeedbackEmail = sendRecruitmentFeedbackEmail;
