module.exports = {
    verbose: true,
    setupFiles: [
        '<rootDir>/node_modules/regenerator-runtime/runtime',
        '<rootDir>/setupFile.js',
    ],
    setupFilesAfterEnv: [
        'react-testing-library/cleanup-after-each',
    ],
};
