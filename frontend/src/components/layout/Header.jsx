import { Fragment, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

const menuItems = [
  { to: "/", label: "Trang chủ" },
  { to: "/gioi-thieu", label: "Giới thiệu" },
  {
    to: "/kham-chua-benh",
    label: "Khám chữa bệnh",
    hoverOnly: true,
    children: [
      { to: "/kham-chua-benh/lich-kham-benh", label: "Lịch khám bệnh" },
      { to: "/kham-chua-benh/ho-so-suc-khoe", label: "Hồ sơ sức khỏe" },
      { to: "/kham-chua-benh/hoa-don-dien-tu", label: "Hóa đơn điện tử" },
      { to: "/kham-chua-benh/noi-khoa", label: "Nội khoa" },
      { to: "/kham-chua-benh/ngoai-khoa", label: "Ngoại khoa" },
      { to: "/kham-chua-benh/can-lam-sang", label: "Cận lâm sàng" },
    ],
  },
  {
    to: "/dich-vu",
    label: "Dịch vụ",
    hoverOnly: true,
    children: [
      { to: "/dat-lich-kham", label: "Đặt lịch khám" },
      {
        href: "https://www.youtube.com/watch?v=tfFv-0wfWv0",
        label: "Hướng dẫn đặt lịch (YouTube)",
        external: true,
      },
      { to: "/lien-he", label: "Dịch vụ khách hàng" },
      { to: "/dich-vu#bang-gia-vien-phi", label: "Giá viện phí (demo)" },
    ],
  },
  {
    key: "recruitment-training",
    label: "Tuyển dụng và đào tạo",
    hoverOnly: true,
    children: [
      { to: "/tuyen-dung", label: "Tuyển dụng" },
      { to: "/dao-tao", label: "Đào tạo" },
    ],
  },
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/lien-he", label: "Liên hệ" },
];

const menuItemClass = (isActive) =>
  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-brand-100 text-brand-900"
      : "text-slate-700 hover:bg-slate-100 hover:text-brand-900"
  }`;

const renderDropdownChild = (child, onClick) => {
  if (child.placeholder) {
    return (
      <span
        key={child.label}
        className="block cursor-default rounded-xl px-3 py-2 text-sm font-medium text-slate-500"
      >
        {child.label}
      </span>
    );
  }

  if (child.external) {
    return (
      <a
        key={child.href}
        href={child.href}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-brand-900"
      >
        {child.label}
      </a>
    );
  }

  return (
    <NavLink
      key={child.to}
      to={child.to}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm font-medium transition ${
          isActive ? "bg-brand-100 text-brand-900" : "text-slate-700 hover:bg-slate-100 hover:text-brand-900"
        }`
      }
    >
      {child.label}
    </NavLink>
  );
};

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const [openDropdownKey, setOpenDropdownKey] = useState(null);

  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const isDoctor = user?.roles.includes("DOCTOR") ?? false;
  const isPatient = user?.roles.includes("PATIENT") ?? false;
  const canBook = !user || isPatient;

  useEffect(() => {
    setOpenDropdownKey(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdownKey(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-accent-500 text-lg font-extrabold text-white">
            BV
          </div>
          <div>
            <p className="text-sm font-bold text-brand-900">Bệnh viện Đa khoa E-Health</p>
            <p className="text-xs text-slate-500">Khám chữa bệnh số hóa</p>
          </div>
        </Link>

        <nav ref={navRef} className="hidden items-center gap-1 lg:flex">
          {menuItems.map((item) => {
            if (!item.children) {
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => menuItemClass(isActive)}>
                  {item.label}
                </NavLink>
              );
            }

            const itemKey = item.key ?? item.to ?? item.label;
            const isParentActive = item.to ? location.pathname.startsWith(item.to) : false;
            const isOpen = openDropdownKey === itemKey;
            const parentClass = item.hoverOnly
              ? `rounded-xl px-3 py-2 text-sm font-semibold transition cursor-default ${
                  isParentActive
                    ? "bg-brand-100 text-brand-900"
                    : "text-slate-700 hover:bg-slate-100 hover:text-brand-900"
                }`
              : menuItemClass(isParentActive);

            return (
              <div key={itemKey} className="relative">
                {item.hoverOnly ? (
                  <button
                    type="button"
                    className={parentClass}
                    onClick={() => setOpenDropdownKey((prev) => (prev === itemKey ? null : itemKey))}
                    aria-expanded={isOpen}
                  >
                    {item.label}
                  </button>
                ) : (
                  <NavLink
                    to={item.to}
                    className={parentClass}
                    onClick={() => setOpenDropdownKey((prev) => (prev === itemKey ? null : itemKey))}
                    aria-expanded={isOpen}
                  >
                    {item.label}
                  </NavLink>
                )}
                <div
                  className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition ${
                    isOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
                  }`}
                >
                  {item.children.map((child) => renderDropdownChild(child, () => setOpenDropdownKey(null)))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/tra-cuu-can-lam-sang"
            className="rounded-xl border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Tra cứu KQ
          </Link>

          {canBook ? (
            <Link
              to="/dat-lich-kham"
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-900"
            >
              Đặt lịch khám
            </Link>
          ) : null}

          {isPatient ? (
            <Link to="/benh-nhan" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Cổng bệnh nhân
            </Link>
          ) : null}

          {isDoctor ? (
            <Link to="/bac-si" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Cổng bác sĩ
            </Link>
          ) : null}

          {isAdmin ? (
            <Fragment>
              <Link to="/admin" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                Quản trị
              </Link>
              <Link
                to="/admin/tuyen-dung"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Hồ sơ ứng tuyển
              </Link>
              <Link
                to="/admin/bao-cao"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Báo cáo nâng cao
              </Link>
            </Fragment>
          ) : null}

          {user ? (
            <Fragment>
              <span className="hidden rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 xl:inline-flex">
                {user.fullName}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Đăng xuất
              </button>
            </Fragment>
          ) : (
            <Fragment>
              <Link to="/dang-nhap" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                Bệnh nhân
              </Link>
              <Link
                to="/bac-si/dang-nhap"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Bác sĩ
              </Link>
              <Link to="/dang-ky" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                Đăng ký
              </Link>
              <Link to="/admin/login" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                Admin
              </Link>
            </Fragment>
          )}
        </div>
      </div>
    </header>
  );
};
