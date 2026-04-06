import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { useAuth } from "../lib/auth-context";
import { getBackendErrorMessage } from "../lib/error-message";

export const PatientLoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const nextUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("next") ?? "/benh-nhan";
  }, [location.search]);

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({ email, password, role: "PATIENT" });
      setMessage("Đăng nhập thành công.");
      navigate(nextUrl, { replace: true });
    } catch (error) {
      setMessage(getBackendErrorMessage(error, "Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu."));
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle
        eyebrow="Đăng nhập"
        title="Đăng nhập bệnh nhân"
        description="Vui lòng đăng nhập để đặt lịch khám trực tuyến và theo dõi lịch hẹn cá nhân."
      />

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Mật khẩu
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>

          <button type="submit" className="rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900">
            Đăng nhập
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-brand-900">{message}</p> : null}

        <p className="mt-3 text-sm text-slate-600">
          <Link to="/quen-mat-khau" className="font-semibold text-brand-700 hover:underline">
            Quên mật khẩu?
          </Link>
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link to="/dang-ky" className="font-semibold text-brand-700 hover:underline">
            Đăng ký ngay
          </Link>
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Bạn là bác sĩ?{" "}
          <Link to="/bac-si/dang-nhap" className="font-semibold text-brand-700 hover:underline">
            Đăng nhập bác sĩ
          </Link>
        </p>

        {isAuthenticated ? (
          <p className="mt-2 text-xs text-slate-500">Bạn đã đăng nhập. Có thể truy cập trang chức năng phù hợp.</p>
        ) : null}
      </form>
    </section>
  );
};
