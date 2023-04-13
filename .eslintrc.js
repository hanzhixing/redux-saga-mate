module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        quotes: ['error', 'single'],
        'max-len': ['error', {code: 120}],
        'no-magic-numbers': ['off'],
    },
};
