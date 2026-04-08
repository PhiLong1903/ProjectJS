import { useState } from "react";
import { publicApi } from "../../lib/api";

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const formatMoney = (value) => Number(value ?? 0).toLocaleString("vi-VN");

export const LabLookupForm = () => {
  const [patientCode, setPatientCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [record, setRecord] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      setIsSubmitting(true);
      const response = await publicApi.lookupPatientRecords({ patientCode, phoneNumber });
      setRecord(response.data.data);
      setMessage("Tra cứu hồ sơ khám bệnh thành công.");
    } catch {
      setRecord(null);
      setMessage("Không tìm thấy dữ liệu hoặc thông tin chưa chính xác.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Tra cứu hồ sơ khám bệnh</h3>
      <p className="mt-2 text-sm text-slate-600">
        Nhập mã bệnh nhân và số điện thoại để xem lịch sử khám, cận lâm sàng, đơn thuốc và thanh toán.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <label className="text-sm font-medium text-slate-700">
          Mã bệnh nhân
          <input
            required
            value={patientCode}
            onChange={(event) => setPatientCode(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="VD: BN20260001"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Số điện thoại
          <input
            required
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="VD: 0901234567"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang tra cứu..." : "Tra cứu hồ sơ"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-brand-900">{message}</p> : null}

      {record ? (
        <div className="mt-6 space-y-6">
          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-bold text-slate-900">Thông tin bệnh nhân</h4>
            <div className="mt-2 grid gap-1 text-sm text-slate-700">
              <p>
                <strong>Họ tên:</strong> {record.patient.full_name}
              </p>
              <p>
                <strong>Mã bệnh nhân:</strong> {record.patient.patient_code}
              </p>
              <p>
                <strong>Email:</strong> {record.patient.email ?? "--"}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {record.patient.phone_number}
              </p>
              <p>
                <strong>Ngày sinh:</strong> {record.patient.date_of_birth ?? "--"}
              </p>
              <p>
                <strong>Giới tính:</strong> {record.patient.gender ?? "--"}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-bold text-slate-900">Tổng quan</h4>
            <p className="mt-2 text-sm text-slate-700">
              Lượt khám: <strong>{record.summary.total_appointments}</strong> | Cận lâm sàng:{" "}
              <strong>{record.summary.total_lab_results}</strong> | Đơn thuốc:{" "}
              <strong>{record.summary.total_prescriptions}</strong> | Giao dịch:{" "}
              <strong>{record.summary.total_payments}</strong>
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-bold text-slate-900">Lịch sử khám bệnh</h4>
            <div className="mt-3 space-y-2">
              {record.appointments.length === 0 ? <p className="text-sm text-slate-600">Chưa có dữ liệu.</p> : null}
              {record.appointments.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.department_name} - {item.doctor_name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {item.slot_date} | {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                  </p>
                  <p className="text-xs text-slate-600">Trạng thái: {item.status}</p>
                  <p className="text-xs text-slate-600">Chẩn đoán: {item.diagnosis ?? "--"}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-bold text-slate-900">Kết quả cận lâm sàng</h4>
            <div className="mt-3 space-y-2">
              {record.lab_results.length === 0 ? <p className="text-sm text-slate-600">Chưa có dữ liệu.</p> : null}
              {record.lab_results.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.test_name} ({item.test_code})
                  </p>
                  <p className="text-xs text-slate-600">Tóm tắt: {item.result_summary ?? "--"}</p>
                  <p className="text-xs text-slate-600">Kết luận: {item.conclusion ?? "--"}</p>
                  <p className="text-xs text-slate-500">Thời gian: {formatDateTime(item.performed_at)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-bold text-slate-900">Đơn thuốc điện tử</h4>
            <div className="mt-3 space-y-2">
              {record.prescriptions.length === 0 ? <p className="text-sm text-slate-600">Chưa có dữ liệu.</p> : null}
              {record.prescriptions.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.doctor_name ?? "Bác sĩ"}</p>
                  <p className="text-xs text-slate-600">Chẩn đoán: {item.diagnosis ?? "--"}</p>
                  <p className="text-xs text-slate-600">Dặn dò: {item.advice ?? "--"}</p>
                  <p className="text-xs text-slate-500">Ngày tạo: {formatDateTime(item.created_at)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-bold text-slate-900">Lịch sử thanh toán</h4>
            <div className="mt-3 space-y-2">
              {record.payments.length === 0 ? <p className="text-sm text-slate-600">Chưa có dữ liệu.</p> : null}
              {record.payments.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.invoice_code}</p>
                  <p className="text-xs text-slate-600">
                    {formatMoney(item.amount)} đ - {item.payment_method} - {item.status}
                  </p>
                  <p className="text-xs text-slate-500">Thời gian: {formatDateTime(item.paid_at ?? item.created_at)}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
};
