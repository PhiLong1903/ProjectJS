import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
const sectionShortcuts = [
    { hash: "#khoa-ngoaitongquat", label: "Ngoại tổng quát" },
    { hash: "#khoa-ctch", label: "CTCH" },
    { hash: "#khoa-ngoainieu", label: "Ngoại tiết niệu" },
    { hash: "#khoa-ngoaithankinh", label: "Ngoại thần kinh" },
    { hash: "#khoa-ngoaillongnguc", label: "Lồng ngực - Mạch máu" },
    { hash: "#khoa-gayme", label: "PT - GMHS" },
    { hash: "#lien-he", label: "Liên hệ" },
];
const LANDING_PATH = "/ngoai-khoa-landing.html";
export const SurgeryLandingPage = () => {
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
            if (!data || data.type !== "NGOAI_KHOA_LANDING_METRICS") {
                return;
            }
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
    return (_jsxs("section", { className: "mx-auto max-w-7xl space-y-6 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "Ngo\u1EA1i Khoa", title: "Trang gi\u1EDBi thi\u1EC7u kh\u1ED1i Ngo\u1EA1i khoa", description: "N\u1ED9i dung \u0111\u01B0\u1EE3c d\u1EF1ng t\u1EEB landing page khoa Ngo\u1EA1i b\u1EA1n cung c\u1EA5p, t\u00EDch h\u1EE3p \u0111i\u1EC1u h\u01B0\u1EDBng nhanh v\u00E0 ch\u1EBF \u0111\u1ED9 xem ph\u00F9 h\u1EE3p khi nh\u00FAng v\u00E0o h\u1EC7 th\u1ED1ng." }), _jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("p", { className: "text-sm text-slate-600", children: ["\u0110i\u1EC1u h\u01B0\u1EDBng nhanh theo khoa. M\u1EE5c \u0111ang xem: ", _jsx("strong", { className: "text-brand-700", children: activeHash })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                            setIsLoaded(false);
                                            setReloadSeed((prev) => prev + 1);
                                        }, className: "rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "T\u1EA3i l\u1EA1i n\u1ED9i dung" }), _jsx("button", { type: "button", onClick: () => setViewMode((prev) => (prev === "fit" ? "compact" : "fit")), className: "rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: viewMode === "fit" ? "Chế độ gọn" : "Chế độ đầy đủ" }), _jsx("a", { href: LANDING_PATH, target: "_blank", rel: "noreferrer", className: "rounded-xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-900", children: "M\u1EDF trang ri\u00EAng" })] })] }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: sectionShortcuts.map((item) => {
                            const isActive = activeHash === item.hash;
                            return (_jsx("button", { type: "button", onClick: () => jumpToSection(item.hash), className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${isActive
                                    ? "bg-brand-700 text-white"
                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`, children: item.label }, item.hash));
                        }) })] }), _jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm", children: [!isLoaded ? (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-white/90", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-700" }), _jsx("p", { className: "mt-3 text-sm font-medium text-slate-700", children: "\u0110ang t\u1EA3i landing page Ngo\u1EA1i khoa..." })] }) })) : null, _jsx("iframe", { ref: iframeRef, src: embeddedSrc, title: "Landing page Ngo\u1EA1i khoa", className: "w-full", style: iframeStyle, onLoad: () => setIsLoaded(true) })] }), _jsx("p", { className: "text-xs text-slate-500", children: "M\u1EB9o UX: d\u00F9ng ch\u1EBF \u0111\u1ED9 \u0111\u1EA7y \u0111\u1EE7 khi c\u1EA7n \u0111\u1ECDc to\u00E0n b\u1ED9 n\u1ED9i dung chuy\u00EAn m\u00F4n, d\u00F9ng ch\u1EBF \u0111\u1ED9 g\u1ECDn khi c\u1EA7n chuy\u1EC3n nhanh gi\u1EEFa c\u00E1c trang ch\u1EE9c n\u0103ng kh\u00E1c." })] }));
};
