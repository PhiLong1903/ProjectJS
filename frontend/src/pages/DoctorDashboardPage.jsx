import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { doctorPortalApi } from "../lib/api";
export const DoctorDashboardPage = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({
        specialty: "",
        experienceYears: "",
        qualifications: "",
        description: "",
    });
    const [slotForm, setSlotForm] = useState({
        slotDate: "",
        startTime: "08:00",
        endTime: "08:30",
    });
    const loadData = async () => {
        const [profileRes, appointmentsRes, notificationsRes] = await Promise.all([
            doctorPortalApi.profile(),
            doctorPortalApi.appointments(),
            doctorPortalApi.notifications(),
        ]);
        const profileData = profileRes.data.data;
        setProfile(profileData);
        setProfileForm({
            specialty: profileData.specialty ?? "",
            experienceYears: profileData.experience_years?.toString() ?? "",
            qualifications: profileData.qualifications ?? "",
            description: profileData.description ?? "",
        });
        setAppointments(appointmentsRes.data.data);
        setNotifications(notificationsRes.data.data);
    };
    useEffect(() => {
        const bootstrap = async () => {
            try {
                setLoading(true);
                await loadData();
            }
            catch {
                setMessage("Không thể tải dữ liệu cổng bác sĩ.");
            }
            finally {
                setLoading(false);
            }
        };
        void bootstrap();
    }, []);
    const saveProfile = async () => {
        try {
            const response = await doctorPortalApi.updateProfile({
                specialty: profileForm.specialty || undefined,
                experienceYears: profileForm.experienceYears ? Number(profileForm.experienceYears) : undefined,
                qualifications: profileForm.qualifications || undefined,
                description: profileForm.description || undefined,
            });
            setProfile(response.data.data);
            setMessage("Cập nhật hồ sơ bác sĩ thành công.");
        }
        catch {
            setMessage("Cập nhật hồ sơ bác sĩ thất bại.");
        }
    };
    const createSlot = async () => {
        try {
            await doctorPortalApi.createSlot(slotForm);
            setMessage("Tạo lịch làm việc thành công.");
            setSlotForm({ slotDate: "", startTime: "08:00", endTime: "08:30" });
            await loadData();
        }
        catch {
            setMessage("Tạo lịch làm việc thất bại.");
        }
    };
    const updateStatus = async (bookingId, status) => {
        const reason = status === "CANCELLED"
            ? window.prompt("Lý do từ chối/hủy lịch:", "Bác sĩ bận lịch trực đột xuất") ?? undefined
            : undefined;
        const diagnosis = status === "COMPLETED"
            ? window.prompt("Nhập chẩn đoán sau khám:", "Theo dõi thêm triệu chứng") ?? undefined
            : undefined;
        const doctorNote = status === "COMPLETED"
            ? window.prompt("Ghi chú bác sĩ:", "Tái khám sau 7 ngày") ?? undefined
            : undefined;
        try {
            await doctorPortalApi.updateAppointmentStatus(bookingId, {
                status,
                reason: reason?.trim() || undefined,
                diagnosis: diagnosis?.trim() || undefined,
                doctorNote: doctorNote?.trim() || undefined,
            });
            setMessage("Cập nhật lịch khám thành công.");
            await loadData();
        }
        catch {
            setMessage("Cập nhật lịch khám thất bại.");
        }
    };
    const createPrescription = async (bookingId) => {
        const diagnosis = window.prompt("Chẩn đoán:", "Viêm họng cấp") ?? "";
        const advice = window.prompt("Dặn dò:", "Uống đủ nước và tái khám nếu sốt cao") ?? "";
        try {
            await doctorPortalApi.upsertPrescription(bookingId, {
                diagnosis: diagnosis.trim() || undefined,
                medications: [
                    {
                        medicineCode: "MED-PARA-500",
                        medicineName: "Paracetamol 500mg",
                        dosage: "1 viên",
                        frequency: "2 lần/ngày",
                        duration: "3 ngày",
                    },
                ],
                advice: advice.trim() || undefined,
            });
            setMessage("Cập nhật đơn thuốc điện tử thành công.");
        }
        catch {
            setMessage("Cập nhật đơn thuốc thất bại.");
        }
    };
    const markRead = async (notificationId) => {
        try {
            await doctorPortalApi.readNotification(notificationId);
            setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)));
        }
        catch {
            setMessage("Không thể cập nhật thông báo.");
        }
    };
    if (loading) {
        return (_jsx("section", { className: "mx-auto max-w-7xl px-4 py-14", children: _jsx("p", { className: "text-sm text-slate-600", children: "\u0110ang t\u1EA3i c\u1ED5ng b\u00E1c s\u0129..." }) }));
    }
    return (_jsxs("section", { className: "mx-auto max-w-7xl space-y-8 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "Doctor Portal", title: "Khu v\u1EF1c t\u00E1c nghi\u1EC7p d\u00E0nh cho b\u00E1c s\u0129", description: "Qu\u1EA3n l\u00FD h\u1ED3 s\u01A1 chuy\u00EAn m\u00F4n, l\u1ECBch l\u00E0m vi\u1EC7c, l\u1ECBch h\u1EB9n b\u1EC7nh nh\u00E2n v\u00E0 c\u1EADp nh\u1EADt b\u1EC7nh \u00E1n \u0111i\u1EC7n t\u1EED." }), message ? (_jsx("p", { className: "rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900", children: message })) : null, _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "H\u1ED3 s\u01A1 chuy\u00EAn m\u00F4n" }), _jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["M\u00E3 b\u00E1c s\u0129: ", profile?.doctor_code] }), _jsxs("div", { className: "mt-4 grid gap-2", children: [_jsx("input", { value: profileForm.specialty, onChange: (event) => setProfileForm((prev) => ({ ...prev, specialty: event.target.value })), placeholder: "Chuy\u00EAn khoa", className: "rounded-xl border border-slate-200 px-3 py-2" }), _jsx("input", { value: profileForm.experienceYears, onChange: (event) => setProfileForm((prev) => ({ ...prev, experienceYears: event.target.value })), placeholder: "S\u1ED1 n\u0103m kinh nghi\u1EC7m", className: "rounded-xl border border-slate-200 px-3 py-2" }), _jsx("textarea", { value: profileForm.qualifications, onChange: (event) => setProfileForm((prev) => ({ ...prev, qualifications: event.target.value })), placeholder: "B\u1EB1ng c\u1EA5p / ch\u1EE9ng ch\u1EC9", className: "rounded-xl border border-slate-200 px-3 py-2", rows: 2 }), _jsx("textarea", { value: profileForm.description, onChange: (event) => setProfileForm((prev) => ({ ...prev, description: event.target.value })), placeholder: "M\u00F4 t\u1EA3 chuy\u00EAn m\u00F4n", className: "rounded-xl border border-slate-200 px-3 py-2", rows: 3 }), _jsx("button", { type: "button", onClick: () => void saveProfile(), className: "rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900", children: "L\u01B0u h\u1ED3 s\u01A1" })] })] }), _jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "\u0110\u0103ng k\u00FD l\u1ECBch l\u00E0m vi\u1EC7c" }), _jsxs("div", { className: "mt-3 grid gap-2", children: [_jsx("input", { type: "date", value: slotForm.slotDate, onChange: (event) => setSlotForm((prev) => ({ ...prev, slotDate: event.target.value })), className: "rounded-xl border border-slate-200 px-3 py-2" }), _jsx("input", { type: "time", value: slotForm.startTime, onChange: (event) => setSlotForm((prev) => ({ ...prev, startTime: event.target.value })), className: "rounded-xl border border-slate-200 px-3 py-2" }), _jsx("input", { type: "time", value: slotForm.endTime, onChange: (event) => setSlotForm((prev) => ({ ...prev, endTime: event.target.value })), className: "rounded-xl border border-slate-200 px-3 py-2" }), _jsx("button", { type: "button", onClick: () => void createSlot(), className: "rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700", children: "T\u1EA1o ca l\u00E0m vi\u1EC7c" })] })] })] }), _jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "L\u1ECBch kh\u00E1m b\u1EC7nh nh\u00E2n" }), _jsxs("div", { className: "mt-4 space-y-3", children: [appointments.length === 0 ? _jsx("p", { className: "text-sm text-slate-600", children: "Ch\u01B0a c\u00F3 l\u1ECBch kh\u00E1m." }) : null, appointments.map((item) => (_jsxs("div", { className: "rounded-2xl border border-slate-200 p-4", children: [_jsx("p", { className: "font-semibold text-slate-900", children: item.patient_name }), _jsxs("p", { className: "text-sm text-slate-600", children: [item.slot_date, " | ", item.start_time.slice(0, 5), " - ", item.end_time.slice(0, 5)] }), _jsxs("p", { className: "text-xs text-brand-700", children: ["Tr\u1EA1ng th\u00E1i: ", item.status] }), _jsxs("p", { className: "text-xs text-slate-600", children: ["L\u00FD do kh\u00E1m: ", item.reason ?? "-"] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [["PENDING"].includes(item.status) ? (_jsx("button", { type: "button", onClick: () => void updateStatus(item.id, "CONFIRMED"), className: "rounded-lg border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700", children: "Ch\u1EA5p nh\u1EADn" })) : null, ["PENDING", "CONFIRMED"].includes(item.status) ? (_jsx("button", { type: "button", onClick: () => void updateStatus(item.id, "CANCELLED"), className: "rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700", children: "T\u1EEB ch\u1ED1i/H\u1EE7y" })) : null, item.status === "CONFIRMED" ? (_jsx("button", { type: "button", onClick: () => void updateStatus(item.id, "COMPLETED"), className: "rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700", children: "Ho\u00E0n t\u1EA5t kh\u00E1m" })) : null, ["CONFIRMED", "COMPLETED"].includes(item.status) ? (_jsx("button", { type: "button", onClick: () => void createPrescription(item.id), className: "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700", children: "K\u00EA \u0111\u01A1n \u0111i\u1EC7n t\u1EED" })) : null] })] }, item.id)))] })] }), _jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Th\u00F4ng b\u00E1o cho b\u00E1c s\u0129" }), _jsxs("div", { className: "mt-3 space-y-2", children: [notifications.length === 0 ? _jsx("p", { className: "text-sm text-slate-600", children: "Ch\u01B0a c\u00F3 th\u00F4ng b\u00E1o." }) : null, notifications.map((item) => (_jsxs("div", { className: `rounded-xl border p-3 ${item.is_read ? "border-slate-200" : "border-brand-200 bg-brand-50"}`, children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: item.title }), _jsx("p", { className: "text-xs text-slate-600", children: item.message }), !item.is_read ? (_jsx("button", { type: "button", onClick: () => void markRead(item.id), className: "mt-1 text-xs font-semibold text-brand-700", children: "\u0110\u00E1nh d\u1EA5u \u0111\u00E3 \u0111\u1ECDc" })) : null] }, item.id)))] })] })] }));
};
