var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(8080),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL là bắt buộc"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, "JWT_ACCESS_SECRET phải dài ít nhất 32 ký tự"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, "JWT_REFRESH_SECRET phải dài ít nhất 32 ký tự"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("30m"),
    JWT_REFRESH_EXPIRES_IN_DAYS: zod_1.z.coerce.number().int().positive().default(14),
    PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: zod_1.z.coerce.number().int().positive().default(15),
    PASSWORD_RESET_URL: zod_1.z.string().url().optional(),
    LOGIN_MAX_FAILED_ATTEMPTS: zod_1.z.coerce.number().int().positive().default(5),
    LOGIN_LOCK_MINUTES: zod_1.z.coerce.number().int().positive().default(15),
    LOGIN_RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(60_000),
    LOGIN_RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(10),
    LAB_LOOKUP_RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(60_000),
    LAB_LOOKUP_RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(20),
    REDIS_URL: zod_1.z.string().url().optional(),
    REDIS_RATE_LIMIT_ENABLED: zod_1.z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),
    NOTIFICATION_QUEUE_ENABLED: zod_1.z
        .enum(["true", "false"])
        .default("true")
        .transform((value) => value === "true"),
    NOTIFICATION_QUEUE_POLL_MS: zod_1.z.coerce.number().int().positive().default(10_000),
    NOTIFICATION_QUEUE_BATCH_SIZE: zod_1.z.coerce.number().int().positive().default(20),
    CLIENT_URL: zod_1.z.string().url().optional(),
    CLIENT_URLS: zod_1.z.string().optional(),
    COOKIE_SECURE: zod_1.z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Biến môi trường không hợp lệ", parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
