// PWA Service Worker 注册工具

export interface PWAUpdateCallback {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onUpdateInstalled?: () => void;
  onOfflineReady?: () => void;
}

/**
 * 注册 Service Worker
 */
export async function registerSW(
  callbacks?: PWAUpdateCallback
): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker 注册成功:', registration.scope);

      // 检查更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('新版本可用，等待激活');
              callbacks?.onUpdateAvailable?.(registration);
            } else {
              // 首次安装完成
              console.log('离线功能已就绪');
              callbacks?.onOfflineReady?.();
            }
          }

          if (newWorker.state === 'activated') {
            console.log('新版本已激活');
            callbacks?.onUpdateInstalled?.();
          }
        });
      });

      // 定期检查更新（每小时）
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000
      );

      return registration;
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
      return undefined;
    }
  } else {
    console.log('当前浏览器不支持 Service Worker');
    return undefined;
  }
}

/**
 * 卸载 Service Worker
 */
export async function unregisterSW(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const success = await registration.unregister();
        console.log('Service Worker 卸载成功');
        return success;
      }
    } catch (error) {
      console.error('Service Worker 卸载失败:', error);
    }
  }
  return false;
}

/**
 * 跳过等待，立即激活新版本
 */
export function skipWaiting(registration: ServiceWorkerRegistration): void {
  const waitingWorker = registration.waiting;
  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * 清除所有缓存
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log('所有缓存已清除');
  }
}

/**
 * 获取缓存大小（估算）
 */
export async function getCacheSize(): Promise<number> {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('获取缓存大小失败:', error);
      return 0;
    }
  }
  return 0;
}

/**
 * 检测是否通过 PWA 模式打开
 */
export function isPWAMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * 监听 PWA 安装提示
 */
export function setupInstallPrompt(onInstallPrompt?: (event: Event) => void): () => void {
  const handler = (e: Event) => {
    // 阻止默认的安装提示
    e.preventDefault();
    // 存储事件供后续使用
    (window as any).deferredPrompt = e;

    if (onInstallPrompt) {
      onInstallPrompt(e);
    }
  };

  window.addEventListener('beforeinstallprompt', handler);

  // 返回清理函数
  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
}

/**
 * 显示安装提示
 */
export async function showInstallPrompt(): Promise<boolean> {
  const deferredPrompt = (window as any).deferredPrompt;

  if (!deferredPrompt) {
    console.log('没有可用的安装提示');
    return false;
  }

  // 显示安装提示
  deferredPrompt.prompt();

  // 等待用户响应
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`用户选择: ${outcome}`);

  // 清除 prompt
  (window as any).deferredPrompt = null;

  return outcome === 'accepted';
}
