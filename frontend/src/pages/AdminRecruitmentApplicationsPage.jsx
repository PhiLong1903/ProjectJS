import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { adminApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];

const downloadBlobFile = (blob, filenăme) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filenăme;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const buildDrafts = (rows) => {
  const next = {};
  for (const row of rows) {
    next[row.id] = {
      status: row.status,
      feedbackMessage: row.feedback_message ?? "",
    };
  }
  return next;
};

export const AdminRecruitmentApplicationsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [draftById, setDraftById] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  const loadData = async (targetPage = page, targetKeyword = keyword, targetStatus = statusFilter) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await adminApi.recruitmentApplications({
        page: targetPage,
        pageSize: PAGE_SIZE,
        keyword: targetKeyword.trim() || undefined,
        status: targetStatus || undefined,
      });

      const rows = response.data.data ?? [];
      setItems(rows);
      setDraftById(buildDrafts(rows));
      setMeta(
        response.data.meta ?? {
          page: targetPage,
          pageSize: PAGE_SIZE,
          totalItems: rows.length,
          totalPages: 1,
        }
      );
    } catch (error) {
      const fallbackMessage = "Không thể tải danh sách hồ sơ ứng tuyển.";
      const errorMessage = error?.response?.data?.message ?? error?.response?.data?.error ?? fallbackMessage;
      setMessage(errorMessage);
      setItems([]);
      setDraftById({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    void loadData(page, keyword, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page]);

  const selectedStatusLabel = useMemo(
    () => (statusFilter ? `Trạng thái: ${statusFilter}` : "Tất cả trạng thái"),
    [statusFilter]
  );

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Tài khoản hiện tại không có quyền xem dữ liệu ứng tuyển.
        </p>
      </section>
    );
  }

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(1);
    await loadData(1, keyword, statusFilter);
  };

  const downloadCv = async (application) => {
    try {
      const response = await adminApi.downloadRecruitmentApplicationCv(application.id);
      downloadBlobFile(response.data, application.cv_original_năme || `cv-${application.id}.pdf`);
    } catch {
      setMessage("Không thể tải CV của ứng viên này.");
    }
  };

  const updateDraft = (id, field, value) => {
    setDraftById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { status: "PENDING", feedbackMessage: "" }),
        [field]: value,
      },
    }));
  };

  const saveStatus = async (applicationId) => {
    const draft = draftById[applicationId];
    if (!draft?.status) {
      setMessage("Vui lòng chọn trạng thái hồ sơ.");
      return;
    }

    try {
      setSavingId(applicationId);
      await adminApi.updateRecruitmentApplicationStatus(applicationId, {
        status: draft.status,
        feedbackMessage: draft.feedbackMessage?.trim() || undefined,
      });
      setMessage("Cập nhật trạng thái và gửi phản hồi email thành công.");
      await loadData(page, keyword, statusFilter);
    } catch (error) {
      const fallbackMessage = "Cập nhật trạng thái hồ sơ thất bại.";
      const errorMessage = error?.response?.data?.message ?? error?.response?.data?.error ?? fallbackMessage;
      setMessage(errorMessage);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-14">
      <SectionTitle
        eyebrow="Recruitment"
        title="Danh sách hồ sơ ứng tuyển"
        description="Cập nhật trạng thái hồ sơ và gửi phản hồi email cho ứng viên ngay trên trang quản trị."
      />

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tim theo ten, email, vi tri..."
            className="min-w-[240px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Tìm kiếm
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-500">
          Trang {meta.page}/{Math.max(1, meta.totalPages)} - Tổng hồ sơ: {meta.totalItems} - {selectedStatusLabel}
        </p>

        {message ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 font-semibold text-slate-700">Ứng viên</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Vị trí</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Kinh nghiệm</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Trạng thái</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Phản hồi</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Ngày nộp</th>
                <th className="px-3 py-2 font-semibold text-slate-700">CV</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                    Chưa có hồ sơ ứng tuyển nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? items.map((item) => {
                    const draft = draftById[item.id] ?? {
                      status: item.status,
                      feedbackMessage: item.feedback_message ?? "",
                    };

                    return (
                      <tr key={item.id} className="border-b border-slate-100 align-top">
                        <td className="px-3 py-3 text-slate-800">
                          <p className="font-semibold">{item.full_năme}</p>
                          <p className="text-xs text-slate-600">{item.email}</p>
                          <p className="text-xs text-slate-500">{item.phone_number}</p>
                        </td>
                        <td className="px-3 py-3 text-slate-700">{item.applied_position}</td>
                        <td className="px-3 py-3 text-slate-700">
                          {item.years_experience !== null && item.years_experience !== undefined
                            ? `${item.years_experience} năm`
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={draft.status}
                            onChange={(event) => updateDraft(item.id, "status", event.target.value)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-[11px] text-slate-500">
                            Reviewed: {item.reviewed_at ? new Date(item.reviewed_at).toLocaleString("vi-VN") : "-"}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <textarea
                            value={draft.feedbackMessage}
                            onChange={(event) => updateDraft(item.id, "feedbackMessage", event.target.value)}
                            placeholder="Nội dung phản hồi email cho ứng viên"
                            rows={3}
                            className="min-w-[220px] rounded-lg border border-slate-200 px-2 py-1 text-xs"
                          />
                          <p className="mt-1 text-[11px] text-slate-500">
                            Mail:{" "}
                            {item.feedback_sent_at ? new Date(item.feedback_sent_at).toLocaleString("vi-VN") : "chưa gửi"}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-slate-700">{new Date(item.created_at).toLocaleString("vi-VN")}</td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => void downloadCv(item)}
                            className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Tai CV
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => void saveStatus(item.id)}
                            disabled={savingId === item.id}
                            className="rounded-lg bg-brand-700 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingId === item.id ? "Đang lưu..." : "Lưu"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={meta.page <= 1}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-xs text-slate-600">
            {meta.page} / {Math.max(1, meta.totalPages)}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(Math.max(1, meta.totalPages), prev + 1))}
            disabled={meta.page >= Math.max(1, meta.totalPages)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </article>
    </section>
  );
};
