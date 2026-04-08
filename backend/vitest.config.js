const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.js"],
        setupFiles: ["tests/setup.js"],
        sequence: {
            concurrent: false,
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "coverage",
        },
    },
});
