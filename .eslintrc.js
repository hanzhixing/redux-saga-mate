module.exports = {
    "env": {
        "jest": true,
    },
    "parser": "babel-eslint",
    "extends": [
        "eslint:recommended",
        "airbnb",
    ],
    "plugins": [
        "react",
        "jest",
    ],
    "rules": {
        "no-console": ["warn", {allow: ["warn", "error"]}],
        "no-unused-vars": ["warn"],
        "no-shadow": ["warn"],
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
        "object-curly-spacing": ["error", "never"],
        "object-curly-newline": ["error", {"consistent": true}],
        "arrow-parens": ["error", "as-needed"],
        "react/jsx-props-no-spreading": ["off"],
        "jsx-a11y/control-has-associated-label": ["off"],
    },
    "globals": {
        "ENV_PUBLIC_URL": "readonly",
    },
};
