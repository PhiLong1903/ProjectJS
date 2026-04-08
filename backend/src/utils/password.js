const bcryptjs = require("bcryptjs");
const SALT_ROUNDS = 10;
const hashPassword = (plainPassword, rounds = SALT_ROUNDS) => bcryptjs.hash(plainPassword, rounds);
exports.hashPassword = hashPassword;
const comparePassword = (plainPassword, hashedPassword) => bcryptjs.compare(plainPassword, hashedPassword);
exports.comparePassword = comparePassword;
