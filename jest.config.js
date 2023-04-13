module.exports = {
    verbose: true,
    preset: 'ts-jest',
    setupFilesAfterEnv: [
        'jest-extended/all',
        // '<rootDir>/node_modules/regenerator-runtime/runtime',
        // '<rootDir>/setupFile.js',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/dist',
        '<rootDir>/examples',
    ],
};
