import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Footer } from "./Footer";
import { Header } from "./Header";
export const MainLayout = ({ children }) => (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-100", children: [_jsx(Header, {}), _jsx("main", { children: children }), _jsx(Footer, {})] }));
