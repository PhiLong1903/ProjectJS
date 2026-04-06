import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { patientPortalApi } from "../lib/api";
export const HealthRecordPage = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [profileRes, bookingRes] = await Promise.all([
                    patientPortalApi.profile(),
                    patientPortalApi.bookings("all"),
                ]);
                setProfile(profileRes.data.data);
                setBookings(bookingRes.data.data);
            }
            catch {
                setMessage("Không thể tải hồ sơ sức khỏe.");
            }
            finally {
                setLoading(false);
            }
        };
        void loadData();
    }, []);
    if (loading) {
        return (_jsx("section", { className: "mx-auto max-w-7xl px-4 py-14", children: _jsx("p", { className: "text-sm text-slate-600", children: "\u0110ang t\u1EA3i h\u1ED3 s\u01A1 s\u1EE9c kh\u1ECFe..." }) }));
    }
    return (_jsxs("section", { className: "mx-auto max-w-7xl space-y-8 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "H\u1ED3 S\u01A1 S\u1EE9c Kh\u1ECFe", title: "Th\u00F4ng tin b\u1EC7nh nh\u00E2n v\u00E0 l\u1ECBch s\u1EED kh\u00E1m", description: "Bao g\u1ED3m th\u00F4ng tin c\u00E1 nh\u00E2n v\u00E0 danh s\u00E1ch c\u00E1c l\u1EA7n kh\u00E1m b\u1EC7nh \u0111\u00E3 ghi nh\u1EADn." }), message ? (_jsx("p", { className: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: message })) : null, profile ? (_jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Th\u00F4ng tin b\u1EC7nh nh\u00E2n" }), _jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["M\u00E3 b\u1EC7nh nh\u00E2n: ", profile.patient_code] })] }), _jsx(Link, { to: "/kham-chua-benh/hoa-don-dien-tu", className: "rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900", children: "Xem h\u00F3a \u0111\u01A1n \u0111i\u1EC7n t\u1EED" })] }), _jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-2", children: [_jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("strong", { children: "H\u1ECD t\u00EAn:" }), " ", profile.full_name] }), _jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("strong", { children: "Email:" }), " ", profile.email] }), _jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("strong", { children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i:" }), " ", profile.phone_number] }), _jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("strong", { children: "Ng\u00E0y sinh:" }), " ", profile.date_of_birth ?? "-"] }), _jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("strong", { children: "Gi\u1EDBi t\u00EDnh:" }), " ", profile.gender ?? "-"] }), _jsxs("p", { className: "text-sm text-slate-700", children: [_jsx("strong", { children: "BHYT:" }), " ", profile.health_insurance_number ?? "-"] }), _jsxs("p", { className: "text-sm text-slate-700 md:col-span-2", children: [_jsx("strong", { children: "\u0110\u1ECBa ch\u1EC9:" }), " ", profile.address ?? "-"] })] })] })) : null, _jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Nh\u1EEFng l\u1EA7n kh\u00E1m b\u1EC7nh" }), _jsx("div", { className: "mt-4 overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 font-semibold text-slate-700", children: "Ng\u00E0y kh\u00E1m" }), _jsx("th", { className: "px-3 py-2 font-semibold text-slate-700", children: "Khoa" }), _jsx("th", { className: "px-3 py-2 font-semibold text-slate-700", children: "B\u00E1c s\u0129" }), _jsx("th", { className: "px-3 py-2 font-semibold text-slate-700", children: "Tr\u1EA1ng th\u00E1i" })] }) }), _jsxs("tbody", { children: [bookings.map((item) => (_jsxs("tr", { className: "border-t border-slate-100", children: [_jsx("td", { className: "px-3 py-2 text-slate-700", children: item.slot_date }), _jsx("td", { className: "px-3 py-2 text-slate-700", children: item.department_name }), _jsx("td", { className: "px-3 py-2 text-slate-700", children: item.doctor_name }), _jsx("td", { className: "px-3 py-2 font-semibold text-brand-700", children: item.status })] }, item.id))), bookings.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-3 py-4 text-center text-slate-500", children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u kh\u00E1m b\u1EC7nh." }) })) : null] })] }) })] })] }));
};
