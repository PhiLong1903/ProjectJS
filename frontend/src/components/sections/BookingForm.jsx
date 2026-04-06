import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { patientApi, publicApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
export const BookingForm = () => {
    const { isAuthenticated, user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [departmentId, setDepartmentId] = useState("");
    const [doctorKeyword, setDoctorKeyword] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [slotId, setSlotId] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const loadDepartments = async () => {
            const response = await publicApi.departments();
            setDepartments(response.data.data);
        };
        void loadDepartments();
    }, []);
    useEffect(() => {
        if (!departmentId) {
            setDoctors([]);
            setDoctorId("");
            setSlots([]);
            setSlotId("");
            return;
        }
        const loadDoctors = async () => {
            const response = await publicApi.doctors(departmentId, doctorKeyword);
            setDoctors(response.data.data);
            setDoctorId("");
            setSlotId("");
            setSlots([]);
        };
        void loadDoctors();
    }, [departmentId, doctorKeyword]);
    useEffect(() => {
        if (!doctorId) {
            setSlots([]);
            setSlotId("");
            return;
        }
        const loadSlots = async () => {
            const response = await publicApi.doctorSlots(doctorId);
            setSlots(response.data.data.filter((slot) => slot.is_available));
            setSlotId("");
        };
        void loadSlots();
    }, [doctorId]);
    const selectedSlotLabel = useMemo(() => {
        const selected = slots.find((slot) => slot.id === slotId);
        if (!selected) {
            return "";
        }
        return `${selected.slot_date} | ${selected.start_time.slice(0, 5)} - ${selected.end_time.slice(0, 5)}`;
    }, [slotId, slots]);
    const onSubmit = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) {
            setMessage("Vui lòng đăng nhập tài khoản bệnh nhân trước khi đặt lịch.");
            return;
        }
        try {
            setIsSubmitting(true);
            setMessage(null);
            await patientApi.createBooking({ departmentId, doctorId, slotId, reason, notes });
            setMessage(`Đặt lịch thành công cho ${selectedSlotLabel}.`);
            setReason("");
            setNotes("");
            setSlotId("");
        }
        catch (error) {
            setMessage("Đặt lịch thất bại. Vui lòng kiểm tra thông tin hoặc thử lại.");
            void error;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("form", { onSubmit: onSubmit, className: "grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "\u0110\u1EB7t l\u1ECBch kh\u00E1m tr\u1EF1c tuy\u1EBFn" }), _jsx("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600", children: user ? `Xin chào ${user.fullName}` : "Chưa đăng nhập" })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["Ch\u1ECDn khoa", _jsxs("select", { required: true, value: departmentId, onChange: (event) => setDepartmentId(event.target.value), className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2", children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn khoa kh\u00E1m --" }), departments.map((department) => (_jsx("option", { value: department.id, children: department.name }, department.id)))] })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["T\u00ECm b\u00E1c s\u0129 (t\u00EAn/chuy\u00EAn khoa/tri\u1EC7u ch\u1EE9ng)", _jsx("input", { value: doctorKeyword, onChange: (event) => setDoctorKeyword(event.target.value), placeholder: "V\u00ED d\u1EE5: Nhi h\u00F4 h\u1EA5p, tim m\u1EA1ch, \u0111au \u0111\u1EA7u...", className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2", disabled: !departmentId })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["Ch\u1ECDn b\u00E1c s\u0129", _jsxs("select", { required: true, value: doctorId, onChange: (event) => setDoctorId(event.target.value), className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2", disabled: !departmentId, children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn b\u00E1c s\u0129 --" }), doctors.map((doctor) => (_jsxs("option", { value: doctor.id, children: [doctor.full_name, " (", doctor.specialty ?? "Đa khoa", ")"] }, doctor.id)))] })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["Ch\u1ECDn khung gi\u1EDD", _jsxs("select", { required: true, value: slotId, onChange: (event) => setSlotId(event.target.value), className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2", disabled: !doctorId, children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn gi\u1EDD kh\u00E1m --" }), slots.map((slot) => (_jsxs("option", { value: slot.id, children: [slot.slot_date, " | ", slot.start_time.slice(0, 5), " - ", slot.end_time.slice(0, 5)] }, slot.id)))] })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["Tri\u1EC7u ch\u1EE9ng ch\u00EDnh", _jsx("textarea", { rows: 3, value: reason, onChange: (event) => setReason(event.target.value), placeholder: "V\u00ED d\u1EE5: \u0111au \u0111\u1EA7u, ho k\u00E9o d\u00E0i, ki\u1EC3m tra s\u1EE9c kh\u1ECFe \u0111\u1ECBnh k\u1EF3...", className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" })] }), _jsxs("label", { className: "text-sm font-medium text-slate-700", children: ["Ghi ch\u00FA th\u00EAm", _jsx("textarea", { rows: 2, value: notes, onChange: (event) => setNotes(event.target.value), className: "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:opacity-60", children: isSubmitting ? "Đang gửi lịch khám..." : "Xác nhận đặt lịch" }), message ? _jsx("p", { className: "text-sm text-brand-900", children: message }) : null] }));
};
