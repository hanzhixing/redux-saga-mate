module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [
        'jest-extended',
        '<rootDir>/node_modules/regenerator-runtime/runtime',
        '<rootDir>/setupFile.js',
    ],
    verbose: true,
};
