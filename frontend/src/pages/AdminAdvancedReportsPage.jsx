import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { adminPortalApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const RECON_PAGE_SIZE = 10;

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

export const AdminAdvancedReportsPage = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("week");
  const [overview, setOverview] = useState(null);
  const [topDepartments, setTopDepartments] = useState([]);
  const [serviceRevenue, setServiceRevenue] = useState([]);
  const [reconRows, setReconRows] = useState([]);
  const [reconMeta, setReconMeta] = useState({ page: 1, totalPages: 1, totalItems: 0, pageSize: RECON_PAGE_SIZE });
  const [reconSummary, setReconSummary] = useState(null);
  const [reconPage, setReconPage] = useState(1);
  const [reconStatus, setReconStatus] = useState("");
  const [reconGateway, setReconGateway] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  const loadReports = async (targetPeriod = period) => {
    const [overviewRes, topDepRes, serviceRes] = await Promise.all([
      adminPortalApi.advancedOverview(targetPeriod),
      adminPortalApi.topDepartments(targetPeriod, 8),
      adminPortalApi.revenueByService(targetPeriod),
    ]);
    setOverview(overviewRes.data.data);
    setTopDepartments(topDepRes.data.data ?? []);
    setServiceRevenue(serviceRes.data.data ?? []);
  };

  const loadReconciliation = async (targetPage = reconPage, targetStatus = reconStatus, targetGateway = reconGateway) => {
    const response = await adminPortalApi.paymentReconciliation({
      page: targetPage,
      pageSize: RECON_PAGE_SIZE,
      status: targetStatus || undefined,
      gateway: targetGateway || undefined,
    });
    setReconRows(response.data.data ?? []);
    const meta = response.data.meta ?? {
      page: targetPage,
      pageSize: RECON_PAGE_SIZE,
      totalItems: response.data.data?.length ?? 0,
      totalPages: 1,
    };
    setReconMeta(meta);
    setReconSummary(meta.summary ?? null);
  };

  useEffect(() => {
    if (!isAdmin) return;
    const bootstrap = async () => {
      try {
        setLoading(true);
        setMessage(null);
        await Promise.all([loadReports(period), loadReconciliation(reconPage, reconStatus, reconGateway)]);
      } catch {
        setMessage("Không thể tải dữ liệu báo cáo quản trị.");
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, period, reconPage]);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Tài khoản hiện tại không có quyền xem báo cáo quản trị.
        </p>
      </section>
    );
  }

  const exportAdvanced = async (format) => {
    try {
      const response = await adminPortalApi.exportAdvancedReport(format, period);
      downloadBlobFile(response.data, `bao-cao-nang-cao-${period}.${format}`);
    } catch {
      setMessage(`Xuất báo cáo ${format.toUpperCase()} thất bại.`);
    }
  };

  const applyReconFilter = async (event) => {
    event.preventDefault();
    setReconPage(1);
    try {
      await loadReconciliation(1, reconStatus, reconGateway);
    } catch {
      setMessage("Không thể tải dữ liệu đối soát.");
    }
  };

  const reconcilePayment = async (paymentId) => {
    try {
      await adminPortalApi.reconcilePayment(paymentId);
      await loadReconciliation(reconPage, reconStatus, reconGateway);
      setMessage("Đối soát giao dịch thành công.");
    } catch {
      setMessage("Không thể dối soát giao dịch này.");
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-14">
      <SectionTitle
        eyebrow="Admin Reports"
        title="Báo cáo quản trị nâng cao"
        description="Tổng hợp dashboard tuần/tháng, top khoa, doanh thu theo dịch vụ, đối soát giao dịch."
      />

      {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                period === "week" ? "bg-brand-700 text-white" : "border border-slate-200 text-slate-700"
              }`}
            >
              Theo tuần
            </button>
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                period === "month" ? "bg-brand-700 text-white" : "border border-slate-200 text-slate-700"
              }`}
            >
              Theo tháng
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void exportAdvanced("csv")}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => void exportAdvanced("pdf")}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              Export PDF
            </button>
          </div>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-500">Đang tải dashboard...</p> : null}

        {overview ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Bệnh nhân mới</p>
              <p className="text-2xl font-black text-slate-900">{overview.summary.new_patients}</p>
              <p className="text-xs text-emerald-600">Tăng trưởng: {overview.growth.new_patients_percent}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Lượt khám</p>
              <p className="text-2xl font-black text-slate-900">{overview.summary.appointments}</p>
              <p className="text-xs text-emerald-600">Tăng trưởng: {overview.growth.appointments_percent}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Doanh thu</p>
              <p className="text-2xl font-black text-slate-900">
                {Number(overview.summary.revenue).toLocaleString("vi-VN")} đ
              </p>
              <p className="text-xs text-emerald-600">Tăng trưởng: {overview.growth.revenue_percent}%</p>
            </div>
          </div>
        ) : null}
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Top khoa đông bệnh nhân</h3>
          <div className="mt-3 space-y-2">
            {topDepartments.length === 0 ? <p className="text-sm text-slate-600">Không có dữ liệu.</p> : null}
            {topDepartments.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">
                  Bệnh nhân: {item.patient_count} | Lượt khám: {item.appointment_count}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Doanh thu theo dịch vụ</h3>
          <div className="mt-3 space-y-2">
            {serviceRevenue.length === 0 ? <p className="text-sm text-slate-600">Không có dữ liệu.</p> : null}
            {serviceRevenue.map((item, index) => (
              <div key={`${item.service_name}-${index}`} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.service_name}</p>
                <p className="text-xs text-slate-600">
                  Doanh thu: {Number(item.total_revenue).toLocaleString("vi-VN")} đ | Giao dịch:{" "}
                  {item.total_transactions}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">Đối soát giao dịch thanh toán</h3>
          {reconSummary ? (
            <p className="text-xs text-slate-500">
              Tổng: {reconSummary.total_transactions} | Pending: {reconSummary.pending_transactions} | Chưa đối soát:{" "}
              {reconSummary.paid_unreconciled_transactions} | DT paid:{" "}
              {Number(reconSummary.paid_revenue).toLocaleString("vi-VN")} đ
            </p>
          ) : null}
        </div>

        <form onSubmit={applyReconFilter} className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={reconGateway}
            onChange={(event) => setReconGateway(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tất cả gateway</option>
            <option value="DIRECT">DIRECT</option>
            <option value="VNPAY">VNPAY</option>
            <option value="MOMO">MOMO</option>
          </select>
          <select
            value={reconStatus}
            onChange={(event) => setReconStatus(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-900"
          >
            Lọc
          </button>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Gateway</th>
                <th className="px-3 py-2">Số tiền</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Đối soát</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reconRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-500">
                    Chưa có dữ liệu đối soát.
                  </td>
                </tr>
              ) : null}
              {reconRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{row.invoice_code}</td>
                  <td className="px-3 py-2">
                    {row.payment_gateway} ({row.payment_method})
                  </td>
                  <td className="px-3 py-2">{Number(row.amount).toLocaleString("vi-VN")} đ</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.reconciled_at ? new Date(row.reconciled_at).toLocaleString("vi-VN") : "-"}</td>
                  <td className="px-3 py-2">
                    {row.status === "PAID" && !row.reconciled_at ? (
                      <button
                        type="button"
                        onClick={() => void reconcilePayment(row.id)}
                        className="rounded-lg border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700"
                      >
                        Đối soát
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setReconPage((prev) => Math.max(1, prev - 1))}
            disabled={reconMeta.page <= 1}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-xs text-slate-600">
            {reconMeta.page} / {Math.max(1, reconMeta.totalPages)}
          </span>
          <button
            type="button"
            onClick={() => setReconPage((prev) => Math.min(Math.max(1, reconMeta.totalPages), prev + 1))}
            disabled={reconMeta.page >= Math.max(1, reconMeta.totalPages)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </article>
    </section>
  );
};
