import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const AUTH_SESSION_KEY = "hospital_auth_session";
let accessToken = localStorage.getItem("hospital_access_token");
const hasAuthSession = () => localStorage.getItem(AUTH_SESSION_KEY) === "1";
export const hadAuthSession = () => hasAuthSession();
export const setAccessToken = (token) => {
    accessToken = token;
    if (token) {
        localStorage.setItem("hospital_access_token", token);
        localStorage.setItem(AUTH_SESSION_KEY, "1");
    }
    else {
        localStorage.removeItem("hospital_access_token");
        localStorage.removeItem(AUTH_SESSION_KEY);
    }
};
export const getAccessToken = () => accessToken;
export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});
let isRefreshing = false;
let refreshPromise = null;
api.interceptors.response.use((response) => response, async (error) => {
    const status = error?.response?.status;
    const originalRequest = (error?.config ?? {});
    const requestUrl = originalRequest.url ?? "";
    if (status !== 401 || originalRequest._retry) {
        throw error;
    }
    if (requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/refresh")) {
        throw error;
    }
    originalRequest._retry = true;
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshClient
            .post("/auth/refresh")
            .then((response) => {
            const newToken = response.data.data.accessToken;
            setAccessToken(newToken);
            return newToken;
        })
            .catch(async () => {
            await refreshClient.post("/auth/logout").catch(() => null);
            setAccessToken(null);
            return null;
        })
            .finally(() => {
            isRefreshing = false;
        });
    }
    const newToken = await refreshPromise;
    if (!newToken) {
        throw error;
    }
    originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
    };
    return api.request(originalRequest);
});
export const authApi = {
    register: (payload) => api.post("/auth/register", payload),
    login: (payload) => api.post("/auth/login", payload),
    forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
    resetPassword: (token, payload) => api.post(`/auth/reset-password/${token}`, payload),
    logout: () => api.post("/auth/logout"),
    me: () => api.get("/auth/me"),
    refresh: () => api.post("/auth/refresh"),
};
export const publicApi = {
    departments: () => api.get("/departments?page=1&pageSize=50"),
    doctors: (departmentId, keyword) => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", "50");
        if (departmentId) {
            params.set("departmentId", departmentId);
        }
        if (keyword?.trim()) {
            params.set("keyword", keyword.trim());
        }
        return api.get(`/doctors?${params.toString()}`);
    },
    doctorSlots: (doctorId, date) => api.get(date ? `/doctors/${doctorId}/slots?date=${date}` : `/doctors/${doctorId}/slots`),
    services: () => api.get("/services?page=1&pageSize=50"),
    news: () => api.get("/news?page=1&pageSize=12"),
    newsDetail: (slug) => api.get(`/news/${slug}`),
    lookupLab: (payload) => api.post("/lab-results/lookup", payload),
    lookupPatientRecords: (payload) => api.post("/patient-records/lookup", payload),
    sendContact: (payload) => api.post("/contact/messages", payload),
    cmsPage: (pageKey) => api.get(`/cms/pages/${pageKey}`),
    rssNews: (limit = 6, source = "vnexpress") => api.get(`/rss-news?limit=${limit}&source=${source}`),
    submitRecruitmentApplication: (formData) => api.post("/recruitment-applications", formData),
};
export const patientApi = {
    createBooking: (payload) => api.post("/bookings", payload),
    myBookings: () => api.get("/bookings/me"),
};
export const patientPortalApi = {
    profile: () => api.get("/patient/profile"),
    updateProfile: (payload) => api.patch("/patient/profile", payload),
    bookings: (view = "all") => api.get(`/patient/bookings?view=${view}&page=1&pageSize=50`),
    cancelBooking: (bookingId, reason) => api.patch(`/patient/bookings/${bookingId}/cancel`, { reason }),
    rescheduleBooking: (bookingId, payload) => api.patch(`/patient/bookings/${bookingId}/reschedule`, payload),
    labResults: () => api.get("/patient/lab-results"),
    prescriptions: () => api.get("/patient/prescriptions"),
    payments: () => api.get("/patient/payments"),
    createPayment: (payload) => api.post("/patient/payments", payload),
    confirmPayment: (paymentId, payload) => api.patch(`/patient/payments/${paymentId}/confirm`, payload ?? {}),
    failPayment: (paymentId, payload) => api.patch(`/patient/payments/${paymentId}/fail`, payload ?? {}),
    downloadInvoicePdf: (paymentId) => api.get(`/patient/payments/${paymentId}/invoice/pdf`, { responseType: "blob" }),
    notifications: () => api.get("/patient/notifications"),
    readNotification: (notificationId) => api.patch(`/patient/notifications/${notificationId}/read`),
    createReview: (payload) => api.post("/patient/reviews", payload),
};
export const doctorPortalApi = {
    profile: () => api.get("/doctor/profile"),
    updateProfile: (payload) => api.patch("/doctor/profile", payload),
    appointments: (params) => {
        const query = new URLSearchParams();
        query.set("page", "1");
        query.set("pageSize", "100");
        if (params?.fromDate)
            query.set("fromDate", params.fromDate);
        if (params?.toDate)
            query.set("toDate", params.toDate);
        if (params?.status)
            query.set("status", params.status);
        return api.get(`/doctor/appointments?${query.toString()}`);
    },
    updateAppointmentStatus: (bookingId, payload) => api.patch(`/doctor/appointments/${bookingId}/status`, payload),
    upsertPrescription: (bookingId, payload) => api.post(`/doctor/appointments/${bookingId}/prescription`, payload),
    patientRecords: (patientCode) => api.get(`/doctor/patients/${patientCode}/records`),
    createSlot: (payload) => api.post("/doctor/slots", payload),
    deleteSlot: (slotId) => api.delete(`/doctor/slots/${slotId}`),
    notifications: () => api.get("/doctor/notifications"),
    readNotification: (notificationId) => api.patch(`/doctor/notifications/${notificationId}/read`),
};
export const adminApi = {
    departments: () => api.get("/admin/departments"),
    createDepartment: (payload) => api.post("/admin/departments", payload),
    doctors: () => api.get("/admin/doctors"),
    createDoctorSlot: (payload) => api.post("/admin/doctors/slots", payload),
    bookings: () => api.get("/admin/bookings?page=1&pageSize=20"),
    bookingDetail: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
    contactMessages: () => api.get("/admin/contact/messages?page=1&pageSize=20"),
    contactMessageDetail: (messageId) => api.get(`/admin/contact/messages/${messageId}`),
    labResults: () => api.get("/admin/lab-results?page=1&pageSize=20"),
    labResultDetail: (labResultId) => api.get(`/admin/lab-results/${labResultId}`),
    cmsPages: () => api.get("/admin/cms/pages"),
    recruitmentApplications: (params) => {
        const query = new URLSearchParams();
        query.set("page", String(params?.page ?? 1));
        query.set("pageSize", String(params?.pageSize ?? 10));
        if (params?.keyword)
            query.set("keyword", params.keyword);
        if (params?.status)
            query.set("status", params.status);
        return api.get(`/admin/recruitment-applications?${query.toString()}`);
    },
    updateRecruitmentApplicationStatus: (applicationId, payload) => api.patch(`/admin/recruitment-applications/${applicationId}/status`, payload),
    downloadRecruitmentApplicationCv: (applicationId) => api.get(`/admin/recruitment-applications/${applicationId}/cv`, {
        responseType: "blob",
    }),
};
export const adminPortalApi = {
    overview: () => api.get("/admin/portal/dashboard/overview"),
    trends: (groupBy = "day", points = groupBy === "day" ? 30 : 12) => api.get(`/admin/portal/dashboard/trends?groupBy=${groupBy}&points=${points}`),
    users: (params) => {
        const query = new URLSearchParams();
        query.set("page", String(params?.page ?? 1));
        query.set("pageSize", String(params?.pageSize ?? 10));
        if (params?.keyword)
            query.set("keyword", params.keyword);
        if (params?.role)
            query.set("role", params.role);
        return api.get(`/admin/portal/users?${query.toString()}`);
    },
    createUser: (payload) => api.post("/admin/portal/users", payload),
    updateUserStatus: (userId, isActive) => api.patch(`/admin/portal/users/${userId}/status`, { isActive }),
    updateUserRoles: (userId, roles) => api.patch(`/admin/portal/users/${userId}/roles`, { roles }),
    revenueReport: (groupBy = "month") => api.get(`/admin/portal/reports/revenue?groupBy=${groupBy}`),
    exportRevenueReport: (format, groupBy = "month", fromDate, toDate) => api.get(`/admin/portal/reports/revenue/export`, {
        params: { format, groupBy, fromDate, toDate },
        responseType: "blob",
    }),
    advancedOverview: (period = "week") => api.get(`/admin/portal/reports/advanced/overview?period=${period}`),
    topDepartments: (period = "week", limit = 5) => api.get(`/admin/portal/reports/advanced/top-departments?period=${period}&limit=${limit}`),
    revenueByService: (period = "week") => api.get(`/admin/portal/reports/advanced/revenue-by-service?period=${period}`),
    exportAdvancedReport: (format, period = "week") => api.get(`/admin/portal/reports/advanced/export`, {
        params: { format, period },
        responseType: "blob",
    }),
    paymentReconciliation: (params) => {
        const query = new URLSearchParams();
        query.set("page", String(params?.page ?? 1));
        query.set("pageSize", String(params?.pageSize ?? 20));
        if (params?.gateway)
            query.set("gateway", params.gateway);
        if (params?.status)
            query.set("status", params.status);
        if (params?.fromDate)
            query.set("fromDate", params.fromDate);
        if (params?.toDate)
            query.set("toDate", params.toDate);
        return api.get(`/admin/portal/reports/payments/reconciliation?${query.toString()}`);
    },
    reconcilePayment: (paymentId) => api.patch(`/admin/portal/reports/payments/${paymentId}/reconcile`),
    notificationJobs: (status) => api.get(`/admin/portal/notifications/jobs?page=1&pageSize=20${status ? `&status=${status}` : ""}`),
    processNotificationJobs: (batchSize) => api.post("/admin/portal/notifications/jobs/process", batchSize ? { batchSize } : {}),
    createDoctorAnnouncement: (payload) => api.post("/admin/portal/notifications/doctor-announcements", payload),
    settings: () => api.get("/admin/portal/settings"),
    upsertSetting: (payload) => api.put("/admin/portal/settings", payload),
    medicines: () => api.get("/admin/portal/medicines"),
    createMedicine: (payload) => api.post("/admin/portal/medicines", payload),
    labTests: () => api.get("/admin/portal/lab-tests"),
    createLabTest: (payload) => api.post("/admin/portal/lab-tests", payload),
};
