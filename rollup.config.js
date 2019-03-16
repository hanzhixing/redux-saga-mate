import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import {uglify} from 'rollup-plugin-uglify';
import ignore from 'rollup-plugin-ignore';

const productionConfig = {
    input: 'src/index.js',
    output: {
        file: 'dist/umd/redux-saga-mate.min.js',
        format: 'umd',
        name: 'ReduxSagaMate',
        sourcemap: true,
    },
    plugins: [
        ignore(['prop-types']),
        babel(),
        commonjs({ exclude: 'src/**' }),
        nodeResolve({
            extensions: ['.mjs', '.js', '.jsx', '.json'],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        uglify(),
    ],
    external: ['react'],
};

export default [productionConfig];
