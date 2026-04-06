import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
const scheduleCards = [
    {
        title: "Lịch khám theo thường ngày",
        image: "/lichkham1.png",
        description: "Áp dụng cho khung giờ khám thông thường theo lịch vận hành hằng ngày của bệnh viện.",
    },
    {
        title: "Lịch khám theo yêu cầu",
        image: "/lichkham2.png",
        description: "Phù hợp khi người bệnh muốn chọn bác sĩ, khung giờ linh hoạt hoặc dịch vụ khám ưu tiên.",
    },
    {
        title: "Lịch khám VIP",
        image: "/lichkham3.png",
        description: "Gói khám cao cấp với thời gian chờ ngắn, tư vấn chuyên sâu và hỗ trợ dịch vụ đồng bộ.",
    },
];
export const MedicalSchedulePage = () => {
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    useEffect(() => {
        if (!selectedSchedule) {
            return;
        }
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setSelectedSchedule(null);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedSchedule]);
    return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "mx-auto max-w-7xl space-y-8 px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "L\u1ECBch Kh\u00E1m B\u1EC7nh", title: "C\u00E1c l\u1ECBch kh\u00E1m ch\u00EDnh", description: "Trang n\u00E0y t\u1ED5ng h\u1EE3p 3 nh\u00F3m l\u1ECBch kh\u00E1m: th\u01B0\u1EDDng ng\u00E0y, theo y\u00EAu c\u1EA7u v\u00E0 VIP." }), _jsx("div", { className: "grid gap-5 lg:grid-cols-3", children: scheduleCards.map((item) => (_jsxs("article", { className: "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm", children: [_jsxs("button", { type: "button", onClick: () => setSelectedSchedule(item), className: "group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100", children: [_jsx("img", { src: item.image, alt: item.title, className: "h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]", loading: "lazy" }), _jsx("span", { className: "absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white", children: "Nh\u1EA5n \u0111\u1EC3 ph\u00F3ng to" })] }), _jsxs("div", { className: "space-y-2 p-5", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: item.title }), _jsx("p", { className: "text-sm text-slate-600", children: item.description })] })] }, item.title))) })] }), selectedSchedule ? (_jsx("div", { className: "fixed inset-0 z-[80] bg-black/80 p-4", onClick: () => setSelectedSchedule(null), role: "dialog", "aria-modal": "true", "aria-label": `Xem ảnh lớn ${selectedSchedule.title}`, children: _jsxs("div", { className: "relative mx-auto mt-8 flex max-w-6xl flex-col items-center", onClick: (event) => event.stopPropagation(), children: [_jsx("button", { type: "button", onClick: () => setSelectedSchedule(null), className: "mb-3 self-end rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100", children: "\u0110\u00F3ng" }), _jsx("img", { src: selectedSchedule.image, alt: selectedSchedule.title, className: "max-h-[80vh] w-auto max-w-full rounded-2xl border border-white/20 bg-white object-contain shadow-2xl" }), _jsx("p", { className: "mt-3 rounded-xl bg-black/50 px-3 py-2 text-sm font-semibold text-white", children: selectedSchedule.title })] }) })) : null] }));
};
