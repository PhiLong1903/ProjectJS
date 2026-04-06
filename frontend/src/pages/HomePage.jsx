import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { publicApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const highlights = [
  {
    title: "Đặt lịch khám 24/7",
    description: "Chọn khoa, chọn bác sĩ và khung giờ phù hợp chỉ trong vài bước.",
  },
  {
    title: "Tra cứu cận lâm sàng",
    description: "Bảo mật thông tin qua mã bệnh nhân và số điện thoại đã đăng ký.",
  },
  {
    title: "CMS quản trị tập trung",
    description: "Quản lý chuyên khoa, lịch khám, tin tức và dữ liệu vận hành toàn viện.",
  },
];

const RSS_SOURCE_OPTIONS = [
  { value: "vnexpress", label: "VnExpress - Sức khỏe" },
  { value: "tuoitre", label: "Tuổi Trẻ - Sức khỏe" },
  { value: "thanhnien", label: "Thanh Niên - Sức khỏe" },
  { value: "dantri", label: "Dân Trí - Sức khỏe" },
  { value: "suckhoedoisong", label: "Sức khỏe & Đời sống" },
];

const stripHtml = (value) =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (value, maxLength) => (value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}...`);

const formatPubDate = (value) => {
  if (!value) return "Không rõ thời gian";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
};

const toTimestamp = (value) => {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const buildNewsFallbackImage = (label = "Tin tuc y hoc") => {
  const safeLabel = String(label || "Tin tuc y hoc").slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f766e"/>
          <stop offset="100%" stop-color="#0c4a6e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#bg)"/>
      <circle cx="710" cy="85" r="120" fill="#ffffff22"/>
      <circle cx="120" cy="380" r="140" fill="#ffffff1a"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="42" fill="#ffffff" font-family="Arial, sans-serif" font-weight="700">TIN TUC Y HOC</text>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-size="26" fill="#e2e8f0" font-family="Arial, sans-serif">${safeLabel}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const resolveNewsImage = (item) =>
  item.imageUrl || item.image_url || buildNewsFallbackImage(item.sourceLabel || "Tin tuc y hoc");

const handleNewsImageError = (event, sourceLabel) => {
  const fallback = buildNewsFallbackImage(sourceLabel || "Tin tuc y hoc");
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
};

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [rssNews, setRssNews] = useState([]);
  const [rssLoading, setRssLoading] = useState(true);
  const [rssError, setRssError] = useState(null);

  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const isDoctor = user?.roles.includes("DOCTOR") ?? false;

  const quickFeatures = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { title: "Đăng ký tài khoản", to: "/dang-ky", action: "Đăng ký" },
        { title: "Đăng nhập bệnh nhân", to: "/dang-nhap", action: "Đăng nhập" },
        { title: "Đăng nhập bác sĩ", to: "/bac-si/dang-nhap", action: "Đăng nhập bác sĩ" },
        { title: "Đặt lịch khám", to: "/dat-lich-kham", action: "Đến trang đặt lịch" },
        { title: "Tra cứu cận lâm sàng", to: "/tra-cuu-can-lam-sang", action: "Đến trang tra cứu" },
      ];
    }

    if (isAdmin) {
      return [
        { title: "Bảng quản trị CMS", to: "/admin", action: "Vào CMS" },
        { title: "Tin tức y học", to: "/tin-tuc", action: "Xem tin tức" },
        { title: "Tra cứu cận lâm sàng", to: "/tra-cuu-can-lam-sang", action: "Đến trang tra cứu" },
        { title: "Liên hệ hỗ trợ", to: "/lien-he", action: "Liên hệ" },
      ];
    }

    if (isDoctor) {
      return [
        { title: "Khu vực bác sĩ", to: "/bac-si", action: "Vào cổng bác sĩ" },
        { title: "Tin tức y học", to: "/tin-tuc", action: "Xem tin tức" },
        { title: "Tra cứu cận lâm sàng", to: "/tra-cuu-can-lam-sang", action: "Đến trang tra cứu" },
        { title: "Liên hệ bệnh viện", to: "/lien-he", action: "Liên hệ" },
      ];
    }

    return [
      { title: "Cổng bệnh nhân", to: "/benh-nhan", action: "Mở cổng bệnh nhân" },
      { title: "Đặt lịch khám", to: "/dat-lich-kham", action: "Đến trang đặt lịch" },
      { title: "Tra cứu cận lâm sàng", to: "/tra-cuu-can-lam-sang", action: "Đến trang tra cứu" },
      { title: "Tin tức y học", to: "/tin-tuc", action: "Xem tin tức" },
      { title: "Liên hệ bệnh viện", to: "/lien-he", action: "Liên hệ" },
    ];
  }, [isAdmin, isAuthenticated, isDoctor]);

  useEffect(() => {
    const loadRssNews = async () => {
      try {
        setRssLoading(true);

        const settled = await Promise.allSettled(
          RSS_SOURCE_OPTIONS.map(async (source) => {
            const response = await publicApi.rssNews(4, source.value);
            return response.data.data.map((item) => ({
              ...item,
              source: source.value,
              sourceLabel: source.label,
            }));
          })
        );

        const mergedItems = [];
        let hasFailedSource = false;

        settled.forEach((result) => {
          if (result.status === "fulfilled") {
            mergedItems.push(...result.value);
          } else {
            hasFailedSource = true;
          }
        });

        mergedItems.sort((a, b) => toTimestamp(b.pubDate) - toTimestamp(a.pubDate));
        setRssNews(mergedItems);

        if (mergedItems.length === 0) {
          setRssError("Không thể tải dữ liệu RSS từ các nguồn hiện tại. Hãy kiểm tra backend đang chạy tại cổng 8080.");
        } else if (hasFailedSource) {
          setRssError("Một số nguồn RSS tạm thời không truy cập được. Đang hiển thị dữ liệu còn lại.");
        } else {
          setRssError(null);
        }
      } catch {
        setRssNews([]);
        setRssError("Không thể tải RSS feed ở thời điểm hiện tại.");
      } finally {
        setRssLoading(false);
      }
    };

    void loadRssNews();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-accent-700 text-white">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-100/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider">
              Cổng thông tin bệnh viện đa khoa
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Nền tảng E-Health Booking cho hành trình khám chữa bệnh hiện đại
            </h1>
            <p className="mt-4 text-base text-white/90 md:text-lg">
              Website tích hợp đặt lịch khám trực tuyến, tra cứu kết quả cận lâm sàng và cập nhật tin tức y tế giúp
              người bệnh chủ động chăm sóc sức khỏe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dat-lich-kham" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-900">
                Bắt đầu đặt lịch
              </Link>
              <Link
                to="/tra-cuu-can-lam-sang"
                className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white"
              >
                Tra cứu cận lâm sàng
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/20 bg-white/10 p-6">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/90">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle
          eyebrow="Chức năng nhanh"
          title="Truy cập nhanh các chức năng theo vai trò tài khoản"
          description="Nội dung sẽ thay đổi theo trạng thái đăng nhập và phân quyền Admin, Bác sĩ, Bệnh nhân."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickFeatures.map((item) => (
            <article key={item.to} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
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

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle
          eyebrow="Tin tức y học"
          title="Tin tức y học trong ngày!"
          description="Hiển thị cùng lúc các bản tin sức khỏe từ VnExpress, Tuổi Trẻ, Thanh Niên, Dân Trí và Sức khỏe & Đời sống."
        />
        <p className="mb-4 text-xs text-slate-500">Tin tức trong ngày.</p>

        {rssLoading ? <p className="text-sm text-slate-600">Đang tải danh sách tin tức...</p> : null}
        {rssError ? <p className="text-sm text-red-600">{rssError}</p> : null}

        {!rssLoading && rssNews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rssNews.map((item, index) => (
              <article key={`${item.link}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <img
                  src={resolveNewsImage(item)}
                  alt={item.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                  onError={(event) => handleNewsImageError(event, item.sourceLabel)}
                />
                <div className="space-y-2 p-4">
                  <span className="inline-flex rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">
                    {item.sourceLabel}
                  </span>
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">{formatPubDate(item.pubDate)}</p>
                  <p className="line-clamp-4 text-sm text-slate-600">{truncate(stripHtml(item.description), 180)}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Đọc bài gốc
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};
