var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../src/config/db");
const root = path_1.default.resolve(__dirname, "..", "src", "db");
const runSqlFile = async (filePath) => {
    const sql = await promises_1.default.readFile(filePath, "utf8");
    await db_1.db.query(sql);
    console.log(`Da chay: ${path_1.default.basename(filePath)}`);
};
const listSqlFiles = async (directory, options) => {
    const entries = await promises_1.default.readdir(directory, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
        .filter((entry) => (options?.include ? options.include(entry.name) : true))
        .map((entry) => path_1.default.join(directory, entry.name))
        .sort((a, b) => path_1.default.basename(a).localeCompare(path_1.default.basename(b)));
};
const runMigrate = async () => {
    const migrationDir = path_1.default.join(root, "migrations");
    const files = await listSqlFiles(migrationDir);
    for (const file of files) {
        await runSqlFile(file);
    }
};
const isDemoSeed = (fileName) => fileName.includes("demo");
const runSeed = async (kind = "core") => {
    const seedDir = path_1.default.join(root, "seeds");
    const files = await listSqlFiles(seedDir, {
        include: (fileName) => (kind === "all" ? true : !isDemoSeed(fileName)),
    });
    for (const file of files) {
        await runSqlFile(file);
    }
};
const main = async () => {
    const mode = process.argv[2];
    if (!mode || !["migrate", "seed", "seed:demo", "init", "init:demo"].includes(mode)) {
        throw new Error("Tham so khong hop le. Dung: migrate | seed | seed:demo | init | init:demo");
    }
    try {
        if (mode === "migrate") {
            await runMigrate();
        }
        if (mode === "seed") {
            await runSeed("core");
        }
        if (mode === "seed:demo") {
            await runSeed("all");
        }
        if (mode === "init") {
            await runMigrate();
            await runSeed("core");
        }
        if (mode === "init:demo") {
            await runMigrate();
            await runSeed("all");
        }
    }
    finally {
        await db_1.db.end();
    }
};
void main();
