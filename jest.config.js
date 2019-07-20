module.exports = {
    verbose: true,
    setupFiles: [
        '<rootDir>/node_modules/regenerator-runtime/runtime',
        '<rootDir>/setupFile.js',
    ],
    setupFilesAfterEnv: [
        '@testing-library/react/cleanup-after-each',
    ],
};
