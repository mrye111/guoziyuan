import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    proxy: {
      // 本地开发时把 API 和上传文件代理到线上服务器
      '/api': { target: 'http://101.35.250.122', changeOrigin: false, headers: { host: 'guoziyuan.cn' } },
      '/memes/uploads': { target: 'http://101.35.250.122', changeOrigin: false, headers: { host: 'guoziyuan.cn' } },
    },
  },
});
