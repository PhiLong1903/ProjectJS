import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SectionTitle } from "../components/sections/SectionTitle";
import { publicApi } from "../lib/api";
export const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    useEffect(() => {
        const loadData = async () => {
            const [departmentResponse, doctorResponse] = await Promise.all([
                publicApi.departments(),
                publicApi.doctors(),
            ]);
            setDepartments(departmentResponse.data.data);
            setDoctors(doctorResponse.data.data);
        };
        void loadData();
    }, []);
    return (_jsxs("section", { className: "mx-auto max-w-7xl px-4 py-14", children: [_jsx(SectionTitle, { eyebrow: "Departments", title: "Danh m\u1EE5c chuy\u00EAn khoa", description: "Th\u00F4ng tin khoa l\u00E2m s\u00E0ng v\u00E0 \u0111\u1ED9i ng\u0169 b\u00E1c s\u0129 ph\u1EE5 tr\u00E1ch t\u1EA1i b\u1EC7nh vi\u1EC7n." }), _jsx("div", { className: "grid gap-4 lg:grid-cols-2", children: departments.map((department) => {
                    const relatedDoctors = doctors.filter((doctor) => doctor.department_id === department.id);
                    return (_jsxs("article", { className: "rounded-3xl border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-xl font-bold text-slate-900", children: department.name }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: department.description }), _jsxs("p", { className: "mt-3 text-sm text-slate-500", children: ["V\u1ECB tr\u00ED: ", department.location ?? "Đang cập nhật"] }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Li\u00EAn h\u1EC7: ", department.phone ?? "Đang cập nhật"] }), _jsx("div", { className: "mt-4 space-y-2", children: relatedDoctors.length > 0 ? (relatedDoctors.map((doctor) => (_jsxs("div", { className: "rounded-2xl bg-slate-50 px-4 py-3", children: [_jsx("p", { className: "font-semibold text-slate-900", children: doctor.full_name }), _jsx("p", { className: "text-sm text-slate-600", children: doctor.specialty ?? "Đa khoa" })] }, doctor.id)))) : (_jsx("p", { className: "text-sm text-slate-500", children: "Ch\u01B0a c\u00F3 b\u00E1c s\u0129 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt." })) })] }, department.id));
                }) })] }));
};
