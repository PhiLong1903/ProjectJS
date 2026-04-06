var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 10;
const hashPassword = (plainPassword, rounds = SALT_ROUNDS) => bcryptjs_1.default.hash(plainPassword, rounds);
exports.hashPassword = hashPassword;
const comparePassword = (plainPassword, hashedPassword) => bcryptjs_1.default.compare(plainPassword, hashedPassword);
exports.comparePassword = comparePassword;
