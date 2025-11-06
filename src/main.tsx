import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { registerSW } from './utils/pwa';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 注册 Service Worker
if (import.meta.env.PROD) {
  registerSW({
    onUpdateAvailable: (registration) => {
      console.log('发现新版本，即将更新...');
      // 可以在这里显示更新提示
      if (confirm('发现新版本，是否立即更新？')) {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
    onOfflineReady: () => {
      console.log('应用已准备好离线使用');
    },
  });
}
