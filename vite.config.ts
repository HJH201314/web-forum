import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import sassDts from 'vite-plugin-sass-dts';
import vueJsx from '@vitejs/plugin-vue-jsx';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    sassDts({
      enabledMode: ['development', 'production'],
      global: {
        generate: true,
        outputFilePath: path.resolve(__dirname, './src/style.d.ts'),
      },
      sourceDir: path.resolve(__dirname, './src'),
      outputDir: path.resolve(__dirname, './dist'),
    }),
    // basicSsl(),
  ],
  css: {
    // 对css的行为进行配置
    // modules配置最终会丢给postcss modules
    modules: {
      // 是对css模块化的默认行为进行覆盖
      localsConvention: 'camelCase', // 修改生成的配置对象的key的展示形式(驼峰还是中划线形式)
      scopeBehaviour: 'local', // 配置当前的模块化行为是模块化还是全局化 (有hash就是开启了模块化的一个标志, 因为他可以保证产生不同的hash值来控制我们的样式类名不被覆盖)
      generateScopedName: '[name]_[local]_[hash:5]', // 配置生成的类名的格式
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8765,
    proxy: {
      // 修改target，指向相应模块需要请求的服务端/Mock地址
      '/api/security': {
        target: 'http://172.29.16.37:8848/',
        // target: 'http://127.0.0.1:4523/m1/3578335-0-default/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/security/, ''),
      },
      '/api/manage': {
        target: 'http://172.29.16.37:8849/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/manage/, ''),
      },
      '/api/admin': {
        target: 'http://172.29.16.37:8850/',
        // target: 'http://127.0.0.1:4523/m1/3578335-0-b56c7805/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin/, ''),
      },
      '/api/comment': {
        target: 'http://172.29.16.37:8851/',
        // target: 'http://127.0.0.1:4523/m1/3578335-0-a03db424/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/comment/, ''),
      },
      '/api/star': {
        target: 'http://172.29.16.37:8852/',
        // target: 'http://127.0.0.1:4523/m1/3578335-0-0c83f97b/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/star/, ''),
      },
      '/api/minio': {
        target: 'http://172.29.16.37:9000/',
        // target: 'http://127.0.0.1:4523/m1/3578335-0-0c83f97b/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/minio/, ''),
      },
    },
  },
});
