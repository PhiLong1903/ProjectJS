"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../src/config/db");
(0, vitest_1.beforeAll)(async () => {
    await db_1.db.query("SELECT 1");
});
(0, vitest_1.afterEach)(async () => {
    await db_1.db.query("DELETE FROM auth_sessions");
    await db_1.db.query("DELETE FROM auth_login_attempts");
});
(0, vitest_1.afterAll)(async () => {
    await db_1.db.end();
});
