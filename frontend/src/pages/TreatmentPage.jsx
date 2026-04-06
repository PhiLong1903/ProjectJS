import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
const subFeatures = [
    {
        title: "Lịch khám bệnh",
        description: "Xem nhanh các lịch khám thường ngày, theo yêu cầu và gói khám VIP.",
        to: "/kham-chua-benh/lich-kham-benh",
        action: "Xem lịch khám",
    },
    {
        title: "Hồ sơ sức khỏe",
        description: "Xem thông tin bệnh nhân, lịch sử khám và truy cập hóa đơn điện tử.",
        to: "/kham-chua-benh/ho-so-suc-khoe",
        action: "Mở hồ sơ",
    },
    {
        title: "Nội khoa",
        description: "Landing page giới thiệu chuyên khoa Nội (bạn có thể bổ sung nội dung sau).",
        to: "/kham-chua-benh/noi-khoa",
        action: "Xem nội khoa",
    },
    {
        title: "Ngoại khoa",
        description: "Landing page giới thiệu chuyên khoa Ngoại (bạn có thể bổ sung nội dung sau).",
        to: "/kham-chua-benh/ngoai-khoa",
        action: "Xem ngoại khoa",
    },
    {
        title: "Cận lâm sàng",
        description: "Landing page giới thiệu cận lâm sàng (xét nghiệm, chẩn đoán hình ảnh...).",
        to: "/kham-chua-benh/can-lam-sang",
        action: "Xem cận lâm sàng",
    },
];
export const TreatmentPage = () => {
    return (_jsxs("section", { className: "mx-auto max-w-7xl space-y-8 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "Kh\u00E1m Ch\u1EEFa B\u1EC7nh", title: "Trung t\u00E2m kh\u00E1m ch\u1EEFa b\u1EC7nh", description: "T\u1ED5ng h\u1EE3p c\u00E1c ch\u1EE9c n\u0103ng ph\u1EE5c v\u1EE5 kh\u00E1m ch\u1EEFa b\u1EC7nh: l\u1ECBch kh\u00E1m, h\u1ED3 s\u01A1 s\u1EE9c kh\u1ECFe v\u00E0 c\u00E1c trang gi\u1EDBi thi\u1EC7u khoa." }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: subFeatures.map((item) => (_jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: item.title }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: item.description }), _jsx(Link, { to: item.to, className: "mt-4 inline-flex rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900", children: item.action })] }, item.to))) })] }));
};
