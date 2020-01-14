import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import autoexternal from 'rollup-plugin-auto-external';
import commonjs from '@rollup/plugin-commonjs';
import replace from 'rollup-plugin-replace';
// import {terser} from 'rollup-plugin-terser';
// import ignore from 'rollup-plugin-ignore';
import pkg from './package.json';

process.env.BABEL_ENV = 'rollup';

export default [
    // {
    //     input: 'src/index.js',
    //     output: {
    //         file: 'dist/umd/redux-saga-mate.min.js',
    //         format: 'umd',
    //         name: 'ReduxSagaMate',
    //         sourcemap: true,
    //     },
    //     plugins: [
    //         replace({'process.env.NODE_ENV': JSON.stringify('production')}),
    //         babel(),
    //         resolve({browser: true}),
    //         commonjs(),
    //         terser(),
    //     ],
    // },
    {
        input: 'src/index.js',
        external: ['react', 'recompose', 'is-plain-object', 'redux-saga', 'reselect'],
        output: [
            {file: pkg.main, format: 'cjs'},
            {file: pkg.module, format: 'es'},
        ],
        plugins: [
            autoexternal(),
            replace({'process.env.NODE_ENV': JSON.stringify('production')}),
            babel({
                exclude: /node_modules/,
            }),
            resolve({
                extensions: ['.mjs', '.js', '.jsx', '.json'],
            }),
            commonjs(),
        ],
    },
];
