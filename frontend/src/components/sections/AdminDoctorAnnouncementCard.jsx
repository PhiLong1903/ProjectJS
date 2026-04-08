import { useMemo, useState } from "react";
import { adminPortalApi } from "../../lib/api";

export const AdminDoctorAnnouncementCard = ({ doctors, onSuccess, onError }) => {
  const [form, setForm] = useState({
    targetMode: "ALL",
    doctorId: "",
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDoctors = useMemo(
    () => (doctors ?? []).filter((item) => item?.is_active),
    [doctors],
  );

  const submitAnnouncement = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        sendToAllDoctors: form.targetMode === "ALL",
        doctorId: form.targetMode === "ONE" ? form.doctorId : undefined,
      };

      const response = await adminPortalApi.createDoctorAnnouncement(payload);
      const result = response.data.data;
      setForm((prev) => ({
        ...prev,
        title: "",
        message: "",
      }));

      if (onSuccess) {
        await onSuccess(result);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitAnnouncement} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-bold text-slate-900">Gui thong bao cho bac si</h4>
      <p className="mt-1 text-xs text-slate-600">
        Gui nhanh thong bao noi bo cho tat ca bac si hoac mot bac si cu the.
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="doctor-announcement-target"
            checked={form.targetMode === "ALL"}
            onChange={() => setForm((prev) => ({ ...prev, targetMode: "ALL" }))}
          />
          Tat ca bac si ({activeDoctors.length})
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="doctor-announcement-target"
            checked={form.targetMode === "ONE"}
            onChange={() => setForm((prev) => ({ ...prev, targetMode: "ONE" }))}
          />
          Mot bac si
        </label>
      </div>

      {form.targetMode === "ONE" ? (
        <select
          required
          value={form.doctorId}
          onChange={(event) => setForm((prev) => ({ ...prev, doctorId: event.target.value }))}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">-- Chon bac si --</option>
          {activeDoctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name} ({doctor.doctor_code}) - {doctor.department_name}
            </option>
          ))}
        </select>
      ) : null}

      <div className="mt-3 grid gap-2">
        <input
          required
          maxLength={180}
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder="Tieu de thong bao"
        />
        <textarea
          required
          rows={3}
          maxLength={4000}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder="Noi dung thong bao"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (form.targetMode === "ONE" && !form.doctorId)}
        className="mt-3 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Dang gui..." : "Gui thong bao"}
      </button>
    </form>
  );
};

