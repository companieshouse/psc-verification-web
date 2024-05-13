module.exports = {
    roots: [
        "<rootDir>"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        "./src/**/*.ts"
    ],
    coveragePathIgnorePatterns: [
        "/src/bin/"
    ],
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: [
        "**/test/**/*.unit.[jt]s",
        "**/test/**/*.int.[jt]s"
    ],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { diagnostics: false }]
    },
    globalSetup: "./test/global.setup.ts",
    moduleNameMapper: {
        "^axios$": require.resolve("axios")
    }
};
