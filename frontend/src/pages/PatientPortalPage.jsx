import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { patientPortalApi, publicApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const ONLINE_METHODS = ["VNPAY", "MOMO"];
const PAYMENT_METHODS = ["VNPAY", "MOMO", "BANK_TRANSFER", "CARD", "EWALLET", "CASH"];
const PAYABLE_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"];

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const formatMoney = (value) => Number(value ?? 0).toLocaleString("vi-VN");

const downloadBlobFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const PatientPortalPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phoneNumber: "",
    healthInsuranceNumber: "",
  });
  const [view, setView] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [labs, setLabs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const paidAppointmentIds = useMemo(
    () => new Set(payments.filter((item) => item.status === "PAID").map((item) => item.appointment_id)),
    [payments]
  );

  const hasPayableBookings = useMemo(
    () =>
      bookings.some(
        (booking) => !paidAppointmentIds.has(booking.id) && PAYABLE_BOOKING_STATUSES.includes(booking.status)
      ),
    [bookings, paidAppointmentIds]
  );

  const loadPortalData = async (bookingView) => {
    const [profileRes, bookingsRes, labRes, prescriptionRes, paymentRes, notificationRes] = await Promise.all([
      patientPortalApi.profile(),
      patientPortalApi.bookings(bookingView),
      patientPortalApi.labResults(),
      patientPortalApi.prescriptions(),
      patientPortalApi.payments(),
      patientPortalApi.notifications(),
    ]);

    const profileData = profileRes.data.data;
    setProfile(profileData);
    setProfileForm({
      fullName: profileData.full_name,
      dateOfBirth: profileData.date_of_birth ?? "",
      gender: profileData.gender ?? "",
      address: profileData.address ?? "",
      phoneNumber: profileData.phone_number,
      healthInsuranceNumber: profileData.health_insurance_number ?? "",
    });
    setBookings(bookingsRes.data.data ?? []);
    setLabs(labRes.data.data ?? []);
    setPrescriptions(prescriptionRes.data.data ?? []);
    setPayments(paymentRes.data.data ?? []);
    setNotifications(notificationRes.data.data ?? []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await loadPortalData(view);
      } catch {
        setMessage("Không thể tải dữ liệu cổng bệnh nhân.");
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, [view]);

  const saveProfile = async () => {
    try {
      const response = await patientPortalApi.updateProfile({
        fullName: profileForm.fullName,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        gender: profileForm.gender || undefined,
        address: profileForm.address || undefined,
        phoneNumber: profileForm.phoneNumber,
        healthInsuranceNumber: profileForm.healthInsuranceNumber || undefined,
      });
      setProfile(response.data.data);
      setMessage("Cập nhật hồ sơ bệnh nhân thành công.");
    } catch {
      setMessage("Cập nhật hồ sơ thất bại.");
    }
  };

  const cancelBooking = async (bookingId) => {
    const reason = window.prompt("Nhập lý do hủy lịch khám:", "Bận việc cá nhân")?.trim();
    if (!reason) return;
    try {
      await patientPortalApi.cancelBooking(bookingId, reason);
      await loadPortalData(view);
      setMessage("Hủy lịch khám thành công.");
    } catch {
      setMessage("Không thể hủy lịch khám.");
    }
  };

  const openReschedule = async (booking) => {
    if (!booking.doctor_id || !booking.slot_id) {
      setMessage("Thiếu dữ liệu để đổi lịch khám.");
      return;
    }

    try {
      const slotsRes = await publicApi.doctorSlots(booking.doctor_id);
      const available = (slotsRes.data.data ?? []).filter((slot) => slot.is_available && slot.id !== booking.slot_id);
      setRescheduleSlots(available);
      setRescheduleBookingId(booking.id);
      setRescheduleSlotId(available[0]?.id ?? "");
      setRescheduleReason("Đổi lịch do thay đổi công việc cá nhân");
    } catch {
      setMessage("Không thể tải khung giờ để đổi lịch.");
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleBookingId || !rescheduleSlotId || !rescheduleReason.trim()) {
      setMessage("Vui lòng chọn khung giờ mới và nhập lý do đổi lịch.");
      return;
    }

    try {
      await patientPortalApi.rescheduleBooking(rescheduleBookingId, {
        newSlotId: rescheduleSlotId,
        reason: rescheduleReason,
      });
      setRescheduleBookingId(null);
      setRescheduleSlots([]);
      setRescheduleSlotId("");
      setRescheduleReason("");
      await loadPortalData(view);
      setMessage("Đổi lịch khám thành công.");
    } catch {
      setMessage("Không thể đổi lịch khám.");
    }
  };

  const payBooking = async (appointmentId) => {
    const methodInput = window
      .prompt(`Chọn phương thức thanh toán: ${PAYMENT_METHODS.join(", ")}`, "VNPAY")
      ?.trim()
      .toUpperCase();
    if (!methodInput) return;

    if (!PAYMENT_METHODS.includes(methodInput)) {
      setMessage("Phương thức thanh toán không hợp lệ.");
      return;
    }

    try {
      const response = await patientPortalApi.createPayment({
        appointmentId,
        amount: 250000,
        method: methodInput,
        serviceName: "Kham tong quat",
      });

      const payment = response.data.data;
      if (ONLINE_METHODS.includes(methodInput) && payment.status === "PENDING") {
        const shouldConfirm = window.confirm(
          `Đã tạo giao dịch ${methodInput} mô phỏng.\nBạn có muốn xác nhận thanh toán ngay không?`
        );
        if (shouldConfirm) {
          await patientPortalApi.confirmPayment(payment.id, {});
          setMessage("Thanh toán online mô phỏng thành công.");
        } else {
          setMessage("Đã tạo giao dịch chờ xác nhận. Bạn có thể xác nhận ở mục Lịch sử thanh toán.");
        }
      } else {
        setMessage("Thanh toán thành công. Hóa đơn đã được ghi nhận.");
      }

      await loadPortalData(view);
    } catch (error) {
      const errorMessage = error?.response?.data?.message ?? error?.response?.data?.error ?? "Thanh toán thất bại.";
      setMessage(errorMessage);
    }
  };

  const confirmPayment = async (paymentId) => {
    try {
      await patientPortalApi.confirmPayment(paymentId, {});
      await loadPortalData(view);
      setMessage("Xác nhận giao dịch thành công.");
    } catch {
      setMessage("Không thể xác nhận giao dịch.");
    }
  };

  const failPayment = async (paymentId) => {
    const reason = window.prompt("Nhập lý do thất bại:", "Người dùng hủy giao dịch")?.trim();
    try {
      await patientPortalApi.failPayment(paymentId, { reason: reason || undefined });
      await loadPortalData(view);
      setMessage("Đã cập nhật giao dịch thất bại.");
    } catch {
      setMessage("Không thể cập nhật giao dịch.");
    }
  };

  const downloadInvoice = async (payment) => {
    try {
      const response = await patientPortalApi.downloadInvoicePdf(payment.id);
      const filename = `${payment.invoice_code || `invoice-${payment.id}`}.pdf`;
      downloadBlobFile(response.data, filename);
    } catch {
      setMessage("Không thể tải hóa đơn PDF.");
    }
  };

  const reviewBooking = async (appointmentId) => {
    const ratingRaw = window.prompt("Đánh giá bác sĩ (1-5 sao):", "5");
    const rating = Number(ratingRaw);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage("Đánh giá không hợp lệ.");
      return;
    }
    const comment = window.prompt("Nhận xét của bạn:", "Bác sĩ tư vấn tận tình") ?? "";

    try {
      await patientPortalApi.createReview({ appointmentId, rating, comment: comment.trim() || undefined });
      setMessage("Gửi đánh giá thành công.");
    } catch {
      setMessage("Không thể gửi đánh giá (có thể đã đánh giá trước đó).");
    }
  };

  const markRead = async (notificationId) => {
    try {
      await patientPortalApi.readNotification(notificationId);
      setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)));
    } catch {
      setMessage("Không thể cập nhật trạng thái thông báo.");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-sm text-slate-600">Đang tải cổng bệnh nhân...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-14">
      <SectionTitle
        eyebrow="Patient Portal"
        title="Quan ly hanh trinh kham benh"
        description="Hồ sơ cá nhân, lịch khám, kết quả, thanh toán và thông báo."
      />

      {message ? (
        <p className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
      ) : null}

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h3>
        <p className="mt-1 text-xs text-slate-500">Mã bệnh nhân: {profile?.patient_code}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={profileForm.fullName}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
            placeholder="Ho ten"
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
          <input
            value={profileForm.phoneNumber}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
            placeholder="Số điện thoại"
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
          <input
            type="date"
            value={profileForm.dateOfBirth}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
          <select
            value={profileForm.gender}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, gender: event.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">-- Giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nu">Nu</option>
            <option value="Khác">Khác</option>
          </select>
          <input
            value={profileForm.healthInsuranceNumber}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, healthInsuranceNumber: event.target.value }))}
            placeholder="Ma BHYT"
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
          <input
            value={profileForm.address}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))}
            placeholder="Địa chỉ"
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={() => void saveProfile()}
          className="mt-4 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Lưu hồ sơ
        </button>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">Lịch khám của tôi</h3>
          <div className="flex rounded-xl border border-slate-200 p-1 text-sm">
            <button
              type="button"
              onClick={() => setView("upcoming")}
              className={`rounded-lg px-3 py-1 ${view === "upcoming" ? "bg-brand-700 text-white" : "text-slate-700"}`}
            >
              Sắp tới
            </button>
            <button
              type="button"
              onClick={() => setView("history")}
              className={`rounded-lg px-3 py-1 ${view === "history" ? "bg-brand-700 text-white" : "text-slate-700"}`}
            >
              Lịch sử
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {bookings.length === 0 ? <p className="text-sm text-slate-600">Chưa có lịch khám.</p> : null}
          {bookings.length > 0 && !hasPayableBookings ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Chưa có lịch khám nào đủ điều kiện thanh toán (chỉ áp dụng cho PENDING, CONFIRMED, COMPLETED và chưa PAID).
            </p>
          ) : null}
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">
                {booking.department_name} - {booking.doctor_name}
              </p>
              <p className="text-sm text-slate-600">
                {booking.slot_date} | {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
              </p>
              <p className="text-xs text-brand-700">Trạng thái: {booking.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["PENDING", "CONFIRMED"].includes(booking.status) ? (
                  <button
                    type="button"
                    onClick={() => void cancelBooking(booking.id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    Hủy lịch
                  </button>
                ) : null}
                {["PENDING", "CONFIRMED"].includes(booking.status) ? (
                  <button
                    type="button"
                    onClick={() => void openReschedule(booking)}
                    className="rounded-lg border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700"
                  >
                    Đổi lịch
                  </button>
                ) : null}
                {!paidAppointmentIds.has(booking.id) && PAYABLE_BOOKING_STATUSES.includes(booking.status) ? (
                  <button
                    type="button"
                    onClick={() => void payBooking(booking.id)}
                    className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    Thanh toán 250.000đ
                  </button>
                ) : null}
                {booking.status === "COMPLETED" ? (
                  <button
                    type="button"
                    onClick={() => void reviewBooking(booking.id)}
                    className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700"
                  >
                    Đánh giá bác sĩ
                  </button>
                ) : null}
              </div>

              {rescheduleBookingId === booking.id ? (
                <div className="mt-3 rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold text-slate-700">Chọn khung giờ mới</p>
                  <select
                    value={rescheduleSlotId}
                    onChange={(event) => setRescheduleSlotId(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn giờ mới --</option>
                    {rescheduleSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.slot_date} | {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={rescheduleReason}
                    onChange={(event) => setRescheduleReason(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Ly do doi lich"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void submitReschedule()}
                      className="rounded-lg bg-brand-700 px-3 py-1 text-xs font-semibold text-white"
                    >
                      X?c nh?n Đổi lịch
                    </button>
                    <button
                      type="button"
                      onClick={() => setRescheduleBookingId(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      Huy
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Đơn thuốc điện tử</h3>
          <div className="mt-3 space-y-2">
            {prescriptions.length === 0 ? <p className="text-sm text-slate-600">Chưa có đơn thuốc.</p> : null}
            {prescriptions.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.doctor_name ?? "Bác sĩ"}</p>
                <p className="text-xs text-slate-600">Chẩn đoán: {item.diagnosis ?? "-"}</p>
                <p className="text-xs text-slate-600">Dặn dò: {item.advice ?? "-"}</p>
                <p className="text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Kết quả cận lâm sàng</h3>
          <div className="mt-3 space-y-2">
            {labs.length === 0 ? <p className="text-sm text-slate-600">Chưa có kết quả.</p> : null}
            {labs.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.test_name}</p>
                <p className="text-xs text-slate-600">{item.result_summary ?? "Đang cập nhật"}</p>
                <p className="text-xs text-slate-500">Thoi gian: {formatDateTime(item.performed_at)}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Lịch sử thanh toán</h3>
          <div className="mt-3 space-y-2">
            {payments.length === 0 ? <p className="text-sm text-slate-600">Chưa có giao dịch.</p> : null}
            {payments.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.invoice_code}</p>
                <p className="text-xs text-slate-600">
                  {formatMoney(item.amount)} d - {item.payment_method} - {item.status}
                </p>
                <p className="text-xs text-slate-600">
                  Gateway: {item.payment_gateway ?? "DIRECT"} | Dịch vụ: {item.service_snapshot ?? "-"}
                </p>
                <p className="text-xs text-slate-500">{formatDateTime(item.paid_at ?? item.created_at)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.status === "PENDING" && ONLINE_METHODS.includes(item.payment_method) ? (
                    <button
                      type="button"
                      onClick={() => void confirmPayment(item.id)}
                      className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      Xác nhận thanh toán
                    </button>
                  ) : null}
                  {item.status === "PENDING" && ONLINE_METHODS.includes(item.payment_method) ? (
                    <button
                      type="button"
                      onClick={() => void failPayment(item.id)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                    >
                      Đánh dấu thất bại
                    </button>
                  ) : null}
                  {item.status === "PAID" ? (
                    <button
                      type="button"
                      onClick={() => void downloadInvoice(item)}
                      className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700"
                    >
                      Tải hóa đơn PDF
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Thông báo</h3>
          <div className="mt-3 space-y-2">
            {notifications.length === 0 ? <p className="text-sm text-slate-600">Chưa có thông báo.</p> : null}
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 ${item.is_read ? "border-slate-200" : "border-brand-200 bg-brand-50"}`}
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.message}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                  {!item.is_read ? (
                    <button
                      type="button"
                      onClick={() => void markRead(item.id)}
                      className="text-xs font-semibold text-brand-700"
                    >
                      Đánh dấu đã đọc
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {user ? <p className="text-xs text-slate-500">Tài khoản hiện tại: {user.email}</p> : null}
    </section>
  );
};
