import { Link } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";

const guideItems = [
  {
    title: "Đăng ký tài khoản bệnh nhân",
    description: "Tạo hồ sơ để sử dụng dịch vụ đặt lịch khám trực tuyến.",
    to: "/dang-ky",
    action: "Đến trang đăng ký",
  },
  {
    title: "Đăng nhập",
    description: "Đăng nhập để truy cập chức năng đặt lịch và xem lịch hẹn của bạn.",
    to: "/dang-nhap",
    action: "Đến trang đăng nhập",
  },
  {
    title: "Đặt lịch khám trực tuyến",
    description: "Chọn khoa, bác sĩ và khung giờ phù hợp. Yêu cầu đăng nhập.",
    to: "/dat-lich-kham",
    action: "Đến trang đặt lịch",
  },
  {
    title: "Tra cứu kết quả cận lâm sàng",
    description: "Tra cứu nhanh bằng mã bệnh nhân và số điện thoại.",
    to: "/tra-cuu-can-lam-sang",
    action: "Đến trang tra cứu",
  },
];

export const PatientGuidePage = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionTitle
        eyebrow="Cẩm nang người bệnh"
        title="Hướng dẫn người bệnh"
        description="Các chức năng đã được tách thành các trang riêng để sử dụng thuận tiện hơn."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {guideItems.map((item) => (
          <article key={item.to} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <Link
              to={item.to}
              className="mt-4 inline-flex rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
            >
              {item.action}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};
