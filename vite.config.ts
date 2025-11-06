import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from '@cloudflare/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    host: true, // 允许通过 IP 地址访问
    port: 5173, // 默认端口
  },
});
