import { useEffect, useMemo, useRef, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";

const sectionShortcuts = [
  { hash: "#khoa-cdha", label: "Chẩn đoán hình ảnh" },
  { hash: "#khoa-xetnghiem", label: "Xét nghiệm" },
  { hash: "#khoa-noisoi", label: "Nội soi" },
  { hash: "#khoa-thamdochucnang", label: "Thăm dò chức năng" },
  { hash: "#khoa-giaiphaubenh", label: "Giải phẫu bệnh" },
  { hash: "#tra-cuu", label: "Tra cứu kết quả" },
];

const LANDING_PATH = "/can-lam-sang-landing.html";

export const ParaclinicalLandingPage = () => {
  const iframeRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHash, setActiveHash] = useState("#");
  const [iframeHeight, setIframeHeight] = useState(1600);
  const [viewMode, setViewMode] = useState("fit");
  const [reloadSeed, setReloadSeed] = useState(0);

  const embeddedSrc = useMemo(() => `${LANDING_PATH}?embed=1&v=${reloadSeed}`, [reloadSeed]);

  const jumpToSection = (hash) => {
    setActiveHash(hash);
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.location.hash = hash;
    frameWindow.focus();
  };

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data || data.type !== "CAN_LAM_SANG_LANDING_METRICS") return;

      const safeHeight = Math.min(Math.max(Number(data.height) || 0, 1000), 24000);
      if (safeHeight > 0) {
        setIframeHeight(safeHeight);
      }

      if (data.hash) {
        setActiveHash(data.hash);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!isLoaded || activeHash === "#") return;
    const frameWindow = iframeRef.current?.contentWindow;
    if (frameWindow) {
      frameWindow.location.hash = activeHash;
    }
  }, [activeHash, isLoaded]);

  const iframeStyle = viewMode === "fit" ? { height: `${iframeHeight}px` } : { height: "85vh" };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-14">
      <SectionTitle eyebrow="Cận Lâm Sàng" title="Trang giới thiệu khối Cận lâm sàng" />

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Điều hướng nhanh theo khoa. Mục đang xem: <strong className="text-brand-700">{activeHash}</strong>
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLoaded(false);
                setReloadSeed((prev) => prev + 1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Tải lại nội dung
            </button>

            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === "fit" ? "compact" : "fit"))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {viewMode === "fit" ? "Chế độ gọn" : "Chế độ đầy đủ"}
            </button>

            <a
              href={LANDING_PATH}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-900"
            >
              Mở trang riêng
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {sectionShortcuts.map((item) => {
            const isActive = activeHash === item.hash;
            return (
              <button
                key={item.hash}
                type="button"
                onClick={() => jumpToSection(item.hash)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-brand-700 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </article>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {!isLoaded ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-700" />
              <p className="mt-3 text-sm font-medium text-slate-700">Đang tải landing page Cận lâm sàng...</p>
            </div>
          </div>
        ) : null}

        <iframe
          ref={iframeRef}
          src={embeddedSrc}
          title="Landing page Cận lâm sàng"
          className="w-full"
          style={iframeStyle}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      <p className="text-xs text-slate-500">
        Mẹo UX: dùng chế độ đầy đủ để đọc toàn bộ nội dung chuyên môn, dùng chế độ gọn khi cần chuyển nhanh giữa các
        tính năng đặt lịch và tra cứu.
      </p>
    </section>
  );
};

