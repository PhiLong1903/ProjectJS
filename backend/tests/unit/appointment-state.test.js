"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appointment_state_1 = require("../../src/utils/appointment-state");
describe("appointment state machine", () => {
    it("allows only valid transitions", () => {
        expect((0, appointment_state_1.canTransitionAppointment)("PENDING", "CONFIRMED")).toBe(true);
        expect((0, appointment_state_1.canTransitionAppointment)("PENDING", "CANCELLED")).toBe(true);
        expect((0, appointment_state_1.canTransitionAppointment)("CONFIRMED", "COMPLETED")).toBe(true);
        expect((0, appointment_state_1.canTransitionAppointment)("CONFIRMED", "CANCELLED")).toBe(true);
    });
    it("blocks invalid transitions", () => {
        expect((0, appointment_state_1.canTransitionAppointment)("PENDING", "COMPLETED")).toBe(false);
        expect((0, appointment_state_1.canTransitionAppointment)("CONFIRMED", "PENDING")).toBe(false);
        expect((0, appointment_state_1.canTransitionAppointment)("CANCELLED", "CONFIRMED")).toBe(false);
        expect((0, appointment_state_1.canTransitionAppointment)("COMPLETED", "CANCELLED")).toBe(false);
    });
    it("patient cancellation and reschedule follow expected status rules", () => {
        expect((0, appointment_state_1.isPatientCancelableStatus)("PENDING")).toBe(true);
        expect((0, appointment_state_1.isPatientCancelableStatus)("CONFIRMED")).toBe(true);
        expect((0, appointment_state_1.isPatientCancelableStatus)("CANCELLED")).toBe(false);
        expect((0, appointment_state_1.isPatientCancelableStatus)("COMPLETED")).toBe(false);
        expect((0, appointment_state_1.isPatientReschedulableStatus)("PENDING")).toBe(true);
        expect((0, appointment_state_1.isPatientReschedulableStatus)("CONFIRMED")).toBe(true);
        expect((0, appointment_state_1.isPatientReschedulableStatus)("CANCELLED")).toBe(false);
        expect((0, appointment_state_1.isPatientReschedulableStatus)("COMPLETED")).toBe(false);
    });
});
