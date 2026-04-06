import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { useAuth } from "../lib/auth-context";
import { getBackendErrorMessage } from "../lib/error-message";

export const DoctorLoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("doctor@benhvien.vn");
  const [password, setPassword] = useState("Doctor@123");
  const [message, setMessage] = useState(null);

  const isDoctor = useMemo(() => user?.roles.includes("DOCTOR") ?? false, [user]);

  if (user && isDoctor) {
    return <Navigate to="/bac-si" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({ email, password, role: "DOCTOR" });
      setMessage("Đăng nhập thành công, đang chuyển sang cổng bác sĩ...");
      navigate("/bac-si", { replace: true });
    } catch (error) {
      setMessage(getBackendErrorMessage(error, "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản bác sĩ."));
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle
        eyebrow="Bác sĩ"
        title="Đăng nhập bác sĩ"
        description="Khu vực dành cho bác sĩ theo dõi thông tin vận hành và truy cập chức năng chuyên môn."
      />

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-slate-700">
            Email bác sĩ
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
            Đăng nhập bác sĩ
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-brand-900">{message}</p> : null}
      </form>
    </section>
  );
};
