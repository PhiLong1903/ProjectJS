const fs = require("fs/promises");
const path = require("path");
const { db } = require("../src/config/db");

const root = path.resolve(__dirname, "..", "src", "db");

const runSqlFile = async (filePath) => {
    const sql = await fs.readFile(filePath, "utf8");
    await db.query(sql);
    console.log(`Da chay: ${path.basename(filePath)}`);
};

const listSqlFiles = async (directory, options) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
        .filter((entry) => (options?.include ? options.include(entry.name) : true))
        .map((entry) => path.join(directory, entry.name))
        .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
};

const runMigrate = async () => {
    const migrationDir = path.join(root, "migrations");
    const files = await listSqlFiles(migrationDir);
    for (const file of files) {
        await runSqlFile(file);
    }
};

const isDemoSeed = (fileName) => fileName.includes("demo");

const runSeed = async (kind = "core") => {
    const seedDir = path.join(root, "seeds");
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
        await db.end();
    }
};

void main();
