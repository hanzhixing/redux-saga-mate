module.exports = {
    "env": {
        "es6": true,
        "jest": true,
        "node": true,
        "browser": true,
    },
    "parser": "babel-eslint",
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "plugins": [
        "react",
        "jest",
    ],
    "rules": {
        "arrow-parens": ["error", "as-needed"],
        "no-console": ["warn", {allow: ["warn", "error"]}],
        "no-unused-vars": ["warn"],
        "no-shadow": ["warn"],
        "indent": ["error", 4, {"SwitchCase": 1}],
        "object-curly-spacing": ["error", "never"],
        "object-curly-newline": ["error", {"consistent": true}],
        "import/no-unresolved": ["off"],
        "import/prefer-default-export": ["off"],
        "import/no-extraneous-dependencies": ["off"],
        "react/react-in-jsx-scope": ["off"],
        "react/jsx-indent": ["error", 4],
        "react/prop-types": ["off"],
        "react/jsx-indent-props": ["error", 4],
        "react/jsx-boolean-value": ["off"],
        "react/no-array-index-key": ["off"],
        "react/jsx-props-no-spreading": ["off"],
    },
    "globals": {
        "ENV_PUBLIC_URL": "readonly",
    },
};
