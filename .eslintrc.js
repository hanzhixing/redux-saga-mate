module.exports = {
    "extends": [
        "react-app",
        "eslint:recommended",
        "airbnb",
        "plugin:prettier/recommended",
    ],
    "plugins": [
        "react",
        "prettier"
    ],
    "rules": {
        "prettier/prettier": ["off"],
        "no-console": ["off"],
        "no-unused-vars": ["off"],
        "no-shadow": ["off"],
        "indent": ["error", 4, {"SwitchCase": 1}],
        "import/no-unresolved": ["off"],
        "import/prefer-default-export": ["off"],
        "import/no-extraneous-dependencies": ["off"],
        "react/react-in-jsx-scope": ["off"],
        "react/jsx-indent": ["error", 4],
        "react/prop-types": ["off"],
        "react/jsx-indent-props": ["error", 4],
        "react/jsx-boolean-value": ["off"],
        "react/no-array-index-key": ["off"],
    },
    "globals": {
        "ENV_PUBLIC_URL": "readonly",
    },
};
