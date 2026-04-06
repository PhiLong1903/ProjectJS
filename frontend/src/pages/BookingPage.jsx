import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { BookingForm } from "../components/sections/BookingForm";
import { SectionTitle } from "../components/sections/SectionTitle";
import { patientApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";
export const BookingPage = () => {
    const { isAuthenticated, user } = useAuth();
    const [bookings, setBookings] = useState([]);
    useEffect(() => {
        const loadMyBookings = async () => {
            if (!isAuthenticated) {
                setBookings([]);
                return;
            }
            try {
                const response = await patientApi.myBookings();
                setBookings(response.data.data);
            }
            catch {
                setBookings([]);
            }
        };
        void loadMyBookings();
    }, [isAuthenticated]);
    return (_jsxs("section", { className: "mx-auto max-w-7xl space-y-8 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "E-Health Booking", title: "\u0110\u1EB7t l\u1ECBch kh\u00E1m tr\u1EF1c tuy\u1EBFn", description: "B\u1EA1n c\u1EA7n \u0111\u0103ng nh\u1EADp t\u00E0i kho\u1EA3n b\u1EC7nh nh\u00E2n \u0111\u1EC3 \u0111\u1EB7t l\u1ECBch v\u00E0 theo d\u00F5i l\u1ECBch h\u1EB9n." }), user && !user.roles.includes("PATIENT") ? (_jsx("p", { className: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700", children: "T\u00E0i kho\u1EA3n hi\u1EC7n t\u1EA1i kh\u00F4ng ph\u1EA3i vai tr\u00F2 b\u1EC7nh nh\u00E2n. Vui l\u00F2ng \u0111\u0103ng nh\u1EADp t\u00E0i kho\u1EA3n b\u1EC7nh nh\u00E2n \u0111\u1EC3 \u0111\u1EB7t l\u1ECBch." })) : null, _jsx(BookingForm, {}), _jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "L\u1ECBch kh\u00E1m c\u1EE7a t\u00F4i" }), bookings.length > 0 ? (_jsx("div", { className: "mt-4 grid gap-3", children: bookings.map((booking) => (_jsxs("article", { className: "rounded-2xl border border-slate-200 p-4", children: [_jsxs("p", { className: "font-semibold text-slate-900", children: [booking.department_name, " - ", booking.doctor_name] }), _jsxs("p", { className: "text-sm text-slate-600", children: [booking.slot_date, " | ", booking.start_time.slice(0, 5), " - ", booking.end_time.slice(0, 5)] }), _jsxs("p", { className: "text-xs font-semibold text-brand-700", children: ["Tr\u1EA1ng th\u00E1i: ", booking.status] })] }, booking.id))) })) : (_jsx("p", { className: "mt-3 text-sm text-slate-600", children: "B\u1EA1n ch\u01B0a c\u00F3 l\u1ECBch kh\u00E1m n\u00E0o." }))] })] }));
};
