const { UserModel } = require("./User");
const { PatientModel } = require("./Patient");
const { DepartmentModel } = require("./Department");
const { DoctorModel } = require("./Doctor");
const { DoctorSlotModel } = require("./DoctorSlot");
const { AppointmentModel } = require("./Appointment");
const { MedicalServiceModel } = require("./MedicalService");
const { NewsArticleModel } = require("./NewsArticle");
const { LabResultModel } = require("./LabResult");
const { CmsPageModel } = require("./CmsPage");
const { ContactMessageModel } = require("./ContactMessage");
const { PaymentTransactionModel } = require("./PaymentTransaction");
const { AuthSessionModel } = require("./AuthSession");
const { AuthLoginAttemptModel } = require("./AuthLoginAttempt");
const { RoleModel } = require("./Role");
const { UserRoleModel } = require("./UserRole");
const { MedicineModel } = require("./Medicine");
const { LabTestCatalogModel } = require("./LabTestCatalog");
const { SystemSettingModel } = require("./SystemSetting");
const { NotificationModel } = require("./Notification");
const { NotificationJobModel } = require("./NotificationJob");
const { PrescriptionModel } = require("./Prescription");
const { DoctorReviewModel } = require("./DoctorReview");
const { AuditLogModel } = require("./AuditLog");
const { RecruitmentApplicationModel } = require("./RecruitmentApplication");

DoctorModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
DoctorModel.belongsTo(DepartmentModel, { foreignKey: "department_id", as: "department" });
DoctorSlotModel.belongsTo(DoctorModel, { foreignKey: "doctor_id", as: "doctor" });
AppointmentModel.belongsTo(DoctorSlotModel, { foreignKey: "slot_id", as: "slot" });
AppointmentModel.belongsTo(DoctorModel, { foreignKey: "doctor_id", as: "doctor" });
AppointmentModel.belongsTo(DepartmentModel, { foreignKey: "department_id", as: "department" });
AppointmentModel.belongsTo(PatientModel, { foreignKey: "patient_id", as: "patient" });
UserModel.hasMany(UserRoleModel, { foreignKey: "user_id", as: "user_roles" });
UserRoleModel.belongsTo(RoleModel, { foreignKey: "role_id", as: "role" });
UserModel.hasOne(PatientModel, { foreignKey: "user_id", as: "patient" });
UserModel.hasOne(DoctorModel, { foreignKey: "user_id", as: "doctor" });
PatientModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
LabResultModel.belongsTo(PatientModel, { foreignKey: "patient_id", as: "patient" });
NotificationJobModel.belongsTo(NotificationModel, { foreignKey: "notification_id", as: "notification" });
NotificationJobModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
AuditLogModel.belongsTo(UserModel, { foreignKey: "actor_user_id", as: "actor" });

module.exports = {
  UserModel,
  PatientModel,
  DepartmentModel,
  DoctorModel,
  DoctorSlotModel,
  AppointmentModel,
  MedicalServiceModel,
  NewsArticleModel,
  LabResultModel,
  CmsPageModel,
  ContactMessageModel,
  PaymentTransactionModel,
  AuthSessionModel,
  AuthLoginAttemptModel,
  RoleModel,
  UserRoleModel,
  MedicineModel,
  LabTestCatalogModel,
  SystemSettingModel,
  NotificationModel,
  NotificationJobModel,
  PrescriptionModel,
  DoctorReviewModel,
  AuditLogModel,
  RecruitmentApplicationModel,
};
