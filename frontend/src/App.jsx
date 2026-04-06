import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminAdvancedReportsPage } from "./pages/AdminAdvancedReportsPage";
import { AdminRecruitmentApplicationsPage } from "./pages/AdminRecruitmentApplicationsPage";
import { BookingPage } from "./pages/BookingPage";
import { ContactPage } from "./pages/ContactPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { DoctorDashboardPage } from "./pages/DoctorDashboardPage";
import { DoctorLoginPage } from "./pages/DoctorLoginPage";
import { EInvoicePage } from "./pages/EInvoicePage";
import { HealthRecordPage } from "./pages/HealthRecordPage";
import { HomePage } from "./pages/HomePage";
import { InternalMedicineLandingPage } from "./pages/InternalMedicineLandingPage";
import { LabLookupPage } from "./pages/LabLookupPage";
import { MedicalSchedulePage } from "./pages/MedicalSchedulePage";
import { NewsPage } from "./pages/NewsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ParaclinicalLandingPage } from "./pages/ParaclinicalLandingPage";
import { PatientGuidePage } from "./pages/PatientGuidePage";
import { PatientForgotPasswordPage } from "./pages/PatientForgotPasswordPage";
import { PatientLoginPage } from "./pages/PatientLoginPage";
import { PatientPortalPage } from "./pages/PatientPortalPage";
import { PatientRegisterPage } from "./pages/PatientRegisterPage";
import { PatientResetPasswordPage } from "./pages/PatientResetPasswordPage";
import { RecruitmentLandingPage } from "./pages/RecruitmentLandingPage";
import { RecruitmentApplicationPage } from "./pages/RecruitmentApplicationPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SurgeryLandingPage } from "./pages/SurgeryLandingPage";
import { TrainingLandingPage } from "./pages/TrainingLandingPage";
import { TreatmentPage } from "./pages/TreatmentPage";

const withLayout = (element) => <MainLayout>{element}</MainLayout>;

const renderAuthCheckingView = () =>
  withLayout(
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm text-slate-600">Đang kiểm tra trạng thái đăng nhập...</p>
    </section>,
  );

const resolveRoleHome = (roles) => {
  if (roles.includes("ADMIN")) {
    return "/admin";
  }

  if (roles.includes("DOCTOR")) {
    return "/bac-si";
  }

  if (roles.includes("PATIENT")) {
    return "/benh-nhan";
  }

  return "/";
};

const RequireGuest = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return renderAuthCheckingView();
  }

  if (isAuthenticated && user) {
    return <Navigate to={resolveRoleHome(user.roles)} replace />;
  }

  return children;
};

const RequireRoleAccess = ({ children, allowedRoles, loginPath }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return renderAuthCheckingView();
  }

  if (!isAuthenticated || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath}?next=${next}`} replace />;
  }

  const hasRole = allowedRoles.some((role) => user.roles.includes(role));
  if (!hasRole) {
    return <Navigate to={resolveRoleHome(user.roles)} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={withLayout(<HomePage />)} />
      <Route path="/gioi-thieu" element={withLayout(<AboutPage />)} />
      <Route path="/kham-chua-benh" element={withLayout(<TreatmentPage />)} />
      <Route path="/kham-chua-benh/lich-kham-benh" element={withLayout(<MedicalSchedulePage />)} />
      <Route path="/kham-chua-benh/noi-khoa" element={withLayout(<InternalMedicineLandingPage />)} />
      <Route path="/kham-chua-benh/ngoai-khoa" element={withLayout(<SurgeryLandingPage />)} />
      <Route path="/kham-chua-benh/can-lam-sang" element={withLayout(<ParaclinicalLandingPage />)} />
      <Route
        path="/kham-chua-benh/ho-so-suc-khoe"
        element={
          <RequireRoleAccess allowedRoles={["PATIENT"]} loginPath="/dang-nhap">
            {withLayout(<HealthRecordPage />)}
          </RequireRoleAccess>
        }
      />
      <Route
        path="/kham-chua-benh/hoa-don-dien-tu"
        element={
          <RequireRoleAccess allowedRoles={["PATIENT"]} loginPath="/dang-nhap">
            {withLayout(<EInvoicePage />)}
          </RequireRoleAccess>
        }
      />
      <Route path="/chuyen-khoa" element={withLayout(<DepartmentsPage />)} />
      <Route path="/dich-vu" element={withLayout(<ServicesPage />)} />
      <Route path="/huong-dan-nguoi-benh" element={withLayout(<PatientGuidePage />)} />
      <Route path="/tuyen-dung" element={withLayout(<RecruitmentLandingPage />)} />
      <Route path="/dao-tao" element={withLayout(<TrainingLandingPage />)} />
      <Route path="/ung-tuyen" element={withLayout(<RecruitmentApplicationPage />)} />
      <Route path="/quen-mat-khau" element={withLayout(<PatientForgotPasswordPage />)} />
      <Route path="/reset-password/:token" element={withLayout(<PatientResetPasswordPage />)} />
      <Route
        path="/dang-nhap"
        element={
          <RequireGuest>
            {withLayout(<PatientLoginPage />)}
          </RequireGuest>
        }
      />
      <Route
        path="/dang-ky"
        element={
          <RequireGuest>
            {withLayout(<PatientRegisterPage />)}
          </RequireGuest>
        }
      />
      <Route path="/tra-cuu-can-lam-sang" element={withLayout(<LabLookupPage />)} />
      <Route
        path="/benh-nhan"
        element={
          <RequireRoleAccess allowedRoles={["PATIENT"]} loginPath="/dang-nhap">
            {withLayout(<PatientPortalPage />)}
          </RequireRoleAccess>
        }
      />
      <Route
        path="/dat-lich-kham"
        element={
          <RequireRoleAccess allowedRoles={["PATIENT"]} loginPath="/dang-nhap">
            {withLayout(<BookingPage />)}
          </RequireRoleAccess>
        }
      />
      <Route path="/tin-tuc" element={withLayout(<NewsPage />)} />
      <Route path="/lien-he" element={withLayout(<ContactPage />)} />
      <Route
        path="/admin/login"
        element={
          <RequireGuest>
            {withLayout(<AdminLoginPage />)}
          </RequireGuest>
        }
      />
      <Route
        path="/bac-si/dang-nhap"
        element={
          <RequireGuest>
            {withLayout(<DoctorLoginPage />)}
          </RequireGuest>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRoleAccess allowedRoles={["ADMIN"]} loginPath="/admin/login">
            {withLayout(<AdminDashboardPage />)}
          </RequireRoleAccess>
        }
      />
      <Route
        path="/admin/tuyen-dung"
        element={
          <RequireRoleAccess allowedRoles={["ADMIN"]} loginPath="/admin/login">
            {withLayout(<AdminRecruitmentApplicationsPage />)}
          </RequireRoleAccess>
        }
      />
      <Route
        path="/admin/bao-cao"
        element={
          <RequireRoleAccess allowedRoles={["ADMIN"]} loginPath="/admin/login">
            {withLayout(<AdminAdvancedReportsPage />)}
          </RequireRoleAccess>
        }
      />
      <Route
        path="/bac-si"
        element={
          <RequireRoleAccess allowedRoles={["DOCTOR"]} loginPath="/bac-si/dang-nhap">
            {withLayout(<DoctorDashboardPage />)}
          </RequireRoleAccess>
        }
      />
      <Route path="*" element={withLayout(<NotFoundPage />)} />
    </Routes>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};
