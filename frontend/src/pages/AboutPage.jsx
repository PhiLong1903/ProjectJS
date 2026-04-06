import { useMemo } from "react";

const quickLinks = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "lich-su", label: "Lịch sử" },
  { id: "thanh-tich", label: "Thành tích" },
  { id: "tam-nhin-su-menh", label: "Tầm nhìn & sứ mệnh" },
  { id: "so-do-to-chuc", label: "Sơ đồ tổ chức" },
  { id: "gia-tri-cot-loi", label: "Giá trị cốt lõi" },
];

const achievements = [
  "Huân chương Lao động hạng II.",
  "Cờ đơn vị xuất sắc của Ủy ban nhân dân thành phố.",
  "Bằng khen của Ủy ban nhân dân thành phố và Bộ Y tế.",
];

const coreValues = [
  {
    title: "Tận tâm",
    description:
      "Luôn đặt người bệnh làm trung tâm, bảo đảm dịch vụ chăm sóc sức khỏe an toàn, chuẩn mực và chất lượng cao.",
  },
  {
    title: "Trách nhiệm",
    description:
      "Mỗi nhân sự chịu trách nhiệm với chuyên môn của mình, tuân thủ đạo đức nghề nghiệp và cam kết vì cộng đồng.",
  },
  {
    title: "Chia sẻ",
    description:
      "Lắng nghe, thấu hiểu và đồng hành cùng người bệnh, thân nhân và đồng nghiệp để tạo nên trải nghiệm điều trị tích cực.",
  },
];

const sectionClass = "scroll-mt-40 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8";

export const AboutPage = () => {
  const quickLinkText = useMemo(() => quickLinks.map((item) => item.label).join(" • "), []);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-brand-900/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center text-white md:py-24">
          <p className="inline-flex rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider">Giới thiệu</p>
          <h1 className="mt-4 text-3xl font-black uppercase md:text-5xl">Bệnh viện Đa khoa Khu vực</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-white/90 md:text-base">
            Trang giới thiệu tổng quan về lịch sử hình thành, năng lực chuyên môn và định hướng phát triển của bệnh viện
            trong mô hình y tế số.
          </p>
        </div>
      </section>

      <section className="sticky top-[72px] z-30 border-y border-brand-900/10 bg-brand-800 text-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs font-semibold uppercase tracking-wide">{quickLinkText}</div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:py-14">
        <article id="tong-quan" className={sectionClass}>
          <h2 className="text-center text-3xl font-black text-brand-900">Tổng quan</h2>
          <div className="mx-auto mt-6 max-w-5xl space-y-4 text-justify text-slate-700">
            <p>
              Bệnh viện Đa khoa Khu vực (mô phỏng đồ án) là bệnh viện hạng II, nằm tại cửa ngõ Đông Bắc thành phố.
              Trung bình mỗi ngày, bệnh viện tiếp nhận hơn 2.000 lượt khám ngoại trú và điều trị nội trú trên 700
              giường bệnh.
            </p>
            <p>
              Cơ sở vật chất gồm hệ thống chẩn đoán hiện đại như MRI, CT-Scanner, X-quang kỹ thuật số, siêu âm Doppler,
              nội soi tiêu hóa và xét nghiệm sinh hóa - huyết học.
            </p>
          </div>
        </article>

        <article id="lich-su" className={sectionClass}>
          <h2 className="text-center text-3xl font-black text-brand-900">Lịch sử hình thành</h2>
          <div className="mx-auto mt-6 max-w-5xl space-y-4 text-justify text-slate-700">
            <p>
              Bệnh viện được hình thành từ năm 1978, phát triển liên tục qua nhiều giai đoạn và từng bước mở rộng năng
              lực khám chữa bệnh.
            </p>
            <p>
              Từ năm 1999 đến nay, bệnh viện đầu tư mạnh vào cơ sở hạ tầng, nâng cấp các chuyên khoa và chuẩn hóa quy
              trình điều trị theo hướng hiện đại.
            </p>
          </div>
        </article>

        <article id="thanh-tich" className={sectionClass}>
          <h2 className="text-center text-3xl font-black text-brand-900">Thành tích đơn vị</h2>
          <div className="mx-auto mt-6 grid max-w-4xl gap-3">
            {achievements.map((item) => (
              <div key={item} className="rounded-xl border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm font-medium text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article id="tam-nhin-su-menh" className={sectionClass}>
          <h2 className="text-center text-3xl font-black text-brand-900">Tầm nhìn và sứ mệnh</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border-t-4 border-brand-700 bg-slate-50 p-5">
              <h3 className="text-center text-xl font-bold text-brand-900">Tầm nhìn</h3>
              <p className="mt-3 text-justify text-slate-700">
                Trở thành bệnh viện đa khoa uy tín trong khu vực, cung cấp dịch vụ y tế đa chuyên khoa với chất lượng cao
                và trải nghiệm thuận tiện cho người bệnh.
              </p>
            </article>
            <article className="rounded-2xl border-t-4 border-brand-700 bg-slate-50 p-5">
              <h3 className="text-center text-xl font-bold text-brand-900">Sứ mệnh</h3>
              <p className="mt-3 text-justify text-slate-700">
                Nâng cao năng lực khám chữa bệnh, phát triển đào tạo - nghiên cứu và luôn lấy sự an toàn, hài lòng của
                người bệnh làm chuẩn vận hành.
              </p>
            </article>
          </div>
        </article>

        <article id="so-do-to-chuc" className={sectionClass}>
          <h2 className="text-center text-3xl font-black text-brand-900">Sơ đồ tổ chức</h2>
          <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img src="/sodotochuc.png" alt="Sơ đồ tổ chức bệnh viện" className="h-auto w-full object-contain" loading="lazy" />
          </div>
        </article>

        <article id="gia-tri-cot-loi" className={sectionClass}>
          <h2 className="text-center text-3xl font-black text-brand-900">Giá trị cốt lõi</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {coreValues.map((item) => (
              <article key={item.title} className="rounded-2xl border-t-4 border-amber-400 bg-amber-50/60 p-5 text-center">
                <h3 className="text-xl font-bold text-brand-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-700">{item.description}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
