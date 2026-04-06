import { useEffect, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { publicApi } from "../lib/api";

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

export const NewsPage = () => {
  const [rssNews, setRssNews] = useState([]);
  const [rssLoading, setRssLoading] = useState(true);
  const [rssError, setRssError] = useState(null);

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
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionTitle
        eyebrow="Tin tức y học"
        title="Bản tin y học cập nhật"
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
                <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-brand-700 hover:underline">
                  Đọc bài gốc
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};
