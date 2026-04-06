import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { useAuth } from "../lib/auth-context";
import { getBackendErrorMessage } from "../lib/error-message";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("admin@benhvien.vn");
  const [password, setPassword] = useState("Admin@123");
  const [message, setMessage] = useState(null);

  const isAdmin = useMemo(() => user?.roles.includes("ADMIN") ?? false, [user]);

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({ email, password, role: "ADMIN" });
      setMessage("Đăng nhập thành công, đang chuyển sang trang quản trị...");
      navigate("/admin", { replace: true });
    } catch (error) {
      setMessage(getBackendErrorMessage(error, "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản quản trị."));
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle
        eyebrow="CMS Admin"
        title="Đăng nhập quản trị"
        description="Khu vực dành cho quản trị viên và nhân sự vận hành luồng dữ liệu bệnh viện."
      />

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-slate-700">
            Email quản trị
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
            Đăng nhập CMS
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-brand-900">{message}</p> : null}
        {user ? <p className="mt-2 text-xs text-slate-500">Đã đăng nhập: {user.email}</p> : null}
      </form>
    </section>
  );
};
