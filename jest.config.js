module.exports = {
    roots: ["<rootDir>"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    collectCoverage: true,
    coveragePathIgnorePatterns: ["/src/bin/"],
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: ["**/test/**/*.unit.[jt]s"],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { diagnostics: false }]
    },
    globalSetup: "./test/global.setup.ts",
    moduleNameMapper: {
        "^axios$": require.resolve("axios")
    },
    testTimeout: 10000, // Set the timeout to 10 seconds (or any other appropriate value)
    setupFilesAfterEnv: ["<rootDir>/test/mocks/allMiddleware.mock.ts"]
};
