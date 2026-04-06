import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { SectionTitle } from "../components/sections/SectionTitle";
import { adminApi, adminPortalApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";
const USERS_PAGE_SIZE = 10;
const downloadBlobFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};
const TrendBarChart = ({ title, points, field, colorClass, formatter }) => {
  const values = points.map((item) => Number(item[field]));
  const maxValue = Math.max(1, ...values);
  return _jsxs("article", {
    className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
    children: [
      _jsx("h4", {
        className: "text-sm font-bold text-slate-900",
        children: title,
      }),
      _jsx("div", {
        className: "mt-3 flex h-32 items-end gap-1",
        children: points.map((point) => {
          const value = Number(point[field]);
          const heightPercent = Math.max(
            4,
            Math.round((value / maxValue) * 100),
          );
          return _jsxs(
            "div",
            {
              className: "flex flex-1 flex-col items-center justify-end",
              children: [
                _jsx("div", {
                  className: `w-full rounded-t ${colorClass}`,
                  style: { height: `${heightPercent}%` },
                  title: `${point.period}: ${formatter ? formatter(value) : value}`,
                }),
                _jsx("p", {
                  className: "mt-1 truncate text-[10px] text-slate-500",
                  title: point.period,
                  children: point.period.slice(5),
                }),
              ],
            },
            `${field}-${point.period}`,
          );
        }),
      }),
    ],
  });
};
export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [revenueReport, setRevenueReport] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersMeta, setUsersMeta] = useState({
    page: 1,
    pageSize: USERS_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [trendGroupBy, setTrendGroupBy] = useState("day");
  const [trends, setTrends] = useState([]);
  const [notificationJobs, setNotificationJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [cmsPages, setCmsPages] = useState([]);
  const [deptForm, setDeptForm] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    phone: "",
  });
  const [slotForm, setSlotForm] = useState({
    doctorId: "",
    slotDate: "",
    startTime: "08:00",
    endTime: "08:30",
  });
  const [createUserForm, setCreateUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "PATIENT",
    phoneNumber: "",
    doctorCode: "",
    departmentId: "",
  });
  const [message, setMessage] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedLabResult, setSelectedLabResult] = useState(null);
  const [selectedContactMessage, setSelectedContactMessage] = useState(null);
  const isAdmin = useMemo(() => user?.roles.includes("ADMIN") ?? false, [user]);
  const loadAdminData = async (groupBy = trendGroupBy) => {
    const [
      overviewResponse,
      revenueResponse,
      trendResponse,
      jobsResponse,
      departmentsResponse,
      doctorsResponse,
      bookingsResponse,
      labResponse,
      contactResponse,
      cmsResponse,
    ] = await Promise.all([
      adminPortalApi.overview(),
      adminPortalApi.revenueReport("day"),
      adminPortalApi.trends(groupBy, groupBy === "day" ? 14 : 12),
      adminPortalApi.notificationJobs(),
      adminApi.departments(),
      adminApi.doctors(),
      adminApi.bookings(),
      adminApi.labResults(),
      adminApi.contactMessages(),
      adminApi.cmsPages(),
    ]);
    setOverview(overviewResponse.data.data);
    setRevenueReport(revenueResponse.data.data);
    setTrends(trendResponse.data.data);
    setNotificationJobs(jobsResponse.data.data);
    setDepartments(departmentsResponse.data.data);
    setDoctors(doctorsResponse.data.data);
    setBookings(bookingsResponse.data.data);
    setLabResults(labResponse.data.data);
    setContactMessages(contactResponse.data.data);
    setCmsPages(cmsResponse.data.data);
  };
  const loadUsersData = async (targetPage = usersPage) => {
    const usersResponse = await adminPortalApi.users({
      page: targetPage,
      pageSize: USERS_PAGE_SIZE,
    });
    const meta = usersResponse.data.meta;
    setUsers(usersResponse.data.data);
    setUsersMeta(
      meta ?? {
        page: targetPage,
        pageSize: USERS_PAGE_SIZE,
        totalItems: usersResponse.data.data.length,
        totalPages: 1,
      },
    );
  };
  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (isAdmin) {
          await loadAdminData(trendGroupBy);
        }
      } catch {
        setMessage(
          "Không thể tải dữ liệu CMS. Vui lòng kiểm tra quyền truy cập.",
        );
      }
    };
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, trendGroupBy]);
  useEffect(() => {
    const bootstrapUsers = async () => {
      try {
        if (isAdmin) {
          await loadUsersData(usersPage);
        }
      } catch {
        setMessage("Không thể tải danh sách người dùng.");
      }
    };
    void bootstrapUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, usersPage]);
  if (!user) {
    return _jsx(Navigate, { to: "/admin/login", replace: true });
  }
  if (!isAdmin) {
    return _jsx("section", {
      className: "mx-auto max-w-3xl px-4 py-14",
      children: _jsx("p", {
        className:
          "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        children: "Tài khoản hiện tại không có quyền quản trị CMS.",
      }),
    });
  }
  const createDepartment = async (event) => {
    event.preventDefault();
    try {
      await adminApi.createDepartment({
        ...deptForm,
        isActive: true,
      });
      setMessage("Tạo khoa mới thành công.");
      setDeptForm({
        name: "",
        slug: "",
        description: "",
        location: "",
        phone: "",
      });
      await loadAdminData();
    } catch {
      setMessage("Tạo khoa thất bại. Kiểm tra lại slug và dữ liệu đầu vào.");
    }
  };
  const createSlot = async (event) => {
    event.preventDefault();
    try {
      await adminApi.createDoctorSlot(slotForm);
      setMessage("Tạo khung giờ khám thành công.");
      setSlotForm({
        doctorId: "",
        slotDate: "",
        startTime: "08:00",
        endTime: "08:30",
      });
      await loadAdminData();
    } catch {
      setMessage(
        "Tạo khung giờ thất bại. Kiểm tra dữ liệu bác sĩ và thời gian.",
      );
    }
  };
  const createUser = async (event) => {
    event.preventDefault();
    try {
      const role = createUserForm.role;
      await adminPortalApi.createUser({
        fullName: createUserForm.fullName,
        email: createUserForm.email,
        password: createUserForm.password,
        roles: [role],
        patientProfile:
          role === "PATIENT"
            ? {
                phoneNumber: createUserForm.phoneNumber,
              }
            : undefined,
        doctorProfile:
          role === "DOCTOR"
            ? {
                doctorCode: createUserForm.doctorCode,
                departmentId: createUserForm.departmentId,
              }
            : undefined,
      });
      setMessage("Tạo người dùng thành công.");
      setCreateUserForm({
        fullName: "",
        email: "",
        password: "",
        role: "PATIENT",
        phoneNumber: "",
        doctorCode: "",
        departmentId: "",
      });
      setUsersPage(1);
      await loadUsersData(1);
      await loadAdminData();
    } catch {
      setMessage("Tạo người dùng thất bại. Kiểm tra thông tin đầu vào.");
    }
  };
  const toggleUserStatus = async (targetUser) => {
    try {
      await adminPortalApi.updateUserStatus(
        targetUser.id,
        !targetUser.is_active,
      );
      await loadUsersData(usersPage);
    } catch {
      setMessage("Không thể cập nhật trạng thái người dùng.");
    }
  };
  const updateRole = async (targetUser, role) => {
    try {
      await adminPortalApi.updateUserRoles(targetUser.id, [role]);
      await loadUsersData(usersPage);
    } catch {
      setMessage("Không thể cập nhật vai trò người dùng.");
    }
  };
  const exportRevenue = async (format) => {
    try {
      const response = await adminPortalApi.exportRevenueReport(format, "day");
      const filename = `bao-cao-doanh-thu-ngay.${format}`;
      downloadBlobFile(response.data, filename);
    } catch {
      setMessage(`Xuất file ${format.toUpperCase()} thất bại.`);
    }
  };
  const processQueue = async () => {
    try {
      const response = await adminPortalApi.processNotificationJobs();
      const { total, sent, failed, retried } = response.data.data;
      setMessage(
        `Queue: xử lý ${total} jobs, gửi thành công ${sent}, lỗi ${failed}, retry ${retried}.`,
      );
      await loadAdminData();
    } catch {
      setMessage("Không thể xử lý notification queue.");
    }
  };
  const closeDetailModal = () => {
    setDetailType(null);
    setDetailLoading(false);
    setDetailError(null);
    setSelectedBooking(null);
    setSelectedLabResult(null);
    setSelectedContactMessage(null);
  };
  const openBookingDetail = async (bookingId) => {
    setDetailType("booking");
    setDetailLoading(true);
    setDetailError(null);
    setSelectedBooking(null);
    try {
      const response = await adminApi.bookingDetail(bookingId);
      setSelectedBooking(response.data.data);
    } catch {
      setDetailError("Không thể tải chi tiết lịch khám.");
    } finally {
      setDetailLoading(false);
    }
  };
  const openLabResultDetail = async (labResultId) => {
    setDetailType("lab");
    setDetailLoading(true);
    setDetailError(null);
    setSelectedLabResult(null);
    try {
      const response = await adminApi.labResultDetail(labResultId);
      setSelectedLabResult(response.data.data);
    } catch {
      setDetailError("Không thể tải chi tiết kết quả cận lâm sàng.");
    } finally {
      setDetailLoading(false);
    }
  };
  const openContactMessageDetail = async (messageId) => {
    setDetailType("contact");
    setDetailLoading(true);
    setDetailError(null);
    setSelectedContactMessage(null);
    try {
      const response = await adminApi.contactMessageDetail(messageId);
      setSelectedContactMessage(response.data.data);
    } catch {
      setDetailError("Không thể tải chi tiết tin nhắn liên hệ.");
    } finally {
      setDetailLoading(false);
    }
  };
  return _jsxs("section", {
    className: "mx-auto max-w-7xl space-y-8 px-4 py-14",
    children: [
      _jsx(SectionTitle, {
        eyebrow: "CMS Dashboard",
        title: "Quản trị luồng dữ liệu bệnh viện",
        description:
          "Dashboard tổng quan, quản lý người dùng, báo cáo doanh thu và vận hành dữ liệu bệnh viện.",
      }),
      message
        ? _jsx("p", {
            className:
              "rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900",
            children: message,
          })
        : null,
      overview
        ? _jsxs("div", {
            className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
            children: [
              _jsxs("article", {
                className:
                  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                children: [
                  _jsx("p", {
                    className: "text-xs text-slate-500",
                    children: "Bệnh nhân mới hôm nay",
                  }),
                  _jsx("p", {
                    className: "mt-1 text-2xl font-black text-slate-900",
                    children: overview.new_patients_today,
                  }),
                ],
              }),
              _jsxs("article", {
                className:
                  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                children: [
                  _jsx("p", {
                    className: "text-xs text-slate-500",
                    children: "Lượt khám hôm nay",
                  }),
                  _jsx("p", {
                    className: "mt-1 text-2xl font-black text-slate-900",
                    children: overview.appointments_today,
                  }),
                ],
              }),
              _jsxs("article", {
                className:
                  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                children: [
                  _jsx("p", {
                    className: "text-xs text-slate-500",
                    children: "Doanh thu hôm nay",
                  }),
                  _jsxs("p", {
                    className: "mt-1 text-2xl font-black text-slate-900",
                    children: [
                      Number(overview.revenue_today).toLocaleString("vi-VN"),
                      " đ",
                    ],
                  }),
                ],
              }),
              _jsxs("article", {
                className:
                  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                children: [
                  _jsx("p", {
                    className: "text-xs text-slate-500",
                    children: "Tổng người dùng",
                  }),
                  _jsx("p", {
                    className: "mt-1 text-2xl font-black text-slate-900",
                    children: overview.total_users,
                  }),
                ],
              }),
            ],
          })
        : null,
      _jsxs("article", {
        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
        children: [
          _jsxs("div", {
            className: "flex flex-wrap items-center justify-between gap-3",
            children: [
              _jsx("h3", {
                className: "text-lg font-bold text-slate-900",
                children: "Biểu đồ vận hành",
              }),
              _jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  _jsx("button", {
                    type: "button",
                    onClick: () => setTrendGroupBy("day"),
                    className: `rounded-lg px-3 py-1 text-xs font-semibold ${trendGroupBy === "day" ? "bg-brand-700 text-white" : "border border-slate-200 text-slate-700"}`,
                    children: "Theo ngày",
                  }),
                  _jsx("button", {
                    type: "button",
                    onClick: () => setTrendGroupBy("month"),
                    className: `rounded-lg px-3 py-1 text-xs font-semibold ${trendGroupBy === "month" ? "bg-brand-700 text-white" : "border border-slate-200 text-slate-700"}`,
                    children: "Theo tháng",
                  }),
                  _jsx("button", {
                    type: "button",
                    onClick: () => void exportRevenue("csv"),
                    className:
                      "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700",
                    children: "Export CSV",
                  }),
                  _jsx("button", {
                    type: "button",
                    onClick: () => void exportRevenue("pdf"),
                    className:
                      "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700",
                    children: "Export PDF",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "mt-4 grid gap-4 xl:grid-cols-3",
            children: [
              _jsx(TrendBarChart, {
                title: "Bệnh nhân mới",
                points: trends,
                field: "new_patients",
                colorClass: "bg-emerald-400",
              }),
              _jsx(TrendBarChart, {
                title: "Lượt khám",
                points: trends,
                field: "appointments",
                colorClass: "bg-sky-400",
              }),
              _jsx(TrendBarChart, {
                title: "Doanh thu",
                points: trends,
                field: "revenue",
                colorClass: "bg-amber-400",
                formatter: (value) => `${value.toLocaleString("vi-VN")} đ`,
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-6 xl:grid-cols-2",
        children: [
          _jsxs("form", {
            onSubmit: createUser,
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsx("h3", {
                className: "text-lg font-bold text-slate-900",
                children: "Tạo tài khoản người dùng",
              }),
              _jsxs("div", {
                className: "mt-3 grid gap-2",
                children: [
                  _jsx("input", {
                    required: true,
                    placeholder: "Họ tên",
                    value: createUserForm.fullName,
                    onChange: (event) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    required: true,
                    type: "email",
                    placeholder: "Email",
                    value: createUserForm.email,
                    onChange: (event) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    required: true,
                    type: "password",
                    placeholder: "Mật khẩu",
                    value: createUserForm.password,
                    onChange: (event) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsxs("select", {
                    value: createUserForm.role,
                    onChange: (event) =>
                      setCreateUserForm((prev) => ({
                        ...prev,
                        role: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                    children: [
                      _jsx("option", { value: "PATIENT", children: "PATIENT" }),
                      _jsx("option", { value: "DOCTOR", children: "DOCTOR" }),
                      _jsx("option", { value: "STAFF", children: "STAFF" }),
                      _jsx("option", { value: "ADMIN", children: "ADMIN" }),
                    ],
                  }),
                  createUserForm.role === "PATIENT"
                    ? _jsx("input", {
                        required: true,
                        placeholder: "Số điện thoại bệnh nhân",
                        value: createUserForm.phoneNumber,
                        onChange: (event) =>
                          setCreateUserForm((prev) => ({
                            ...prev,
                            phoneNumber: event.target.value,
                          })),
                        className:
                          "rounded-xl border border-slate-200 px-3 py-2",
                      })
                    : null,
                  createUserForm.role === "DOCTOR"
                    ? _jsxs(_Fragment, {
                        children: [
                          _jsx("input", {
                            required: true,
                            placeholder: "Mã bác sĩ",
                            value: createUserForm.doctorCode,
                            onChange: (event) =>
                              setCreateUserForm((prev) => ({
                                ...prev,
                                doctorCode: event.target.value,
                              })),
                            className:
                              "rounded-xl border border-slate-200 px-3 py-2",
                          }),
                          _jsxs("select", {
                            required: true,
                            value: createUserForm.departmentId,
                            onChange: (event) =>
                              setCreateUserForm((prev) => ({
                                ...prev,
                                departmentId: event.target.value,
                              })),
                            className:
                              "rounded-xl border border-slate-200 px-3 py-2",
                            children: [
                              _jsx("option", {
                                value: "",
                                children: "-- Chọn khoa --",
                              }),
                              departments.map((department) =>
                                _jsx(
                                  "option",
                                  {
                                    value: department.id,
                                    children: department.name,
                                  },
                                  department.id,
                                ),
                              ),
                            ],
                          }),
                        ],
                      })
                    : null,
                  _jsx("button", {
                    type: "submit",
                    className:
                      "rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900",
                    children: "Tạo người dùng",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("article", {
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  _jsx("h3", {
                    className: "text-lg font-bold text-slate-900",
                    children: "Notification Queue",
                  }),
                  _jsx("button", {
                    type: "button",
                    onClick: () => void processQueue(),
                    className:
                      "rounded-lg bg-accent-500 px-3 py-1 text-xs font-semibold text-white hover:bg-accent-700",
                    children: "Xử lý queue",
                  }),
                ],
              }),
              _jsxs("div", {
                className: "mt-3 space-y-2",
                children: [
                  notificationJobs.length === 0
                    ? _jsx("p", {
                        className: "text-sm text-slate-600",
                        children: "Chưa có notification jobs.",
                      })
                    : null,
                  notificationJobs
                    .slice(0, 8)
                    .map((job) =>
                      _jsxs(
                        "div",
                        {
                          className: "rounded-xl bg-slate-50 p-3",
                          children: [
                            _jsxs("p", {
                              className: "text-sm font-semibold text-slate-900",
                              children: [job.channel, " - ", job.status],
                            }),
                            _jsxs("p", {
                              className: "text-xs text-slate-600",
                              children: [
                                job.user_email ?? "N/A",
                                " | attempts: ",
                                job.attempt_count,
                                "/",
                                job.max_attempts,
                              ],
                            }),
                            job.last_error
                              ? _jsx("p", {
                                  className: "text-xs text-red-600",
                                  children: job.last_error,
                                })
                              : null,
                          ],
                        },
                        job.id,
                      ),
                    ),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("article", {
        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
        children: [
          _jsx("h3", {
            className: "text-lg font-bold text-slate-900",
            children: "Báo cáo doanh thu theo ngày",
          }),
          _jsxs("div", {
            className: "mt-3 space-y-2",
            children: [
              revenueReport.length === 0
                ? _jsx("p", {
                    className: "text-sm text-slate-600",
                    children: "Chưa có dữ liệu doanh thu.",
                  })
                : null,
              revenueReport.map((item) =>
                _jsxs(
                  "div",
                  {
                    className: "rounded-xl bg-slate-50 p-3",
                    children: [
                      _jsx("p", {
                        className: "text-sm font-semibold text-slate-900",
                        children: item.period,
                      }),
                      _jsxs("p", {
                        className: "text-xs text-slate-600",
                        children: [
                          "Doanh thu: ",
                          Number(item.total_revenue).toLocaleString("vi-VN"),
                          " đ | Giao dịch:",
                          " ",
                          item.total_transactions,
                        ],
                      }),
                    ],
                  },
                  item.period,
                ),
              ),
            ],
          }),
        ],
      }),
      _jsxs("article", {
        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
        children: [
          _jsx("h3", {
            className: "text-lg font-bold text-slate-900",
            children: "Quản lý người dùng",
          }),
          _jsxs("p", {
            className: "mt-1 text-xs text-slate-500",
            children: [
              "Trang ",
              usersMeta.page,
              "/",
              Math.max(1, usersMeta.totalPages),
              " - Tổng: ",
              usersMeta.totalItems,
            ],
          }),
          _jsxs("div", {
            className: "mt-3 grid gap-2",
            children: [
              users.length === 0
                ? _jsx("p", {
                    className:
                      "rounded-xl border border-slate-200 p-3 text-sm text-slate-600",
                    children: "Chưa có dữ liệu người dùng.",
                  })
                : null,
              users.map((item) =>
                _jsxs(
                  "div",
                  {
                    className:
                      "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3",
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsx("p", {
                            className: "text-sm font-semibold text-slate-900",
                            children: item.full_name,
                          }),
                          _jsx("p", {
                            className: "text-xs text-slate-600",
                            children: item.email,
                          }),
                          _jsxs("p", {
                            className: "text-xs text-slate-500",
                            children: ["Roles: ", item.roles.join(", ")],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsxs("select", {
                            value: item.roles[0] ?? "PATIENT",
                            onChange: (event) =>
                              void updateRole(item, event.target.value),
                            className:
                              "rounded-lg border border-slate-200 px-2 py-1 text-xs",
                            children: [
                              _jsx("option", {
                                value: "PATIENT",
                                children: "PATIENT",
                              }),
                              _jsx("option", {
                                value: "DOCTOR",
                                children: "DOCTOR",
                              }),
                              _jsx("option", {
                                value: "STAFF",
                                children: "STAFF",
                              }),
                              _jsx("option", {
                                value: "ADMIN",
                                children: "ADMIN",
                              }),
                            ],
                          }),
                          _jsx("button", {
                            type: "button",
                            onClick: () => void toggleUserStatus(item),
                            className: `rounded-lg px-3 py-1 text-xs font-semibold ${
                              item.is_active
                                ? "border border-red-200 text-red-700"
                                : "border border-emerald-200 text-emerald-700"
                            }`,
                            children: item.is_active ? "Khóa" : "Mở khóa",
                          }),
                        ],
                      }),
                    ],
                  },
                  item.id,
                ),
              ),
            ],
          }),
          _jsxs("div", {
            className: "mt-4 flex items-center justify-end gap-2",
            children: [
              _jsx("button", {
                type: "button",
                onClick: () => setUsersPage((prev) => Math.max(1, prev - 1)),
                disabled: usersMeta.page <= 1,
                className:
                  "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50",
                children: "Trước",
              }),
              _jsxs("span", {
                className: "text-xs text-slate-600",
                children: [
                  usersMeta.page,
                  " / ",
                  Math.max(1, usersMeta.totalPages),
                ],
              }),
              _jsx("button", {
                type: "button",
                onClick: () =>
                  setUsersPage((prev) =>
                    Math.min(Math.max(1, usersMeta.totalPages), prev + 1),
                  ),
                disabled: usersMeta.page >= Math.max(1, usersMeta.totalPages),
                className:
                  "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50",
                children: "Sau",
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-6 lg:grid-cols-2",
        children: [
          _jsxs("form", {
            onSubmit: createDepartment,
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsx("h3", {
                className: "text-lg font-bold text-slate-900",
                children: "Thêm chuyên khoa mới",
              }),
              _jsxs("div", {
                className: "mt-3 grid gap-2",
                children: [
                  _jsx("input", {
                    required: true,
                    placeholder: "Tên khoa",
                    value: deptForm.name,
                    onChange: (event) =>
                      setDeptForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    required: true,
                    placeholder: "Slug (ví dụ: khoa-da-lieu)",
                    value: deptForm.slug,
                    onChange: (event) =>
                      setDeptForm((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    placeholder: "Vị trí",
                    value: deptForm.location,
                    onChange: (event) =>
                      setDeptForm((prev) => ({
                        ...prev,
                        location: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    placeholder: "Số điện thoại",
                    value: deptForm.phone,
                    onChange: (event) =>
                      setDeptForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("textarea", {
                    placeholder: "Mô tả khoa",
                    value: deptForm.description,
                    onChange: (event) =>
                      setDeptForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("button", {
                    type: "submit",
                    className:
                      "rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900",
                    children: "Tạo khoa",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("form", {
            onSubmit: createSlot,
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsx("h3", {
                className: "text-lg font-bold text-slate-900",
                children: "Thêm khung giờ khám",
              }),
              _jsxs("div", {
                className: "mt-3 grid gap-2",
                children: [
                  _jsxs("select", {
                    required: true,
                    value: slotForm.doctorId,
                    onChange: (event) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        doctorId: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                    children: [
                      _jsx("option", {
                        value: "",
                        children: "-- Chọn bác sĩ --",
                      }),
                      doctors.map((doctor) =>
                        _jsxs(
                          "option",
                          {
                            value: doctor.id,
                            children: [
                              doctor.full_name,
                              " - ",
                              doctor.department_name,
                            ],
                          },
                          doctor.id,
                        ),
                      ),
                    ],
                  }),
                  _jsx("input", {
                    required: true,
                    type: "date",
                    value: slotForm.slotDate,
                    onChange: (event) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        slotDate: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    required: true,
                    type: "time",
                    value: slotForm.startTime,
                    onChange: (event) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        startTime: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("input", {
                    required: true,
                    type: "time",
                    value: slotForm.endTime,
                    onChange: (event) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        endTime: event.target.value,
                      })),
                    className: "rounded-xl border border-slate-200 px-3 py-2",
                  }),
                  _jsx("button", {
                    type: "submit",
                    className:
                      "rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-700",
                    children: "Tạo khung giờ",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-6 xl:grid-cols-3",
        children: [
          _jsxs("article", {
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsx("h4", {
                className: "text-base font-bold text-slate-900",
                children: "Lịch khám mới nhất",
              }),
              _jsxs("p", {
                className: "mt-1 text-xs text-slate-500",
                children: ["Tổng: ", bookings.length],
              }),
              _jsx("div", {
                className: "mt-3 space-y-2",
                children: bookings
                  .slice(0, 5)
                  .map((booking) =>
                    _jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => void openBookingDetail(booking.id),
                        className:
                          "w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100",
                        children: [
                          _jsx("p", {
                            className: "text-sm font-semibold text-slate-900",
                            children: booking.patient_name,
                          }),
                          _jsxs("p", {
                            className: "text-xs text-slate-600",
                            children: [
                              booking.department_name,
                              " - ",
                              booking.status,
                            ],
                          }),
                        ],
                      },
                      booking.id,
                    ),
                  ),
              }),
            ],
          }),
          _jsxs("article", {
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsx("h4", {
                className: "text-base font-bold text-slate-900",
                children: "Kết quả cận lâm sàng",
              }),
              _jsxs("p", {
                className: "mt-1 text-xs text-slate-500",
                children: ["Tổng: ", labResults.length],
              }),
              _jsx("div", {
                className: "mt-3 space-y-2",
                children: labResults
                  .slice(0, 5)
                  .map((result) =>
                    _jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => void openLabResultDetail(result.id),
                        className:
                          "w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100",
                        children: [
                          _jsx("p", {
                            className: "text-sm font-semibold text-slate-900",
                            children: result.test_name,
                          }),
                          _jsxs("p", {
                            className: "text-xs text-slate-600",
                            children: [
                              result.patient_code,
                              " - ",
                              result.status,
                            ],
                          }),
                        ],
                      },
                      result.id,
                    ),
                  ),
              }),
            ],
          }),
          _jsxs("article", {
            className:
              "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
            children: [
              _jsx("h4", {
                className: "text-base font-bold text-slate-900",
                children: "Tin nhắn liên hệ",
              }),
              _jsxs("p", {
                className: "mt-1 text-xs text-slate-500",
                children: ["Tổng: ", contactMessages.length],
              }),
              _jsx("div", {
                className: "mt-3 space-y-2",
                children: contactMessages
                  .slice(0, 5)
                  .map((contact) =>
                    _jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () =>
                          void openContactMessageDetail(contact.id),
                        className:
                          "w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100",
                        children: [
                          _jsx("p", {
                            className: "text-sm font-semibold text-slate-900",
                            children: contact.full_name,
                          }),
                          _jsx("p", {
                            className: "text-xs text-slate-600",
                            children: contact.subject,
                          }),
                        ],
                      },
                      contact.id,
                    ),
                  ),
              }),
            ],
          }),
        ],
      }),
      _jsxs("article", {
        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
        children: [
          _jsx("h4", {
            className: "text-base font-bold text-slate-900",
            children: "Trang CMS",
          }),
          _jsx("div", {
            className: "mt-3 grid gap-2 md:grid-cols-3",
            children: cmsPages.map((page) =>
              _jsxs(
                "div",
                {
                  className: "rounded-xl border border-slate-200 p-3",
                  children: [
                    _jsx("p", {
                      className: "text-sm font-semibold text-slate-900",
                      children: page.title,
                    }),
                    _jsxs("p", {
                      className: "text-xs text-slate-500",
                      children: ["Khóa trang: ", page.page_key],
                    }),
                  ],
                },
                page.id,
              ),
            ),
          }),
        ],
      }),
      detailType
        ? _jsx("div", {
            className:
              "fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4",
            children: _jsxs("div", {
              className:
                "max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsx("h4", {
                      className: "text-lg font-bold text-slate-900",
                      children:
                        detailType === "booking"
                          ? "Chi tiết lịch khám"
                          : detailType === "lab"
                            ? "Chi tiết kết quả cận lâm sàng"
                            : "Chi tiết tin nhắn liên hệ",
                    }),
                    _jsx("button", {
                      type: "button",
                      onClick: closeDetailModal,
                      className:
                        "rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700",
                      children: "Đóng",
                    }),
                  ],
                }),
                detailLoading
                  ? _jsx("p", {
                      className: "mt-4 text-sm text-slate-600",
                      children: "Đang tải dữ liệu...",
                    })
                  : null,
                detailError
                  ? _jsx("p", {
                      className: "mt-4 text-sm text-red-600",
                      children: detailError,
                    })
                  : null,
                !detailLoading &&
                !detailError &&
                detailType === "booking" &&
                selectedBooking
                  ? _jsxs("div", {
                      className: "mt-4 space-y-2 text-sm text-slate-700",
                      children: [
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Bệnh nhân:" }),
                            " ",
                            selectedBooking.patient_name,
                            " (",
                            selectedBooking.patient_code,
                            ")",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Bác sĩ:" }),
                            " ",
                            selectedBooking.doctor_name,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Khoa:" }),
                            " ",
                            selectedBooking.department_name,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Ngày giờ:" }),
                            " ",
                            selectedBooking.slot_date,
                            " ",
                            selectedBooking.start_time,
                            " - ",
                            selectedBooking.end_time,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Trạng thái:" }),
                            " ",
                            selectedBooking.status,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Lý do:" }),
                            " ",
                            selectedBooking.reason ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Ghi chú:" }),
                            " ",
                            selectedBooking.notes ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Chẩn đoán:" }),
                            " ",
                            selectedBooking.diagnosis ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Ghi chú bác sĩ:" }),
                            " ",
                            selectedBooking.doctor_note ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Lý do hủy:" }),
                            " ",
                            selectedBooking.patient_cancel_reason ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Ghi chú đổi lịch:" }),
                            " ",
                            selectedBooking.reschedule_note ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Phản hồi bác sĩ:" }),
                            " ",
                            selectedBooking.doctor_response_reason ?? "-",
                          ],
                        }),
                      ],
                    })
                  : null,
                !detailLoading &&
                !detailError &&
                detailType === "lab" &&
                selectedLabResult
                  ? _jsxs("div", {
                      className: "mt-4 space-y-2 text-sm text-slate-700",
                      children: [
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Bệnh nhân:" }),
                            " ",
                            selectedLabResult.patient_name,
                            " (",
                            selectedLabResult.patient_code,
                            ")",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Mã xét nghiệm:" }),
                            " ",
                            selectedLabResult.test_code,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Tên xét nghiệm:" }),
                            " ",
                            selectedLabResult.test_name,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Trạng thái:" }),
                            " ",
                            selectedLabResult.status,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Tóm tắt:" }),
                            " ",
                            selectedLabResult.result_summary ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Kết quả chi tiết:" }),
                            " ",
                            selectedLabResult.result_detail ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Kết luận:" }),
                            " ",
                            selectedLabResult.conclusion ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", {
                              children: "Thời gian thực hiện:",
                            }),
                            " ",
                            selectedLabResult.performed_at ?? "-",
                          ],
                        }),
                      ],
                    })
                  : null,
                !detailLoading &&
                !detailError &&
                detailType === "contact" &&
                selectedContactMessage
                  ? _jsxs("div", {
                      className: "mt-4 space-y-2 text-sm text-slate-700",
                      children: [
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Họ tên:" }),
                            " ",
                            selectedContactMessage.full_name,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Số điện thoại:" }),
                            " ",
                            selectedContactMessage.phone_number ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Email:" }),
                            " ",
                            selectedContactMessage.email ?? "-",
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Chủ đề:" }),
                            " ",
                            selectedContactMessage.subject,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Nội dung:" }),
                            " ",
                            selectedContactMessage.message,
                          ],
                        }),
                        _jsxs("p", {
                          children: [
                            _jsx("strong", { children: "Thời gian gửi:" }),
                            " ",
                            selectedContactMessage.created_at,
                          ],
                        }),
                      ],
                    })
                  : null,
              ],
            }),
          })
        : null,
    ],
  });
};
