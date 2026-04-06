import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { getBackendErrorMessage } from "../lib/error-message";
import { authApi } from "../lib/api";

export const PatientForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ identifier });
      setMessage({
        type: "success",
        text: response.data?.message ?? "Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi.",
      });
      setIdentifier("");
    } catch (error) {
      setMessage({
        type: "error",
        text: getBackendErrorMessage(error, "Gửi yêu cầu quên mật khẩu thất bại. Vui lòng thử lại."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle
        eyebrow="Quên mật khẩu"
        title="Yêu cầu đặt lại mật khẩu"
        description="Nhập email hoặc mã bệnh nhân để nhận liên kết đặt lại mật khẩu qua email."
      />

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Email hoặc mã bệnh nhân
          <input
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="email@example.com hoặc BNxxxx"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
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
