"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const auths_service_1 = require("../../src/service/auths.service");
describe("auth login policy", () => {
    it("allows login when requested role matches account role", async () => {
        const result = await (0, auths_service_1.login)({
            email: "patient@benhvien.vn",
            password: "Patient@123",
            role: "PATIENT",
        }, {});
        expect(result.user.email).toBe("patient@benhvien.vn");
        expect(result.user.roles).toContain("PATIENT");
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
    });
    it("rejects login when role does not match", async () => {
        await expect((0, auths_service_1.login)({
            email: "patient@benhvien.vn",
            password: "Patient@123",
            role: "ADMIN",
        }, {})).rejects.toMatchObject({
            statusCode: http_status_codes_1.StatusCodes.FORBIDDEN,
        });
    });
    it("locks account temporarily after repeated failed password attempts", async () => {
        for (let i = 0; i < 5; i += 1) {
            await expect((0, auths_service_1.login)({
                email: "patient@benhvien.vn",
                password: "WrongPassword123",
                role: "PATIENT",
            }, {})).rejects.toBeDefined();
        }
        await expect((0, auths_service_1.login)({
            email: "patient@benhvien.vn",
            password: "Patient@123",
            role: "PATIENT",
        }, {})).rejects.toMatchObject({
            statusCode: http_status_codes_1.StatusCodes.LOCKED,
        });
    });
});
