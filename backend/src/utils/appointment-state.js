const transitionMap = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    CANCELLED: [],
    COMPLETED: [],
};
const canTransitionAppointment = (currentStatus, nextStatus) => transitionMap[currentStatus]?.includes(nextStatus) ?? false;
exports.canTransitionAppointment = canTransitionAppointment;
const isPatientCancelableStatus = (status) => status === "PENDING" || status === "CONFIRMED";
exports.isPatientCancelableStatus = isPatientCancelableStatus;
const isPatientReschedulableStatus = (status) => status === "PENDING" || status === "CONFIRMED";
exports.isPatientReschedulableStatus = isPatientReschedulableStatus;
const isTerminalAppointmentStatus = (status) => status === "CANCELLED" || status === "COMPLETED";
exports.isTerminalAppointmentStatus = isTerminalAppointmentStatus;
