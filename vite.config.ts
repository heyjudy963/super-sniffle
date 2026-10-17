import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 相对资源路径同时兼容 GitHub Pages 的仓库子路径和本地预览。
  base: './',
  plugins: [react()],
});
