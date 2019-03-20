/* global process, module */
module.exports = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        ['babel-plugin-transform-builtin-extend', {globals: ['Error', 'Array'], approximate: true}],
        'babel-plugin-react-require',
        'react-hot-loader/babel',
    ],
    env: {
	    test: {
		    plugins: [
                'babel-plugin-transform-es2015-modules-commonjs',
            ],
	    },
    },
}
