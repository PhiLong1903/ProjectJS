import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
const sectionShortcuts = [
    { hash: "#khoa-khambenh", label: "Khám bệnh" },
    { hash: "#khoa-capcuu", label: "Cấp cứu" },
    { hash: "#khoa-hoisuctichcuc", label: "HSTC - Chống độc" },
    { hash: "#khoa-noitonghop", label: "Nội tổng hợp" },
    { hash: "#khoa-noitimmach", label: "Nội tim mạch" },
    { hash: "#khoa-noitieuhoa", label: "Nội tiêu hóa" },
    { hash: "#khoa-noithan", label: "Nội thận" },
    { hash: "#khoa-noitiet", label: "Nội tiết" },
    { hash: "#khoa-phuchoi", label: "PHCN" },
    { hash: "#khoa-nhi", label: "Khoa Nhi" },
    { hash: "#khoa-yhct", label: "YHCT" },
    { hash: "#lien-he", label: "Liên hệ" },
];
const LANDING_PATH = "/noi-khoa-landing.html";
export const InternalMedicineLandingPage = () => {
    const iframeRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeHash, setActiveHash] = useState("#");
    const [iframeHeight, setIframeHeight] = useState(1400);
    const [viewMode, setViewMode] = useState("fit");
    const [reloadSeed, setReloadSeed] = useState(0);
    const embeddedSrc = useMemo(() => `${LANDING_PATH}?embed=1&v=${reloadSeed}`, [reloadSeed]);
    const jumpToSection = (hash) => {
        setActiveHash(hash);
        const frameWindow = iframeRef.current?.contentWindow;
        if (frameWindow) {
            frameWindow.location.hash = hash;
            frameWindow.focus();
        }
    };
    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== window.location.origin) {
                return;
            }
            const data = event.data;
            if (!data || data.type !== "NOI_KHOA_LANDING_METRICS") {
                return;
            }
            const safeHeight = Math.min(Math.max(Number(data.height) || 0, 900), 16000);
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
        if (!isLoaded || activeHash === "#") {
            return;
        }
        const frameWindow = iframeRef.current?.contentWindow;
        if (frameWindow) {
            frameWindow.location.hash = activeHash;
        }
    }, [activeHash, isLoaded]);
    const iframeStyle = viewMode === "fit"
        ? { height: `${iframeHeight}px` }
        : { height: "85vh" };
    return (_jsxs("section", { className: "mx-auto max-w-7xl space-y-6 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "N\u1ED9i Khoa", title: "Trang gi\u1EDBi thi\u1EC7u kh\u1ED1i N\u1ED9i khoa", description: "N\u00E2ng UX b\u1EB1ng \u0111i\u1EC1u h\u01B0\u1EDBng nhanh, tr\u1EA1ng th\u00E1i t\u1EA3i r\u00F5 r\u00E0ng v\u00E0 ch\u1EBF \u0111\u1ED9 xem linh ho\u1EA1t khi k\u1EBFt h\u1EE3p v\u1EDBi landing g\u1ED1c." }), _jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("p", { className: "text-sm text-slate-600", children: ["\u0110i\u1EC1u h\u01B0\u1EDBng nhanh theo khoa. M\u1EE5c \u0111ang xem: ", _jsx("strong", { className: "text-brand-700", children: activeHash })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                            setIsLoaded(false);
                                            setReloadSeed((prev) => prev + 1);
                                        }, className: "rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "T\u1EA3i l\u1EA1i n\u1ED9i dung" }), _jsx("button", { type: "button", onClick: () => setViewMode((prev) => (prev === "fit" ? "compact" : "fit")), className: "rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: viewMode === "fit" ? "Chế độ gọn" : "Chế độ đầy đủ" }), _jsx("a", { href: LANDING_PATH, target: "_blank", rel: "noreferrer", className: "rounded-xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-900", children: "M\u1EDF trang ri\u00EAng" })] })] }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: sectionShortcuts.map((item) => {
                            const isActive = activeHash === item.hash;
                            return (_jsx("button", { type: "button", onClick: () => jumpToSection(item.hash), className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${isActive
                                    ? "bg-brand-700 text-white"
                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`, children: item.label }, item.hash));
                        }) })] }), _jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm", children: [!isLoaded ? (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-white/90", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-700" }), _jsx("p", { className: "mt-3 text-sm font-medium text-slate-700", children: "\u0110ang t\u1EA3i landing page N\u1ED9i khoa..." })] }) })) : null, _jsx("iframe", { ref: iframeRef, src: embeddedSrc, title: "Landing page N\u1ED9i khoa", className: "w-full", style: iframeStyle, onLoad: () => setIsLoaded(true) })] })] }));
};
