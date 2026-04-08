const {
    canTransitionAppointment,
    isPatientCancelableStatus,
    isPatientReschedulableStatus,
} = require("../../src/utils/appointment-state");

describe("appointment state machine", () => {
    it("allows only valid transitions", () => {
        expect(canTransitionAppointment("PENDING", "CONFIRMED")).toBe(true);
        expect(canTransitionAppointment("PENDING", "CANCELLED")).toBe(true);
        expect(canTransitionAppointment("CONFIRMED", "COMPLETED")).toBe(true);
        expect(canTransitionAppointment("CONFIRMED", "CANCELLED")).toBe(true);
    });
    it("blocks invalid transitions", () => {
        expect(canTransitionAppointment("PENDING", "COMPLETED")).toBe(false);
        expect(canTransitionAppointment("CONFIRMED", "PENDING")).toBe(false);
        expect(canTransitionAppointment("CANCELLED", "CONFIRMED")).toBe(false);
        expect(canTransitionAppointment("COMPLETED", "CANCELLED")).toBe(false);
    });
    it("patient cancellation and reschedule follow expected status rules", () => {
        expect(isPatientCancelableStatus("PENDING")).toBe(true);
        expect(isPatientCancelableStatus("CONFIRMED")).toBe(true);
        expect(isPatientCancelableStatus("CANCELLED")).toBe(false);
        expect(isPatientCancelableStatus("COMPLETED")).toBe(false);
        expect(isPatientReschedulableStatus("PENDING")).toBe(true);
        expect(isPatientReschedulableStatus("CONFIRMED")).toBe(true);
        expect(isPatientReschedulableStatus("CANCELLED")).toBe(false);
        expect(isPatientReschedulableStatus("COMPLETED")).toBe(false);
    });
});
