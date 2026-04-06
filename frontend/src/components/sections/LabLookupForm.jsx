import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { publicApi } from "../../lib/api";
export const LabLookupForm = () => {
    const [patientCode, setPatientCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmit = async (event) => {
        event.preventDefault();
        setMessage(null);
        try {
            setIsSubmitting(true);
            const response = await publicApi.lookupLab({ patientCode, phoneNumber });
            setResults(response.data.data);
            setMessage(`Tìm thấy ${response.data.data.length} kết quả cận lâm sàng.`);
        }
        catch {
            setResults([]);
            setMessage("Không tìm thấy dữ liệu hoặc thông tin chưa chính xác.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Tra c\u1EE9u k\u1EBFt qu\u1EA3 c\u1EADn l\u00E2m s\u00E0ng" }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Nh\u1EADp \u0111\u00FAng m\u00E3 b\u1EC7nh nh\u00E2n v\u00E0 s\u1ED1 \u0111i\u1EC7n tho\u1EA1i \u0111\u00E3 \u0111\u0103ng k\u00FD \u0111\u1EC3 xem k\u1EBFt qu\u1EA3." }), _jsxs("form", { onSubmit: onSubmit, className: "mt-4 grid gap-3", children: [_jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["M\u00E3 b\u1EC7nh nh\u00E2n", _jsx("input", { required: true, value: patientCode, onChange: (event) => setPatientCode(event.target.value), className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2", placeholder: "VD: BN20260001" })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["S\u1ED1 \u0111i\u1EC7n tho\u1EA1i", _jsx("input", { required: true, value: phoneNumber, onChange: (event) => setPhoneNumber(event.target.value), className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2", placeholder: "VD: 0901234567" })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:opacity-60", children: isSubmitting ? "Đang tra cứu..." : "Tra cứu kết quả" })] }), message ? _jsx("p", { className: "mt-4 text-sm text-brand-900", children: message }) : null, results.length > 0 ? (_jsx("div", { className: "mt-4 space-y-3", children: results.map((result) => (_jsxs("article", { className: "rounded-2xl border border-slate-200 p-4", children: [_jsxs("p", { className: "text-sm font-semibold text-slate-900", children: [result.test_name, " (", result.test_code, ")"] }), _jsxs("p", { className: "mt-1 text-sm text-slate-700", children: ["T\u00F3m t\u1EAFt: ", result.result_summary ?? "Đang cập nhật"] }), _jsxs("p", { className: "mt-1 text-sm text-slate-700", children: ["K\u1EBFt lu\u1EADn: ", result.conclusion ?? "Đang cập nhật"] }), _jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["Th\u1EDDi gian th\u1EF1c hi\u1EC7n: ", result.performed_at ? new Date(result.performed_at).toLocaleString("vi-VN") : "--"] })] }, result.id))) })) : null] }));
};
