import { useEffect, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { doctorPortalApi } from "../lib/api";

const toNotificationSnippet = (value, maxLength = 90) => {
  if (!value) {
    return "";
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength).trimEnd()}...`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("vi-VN");
};

export const DoctorDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
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
    setAppointments(appointmentsRes.data.data ?? []);
    setNotifications(notificationsRes.data.data ?? []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await loadData();
      } catch {
        setMessage("Không thể tải dữ liệu cổng bác sĩ.");
      } finally {
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
    } catch {
      setMessage("Cập nhật hồ sơ bác sĩ thất bại.");
    }
  };

  const createSlot = async () => {
    try {
      await doctorPortalApi.createSlot(slotForm);
      setMessage("Tạo lịch làm việc thành công.");
      setSlotForm({ slotDate: "", startTime: "08:00", endTime: "08:30" });
      await loadData();
    } catch {
      setMessage("Tạo lịch làm việc thất bại.");
    }
  };

  const updateStatus = async (bookingId, status) => {
    const reason =
      status === "CANCELLED"
        ? window.prompt("Lý do từ chối/hủy lịch:", "Bác sĩ bận lịch trực đột xuất") ?? undefined
        : undefined;
    const diagnosis =
      status === "COMPLETED"
        ? window.prompt("Nhập chẩn đoán sau khám:", "Theo dõi thêm triệu chứng") ?? undefined
        : undefined;
    const doctorNote =
      status === "COMPLETED"
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
    } catch {
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
            dosage: "1 vien",
            frequency: "2 lan/ngay",
            duration: "3 ngay",
          },
        ],
        advice: advice.trim() || undefined,
      });
      setMessage("Cập nhật đơn thuốc điện tử thành công.");
    } catch {
      setMessage("Cập nhật đơn thuốc thất bại.");
    }
  };

  const markRead = async (notificationId, options) => {
    const silent = options?.silent ?? false;
    try {
      await doctorPortalApi.readNotification(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)),
      );
      setSelectedNotification((prev) =>
        prev?.id === notificationId ? { ...prev, is_read: true } : prev,
      );
    } catch {
      if (!silent) {
        setMessage("Không thể cập nhật thông báo.");
      }
    }
  };

  const openNotificationDetail = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      await markRead(notification.id, { silent: true });
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-sm text-slate-600">Đang tải cổng bác sĩ...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-14">
      <SectionTitle
        eyebrow="Doctor Portal"
        title="Khu vực tác nghiệp dành cho bác sĩ"
        description="Quản lý hồ sơ chuyên môn, lịch làm việc, lịch hẹn bệnh nhân và cập nhật bệnh án điện tử."
      />

      {message ? (
        <p className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Hồ sơ chuyên môn</h3>
          <p className="mt-1 text-xs text-slate-500">Mã bác sĩ: {profile?.doctor_code}</p>
          <div className="mt-4 grid gap-2">
            <input
              value={profileForm.specialty}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, specialty: event.target.value }))}
              placeholder="Chuyên khoa"
              className="rounded-xl border border-slate-200 px-3 py-2"
            />
            <input
              value={profileForm.experienceYears}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, experienceYears: event.target.value }))}
              placeholder="Số năm kinh nghiệm"
              className="rounded-xl border border-slate-200 px-3 py-2"
            />
            <textarea
              value={profileForm.qualifications}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, qualifications: event.target.value }))}
              placeholder="Bằng cấp / chứng chỉ"
              className="rounded-xl border border-slate-200 px-3 py-2"
              rows={2}
            />
            <textarea
              value={profileForm.description}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Mô tả chuyên môn"
              className="rounded-xl border border-slate-200 px-3 py-2"
              rows={3}
            />
            <button
              type="button"
              onClick={() => void saveProfile()}
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
            >
              Lưu hồ sơ
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Đăng ký lịch làm việc</h3>
          <div className="mt-3 grid gap-2">
            <input
              type="date"
              value={slotForm.slotDate}
              onChange={(event) => setSlotForm((prev) => ({ ...prev, slotDate: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2"
            />
            <input
              type="time"
              value={slotForm.startTime}
              onChange={(event) => setSlotForm((prev) => ({ ...prev, startTime: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2"
            />
            <input
              type="time"
              value={slotForm.endTime}
              onChange={(event) => setSlotForm((prev) => ({ ...prev, endTime: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2"
            />
            <button
              type="button"
              onClick={() => void createSlot()}
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
            >
              Tạo ca làm việc
            </button>
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Lịch khám bệnh nhân</h3>
        <div className="mt-4 space-y-3">
          {appointments.length === 0 ? <p className="text-sm text-slate-600">Chưa có lịch khám.</p> : null}
          {appointments.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{item.patient_name}</p>
              <p className="text-sm text-slate-600">
                {item.slot_date} | {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
              </p>
              <p className="text-xs text-brand-700">Trạng thái: {item.status}</p>
              <p className="text-xs text-slate-600">Lý do khám: {item.reason ?? "-"}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {["PENDING"].includes(item.status) ? (
                  <button
                    type="button"
                    onClick={() => void updateStatus(item.id, "CONFIRMED")}
                    className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    Chấp nhận
                  </button>
                ) : null}
                {["PENDING", "CONFIRMED"].includes(item.status) ? (
                  <button
                    type="button"
                    onClick={() => void updateStatus(item.id, "CANCELLED")}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    Từ chối/Hủy
                  </button>
                ) : null}
                {item.status === "CONFIRMED" ? (
                  <button
                    type="button"
                    onClick={() => void updateStatus(item.id, "COMPLETED")}
                    className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700"
                  >
                    Hoàn tất khám
                  </button>
                ) : null}
                {["CONFIRMED", "COMPLETED"].includes(item.status) ? (
                  <button
                    type="button"
                    onClick={() => void createPrescription(item.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Kê đơn điện tử
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Thông báo cho bác sĩ</h3>
        <div className="mt-3 space-y-2">
          {notifications.length === 0 ? <p className="text-sm text-slate-600">Chưa có thông báo.</p> : null}
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void openNotificationDetail(item)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                item.is_read ? "border-slate-200 hover:bg-slate-50" : "border-brand-200 bg-brand-50 hover:bg-brand-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {!item.is_read ? (
                  <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Mới
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-slate-600">{toNotificationSnippet(item.message)}</p>
              <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(item.created_at)}</p>
            </button>
          ))}
        </div>
      </article>

      {selectedNotification ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedNotification.title}</h4>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(selectedNotification.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
              >
                Đóng
              </button>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedNotification.message}</p>

            {!selectedNotification.is_read ? (
              <button
                type="button"
                onClick={() => void markRead(selectedNotification.id)}
                className="mt-4 rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700"
              >
                Đánh dấu đã đọc
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
};
