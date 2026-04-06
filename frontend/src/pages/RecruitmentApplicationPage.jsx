import { useMemo, useState } from "react";
import { publicApi } from "../lib/api";

const toTitleCase = (value) => {
  if (!value) {
    return "";
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const defaultPositionFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const position = params.get("position");
  return toTitleCase(position ?? "");
};

export const RecruitmentApplicationPage = () => {
  const initialPosition = useMemo(() => defaultPositionFromQuery(), []);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    appliedPosition: initialPosition,
    yearsExperience: "",
    currentWorkplace: "",
    expectedSalary: "",
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const onChangeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!cvFile) {
      setFeedback({ type: "error", message: "Vui lòng tải lên CV định dạng PDF." });
      return;
    }

    if (cvFile.type !== "application/pdf") {
      setFeedback({ type: "error", message: "Hệ thống chỉ chấp nhận tệp PDF cho CV." });
      return;
    }

    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("phoneNumber", form.phoneNumber);
    formData.append("dateOfBirth", form.dateOfBirth);
    formData.append("address", form.address);
    formData.append("appliedPosition", form.appliedPosition);
    formData.append("yearsExperience", form.yearsExperience);
    formData.append("currentWorkplace", form.currentWorkplace);
    formData.append("expectedSalary", form.expectedSalary);
    formData.append("coverLetter", form.coverLetter);
    formData.append("cvFile", cvFile);

    setIsSubmitting(true);

    try {
      await publicApi.submitRecruitmentApplication(formData);
      setFeedback({
        type: "success",
        message: "Nộp hồ sơ thành công. Phòng nhân sự sẽ liên hệ với bạn trong thời gian sớm nhất.",
      });
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        address: "",
        appliedPosition: initialPosition,
        yearsExperience: "",
        currentWorkplace: "",
        expectedSalary: "",
        coverLetter: "",
      });
      setCvFile(null);
    } catch (error) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? "Nộp hồ sơ thất bại. Vui lòng thử lại.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-14">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-black text-slate-900">Ứng Tuyển Nhân Sự Bệnh Viện</h1>
        <p className="mt-2 text-sm text-slate-600">
          Vui lòng điền đầy đủ thông tin ứng tuyển và tải lên CV định dạng PDF để bộ phận nhân sự tiếp nhận.
        </p>
      </article>

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Họ và tên
            <input
              required
              value={form.fullName}
              onChange={(event) => onChangeField("fullName", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Nguyen Van A"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => onChangeField("email", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="email@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Số điện thoại
            <input
              required
              value={form.phoneNumber}
              onChange={(event) => onChangeField("phoneNumber", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="09xxxxxxxx"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Ngày sinh
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => onChangeField("dateOfBirth", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Địa chỉ
            <input
              value={form.address}
              onChange={(event) => onChangeField("address", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Số nhà, đường, phường/xã, quận/huyện"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Vị trí ứng tuyển
            <input
              required
              value={form.appliedPosition}
              onChange={(event) => onChangeField("appliedPosition", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Bác sĩ đa khoa"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Số năm kinh nghiệm
            <input
              value={form.yearsExperience}
              onChange={(event) => onChangeField("yearsExperience", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="2"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Nơi công tác gần nhất
            <input
              value={form.currentWorkplace}
              onChange={(event) => onChangeField("currentWorkplace", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Bệnh viện / phòng khám"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Mức lương mong muốn
            <input
              value={form.expectedSalary}
              onChange={(event) => onChangeField("expectedSalary", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Ví dụ: 15.000.000 VND/tháng"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Thư giới thiệu
            <textarea
              rows={5}
              value={form.coverLetter}
              onChange={(event) => onChangeField("coverLetter", event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
              placeholder="Tóm tắt kinh nghiệm và điểm mạnh của bạn"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Tải lên CV (PDF)
            <input
              required
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-normal"
            />
            <span className="text-xs font-normal text-slate-500">Dung lượng tối đa: 5MB.</span>
          </label>
        </div>

        {feedback ? (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ ứng tuyển"}
          </button>
        </div>
      </form>
    </section>
  );
};
