module.exports = {
    verbose: true,
    setupFilesAfterEnv: ['jest-extended'],
    setupFiles: [
        '<rootDir>/node_modules/regenerator-runtime/runtime',
        '<rootDir>/setupFile.js',
    ],
};
