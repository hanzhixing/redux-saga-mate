/* global process, module */
const presets = [
    '@babel/preset-env',
    '@babel/preset-react',
];

const plugins = [
    '@babel/plugin-syntax-dynamic-import',
    [
        'babel-plugin-transform-builtin-extend',
        {globals: ['Error', 'Array'], approximate: true},
    ],
    'babel-plugin-react-require',
    'react-hot-loader/babel',
];

module.exports = {
    presets,
    env: {
        development: {
            plugins,
        },
        production: {
            plugins,
        },
	    test: {
            plugins,
	    },
        rollup: {
            plugins: [],
        }
    },
}
