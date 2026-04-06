import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { patientPortalApi } from "../lib/api";

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

export const EInvoicePage = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await patientPortalApi.payments();
        setPayments(response.data.data ?? []);
      } catch {
        setMessage("Không thể tải danh sách hóa đơn điện tử.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const paidInvoices = useMemo(() => payments.filter((item) => item.status === "PAID"), [payments]);

  const downloadInvoice = async (payment) => {
    try {
      const response = await patientPortalApi.downloadInvoicePdf(payment.id);
      downloadBlobFile(response.data, `${payment.invoice_code || payment.id}.pdf`);
    } catch {
      setMessage("Không thể tải hóa đơn PDF.");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-sm text-slate-600">Đang tải hóa đơn điện tử...</p>
      </section>
    );
  }

  if (message) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }

  if (paidInvoices.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <p className="mt-3 text-slate-600">Không tìm thấy hóa đơn điện tử đã thanh toán.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-14">
      <SectionTitle
        eyebrow="Hóa Đơn Điện Tử"
        title="Danh sách hóa đơn đã thanh toán"
        description="Bạn có thể tải hóa đơn PDF cho từng giao dịch đã thành công."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-700">Mã hóa đơn</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Số tiền</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Phương thức</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Ngày thanh toán</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paidInvoices.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-semibold text-slate-900">{item.invoice_code}</td>
                  <td className="px-3 py-2 text-slate-700">{Number(item.amount).toLocaleString("vi-VN")} đ</td>
                  <td className="px-3 py-2 text-slate-700">
                    {item.payment_method} ({item.payment_gateway ?? "DIRECT"})
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {item.paid_at ? new Date(item.paid_at).toLocaleString("vi-VN") : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => void downloadInvoice(item)}
                      className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      Tải PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
