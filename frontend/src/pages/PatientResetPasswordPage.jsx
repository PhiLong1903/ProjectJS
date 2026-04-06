import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { getBackendErrorMessage } from "../lib/error-message";
import { authApi } from "../lib/api";

export const PatientResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage({ type: "error", text: "Liên kết đặt lại mật khẩu không hợp lệ." });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Xác nhận mật khẩu không khớp." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.resetPassword(token, { password });
      setMessage({
        type: "success",
        text: response.data?.message ?? "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text: getBackendErrorMessage(error, "Đặt lại mật khẩu thất bại. Vui lòng thử lại."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle
        eyebrow="Đặt lại mật khẩu"
        title="Tạo mật khẩu mới"
        description="Nhập mật khẩu mới cho tài khoản bệnh nhân."
      />

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Mật khẩu mới
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Tối thiểu 8 ký tự"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Xác nhận mật khẩu mới
          <input
            required
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </button>

        {message ? (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-sm ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          <Link to="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </section>
  );
};
