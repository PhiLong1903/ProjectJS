import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LabLookupForm } from "../components/sections/LabLookupForm";
import { SectionTitle } from "../components/sections/SectionTitle";
export const LabLookupPage = () => {
    return (_jsxs("section", { className: "mx-auto max-w-4xl px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "Hồ sơ khám bệnh", title: "Tra cứu tất cả kết quả khám bệnh", description: "Nhập đúng mã bệnh nhân và số điện thoại để xem lịch sử khám, kết quả cận lâm sàng, đơn thuốc và lịch sử thanh toán." }), _jsx(LabLookupForm, {})] }));
};
