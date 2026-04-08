const { db } = require("../src/config/db");

beforeAll(async () => {
    await db.query("SELECT 1");
});

afterEach(async () => {
    await db.query("DELETE FROM auth_sessions");
    await db.query("DELETE FROM auth_login_attempts");
});

afterAll(async () => {
    await db.end();
});
