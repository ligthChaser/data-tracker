import ts from 'rollup-plugin-typescript2'
import path from 'path'
import dts from 'rollup-plugin-dts';
export default [
    {
        //入口文件
        input: "./src/core/index.ts",
        output: [
            //打包esModule
            {
                file:'./dist/index.esm.js',
                format: "es"
            },
            // //打包common js
            {
                file:'./dist/index.cjs.js',
                format: "cjs"
            },
            // //打包 AMD CMD UMD
            {
                input: "./src/core/index.ts",
                file: './dist/index.js',
                format: "umd",
                name: "tracker"
            }
    
        ],
        //配置ts
        plugins: [
            ts(),
        ]
    
    }, 
{
    //打包声明文件
    input: "./src/core/index.ts",
    output:{
        file: './dist/index.d.ts',
        format: "es",
    },
    plugins: [dts()]
}] 