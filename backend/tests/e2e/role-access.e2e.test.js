"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../src/app");
const getBearerToken = async (payload) => {
    const response = await (0, supertest_1.default)(app_1.app).post("/api/v1/auth/login").send(payload);
    expect(response.status).toBe(200);
    expect(response.body?.data?.accessToken).toBeTruthy();
    return response.body.data.accessToken;
};
describe("role-based protected endpoints (e2e)", () => {
    it("patient token can access patient portal but not admin portal", async () => {
        const token = await getBearerToken({
            email: "patient@benhvien.vn",
            password: "Patient@123",
            role: "PATIENT",
        });
        const profileResponse = await (0, supertest_1.default)(app_1.app)
            .get("/api/v1/patient/profile")
            .set("Authorization", `Bearer ${token}`);
        expect(profileResponse.status).toBe(200);
        const adminResponse = await (0, supertest_1.default)(app_1.app)
            .get("/api/v1/admin/portal/dashboard/overview")
            .set("Authorization", `Bearer ${token}`);
        expect(adminResponse.status).toBe(403);
    });
    it("doctor token can access doctor portal", async () => {
        const token = await getBearerToken({
            email: "doctor@benhvien.vn",
            password: "Doctor@123",
            role: "DOCTOR",
        });
        const response = await (0, supertest_1.default)(app_1.app)
            .get("/api/v1/doctor/profile")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
    it("admin token can access admin portal", async () => {
        const token = await getBearerToken({
            email: "admin@benhvien.vn",
            password: "Admin@123",
            role: "ADMIN",
        });
        const response = await (0, supertest_1.default)(app_1.app)
            .get("/api/v1/admin/portal/dashboard/overview")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
});
