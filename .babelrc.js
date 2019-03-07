/* global process, module */
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                "modules": false,
            }
        ],
        '@babel/preset-react',
    ],
    plugins: [
        '@babel/plugin-transform-parameters',
        '@babel/plugin-transform-destructuring',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-async-to-generator',
        ['babel-plugin-transform-builtin-extend', {globals: ['Error', 'Array'], approximate: true}],
        'babel-plugin-react-require',
    ],
    env: {
	    test: {
		    plugins: ['transform-es2015-modules-commonjs'],
	    },
    },
}
