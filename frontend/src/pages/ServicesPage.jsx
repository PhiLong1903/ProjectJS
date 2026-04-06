import { useEffect, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { publicApi } from "../lib/api";

const pricingRows = [
  { service: "Khám tổng quát", fee: "200.000 VND", note: "Giá demo cho đồ án" },
  { service: "Khám chuyên khoa", fee: "350.000 VND", note: "Chưa bao gồm cận lâm sàng" },
  { service: "Siêu âm cơ bản", fee: "250.000 VND", note: "Giá demo" },
  { service: "Xét nghiệm tổng quát", fee: "450.000 VND", note: "Theo gói cơ bản" },
  { service: "Tái khám sau điều trị", fee: "150.000 VND", note: "Áp dụng trong 30 ngày" },
];

export const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const response = await publicApi.services();
      setServices(response.data.data);
    };

    void loadData();
  }, []);

  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-14">
      <SectionTitle
        eyebrow="Services"
        title="Dịch vụ khám chữa bệnh"
        description="Danh mục dịch vụ y tế tiêu biểu tại bệnh viện."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article key={service.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{service.service_code}</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">{service.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{service.short_description ?? service.description}</p>
            <p className="mt-4 text-sm font-semibold text-accent-700">
              Chi phí từ: {service.price_from ? Number(service.price_from).toLocaleString("vi-VN") : "Liên hệ"} VND
            </p>
          </article>
        ))}
      </div>

      <article id="bang-gia-vien-phi" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">Bảng giá viện phí (demo)</h3>
        <p className="mt-2 text-sm text-slate-600">Bảng giá dưới đây chỉ dùng cho demo đồ án, không phải giá áp dụng thực tế.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700">Dịch vụ</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Mức phí</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((row) => (
                <tr key={row.service} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{row.service}</td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{row.fee}</td>
                  <td className="px-4 py-3 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};
