import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { useAuth } from "../lib/auth-context";
import { getBackendErrorMessage } from "../lib/error-message";

export const PatientRegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const normalizedPhone = form.phoneNumber.replace(/[.\s-]/g, "");
    let phoneNumber = normalizedPhone;

    if (phoneNumber.startsWith("0")) {
      phoneNumber = `+84${phoneNumber.slice(1)}`;
    } else if (phoneNumber.startsWith("84")) {
      phoneNumber = `+${phoneNumber}`;
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+84${phoneNumber}`;
    }

    try {
      const result = await register({
        ...form,
        phoneNumber,
      });

      setMessage({
        type: "success",
        text: `Đăng ký thành công. Mã bệnh nhân của bạn: ${result.patientCode}`,
      });
      setForm({ fullName: "", email: "", password: "", phoneNumber: "" });
    } catch (error) {
      const errorMessage = getBackendErrorMessage(error, "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.");
      setMessage({
        type: "error",
        text:
          errorMessage === "Email đã tồn tại trong hệ thống"
            ? "Email đã tồn tại trong hệ thống. Bạn có thể dùng email khác hoặc chuyển sang đăng nhập."
            : errorMessage,
      });
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle
        eyebrow="Đăng ký"
        title="Tạo tài khoản bệnh nhân"
        description="Tài khoản bệnh nhân dùng để đặt lịch khám trực tuyến và quản lý lịch hẹn."
      />

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-slate-700">
            Họ và tên
            <input
              required
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Mật khẩu
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
            <span className="mt-1 block text-xs text-slate-500">Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.</span>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Số điện thoại
            <input
              required
              value={form.phoneNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="VD: 0912345678 hoặc +84912345678"
            />
          </label>

          <button type="submit" className="rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-700">
            Đăng ký tài khoản
          </button>
        </div>

        {message ? <p className={`mt-3 text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p> : null}

        <p className="mt-4 text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link to="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </section>
  );
};
