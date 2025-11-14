/**
 * 图标缓存和懒加载工具
 */

// 内存缓存
const iconCache = new Map<string, string>();

// IndexedDB 数据库名称
const DB_NAME = 'NaviHiveIconCache';
const DB_VERSION = 1;
const STORE_NAME = 'icons';

/**
 * 初始化 IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * 从 IndexedDB 获取缓存的图标
 */
async function getCachedIcon(url: string): Promise<string | null> {
  // 先检查内存缓存
  if (iconCache.has(url)) {
    return iconCache.get(url)!;
  }

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.dataUrl) {
          // 检查是否过期（7天）
          const now = Date.now();
          const cacheAge = now - result.timestamp;
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天

          if (cacheAge < maxAge) {
            // 存入内存缓存
            iconCache.set(url, result.dataUrl);
            resolve(result.dataUrl);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('获取缓存图标失败:', error);
    return null;
  }
}

/**
 * 保存图标到 IndexedDB
 */
async function cacheIcon(url: string, dataUrl: string): Promise<void> {
  // 保存到内存缓存
  iconCache.set(url, dataUrl);

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const data = {
        url,
        dataUrl,
        timestamp: Date.now(),
      };
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('缓存图标失败:', error);
  }
}

/**
 * 清除过期的图标缓存
 */
export async function cleanExpiredIconCache(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天

    const request = index.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const data = cursor.value;
        const cacheAge = now - data.timestamp;
        if (cacheAge > maxAge) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  } catch (error) {
    console.error('清除过期缓存失败:', error);
  }
}

/**
 * 获取图标（带缓存）
 */
export async function getIconWithCache(url: string): Promise<string> {
  // 先尝试从缓存获取
  const cached = await getCachedIcon(url);
  if (cached) {
    return cached;
  }

  // 缓存未命中，加载图标
  return new Promise((resolve, reject) => {
    const tryLoad = (enableAnonymous: boolean) => {
      const img = new Image();

      if (enableAnonymous) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        if (!enableAnonymous) {
          // 非匿名模式下无法做 canvas 缓存，直接返回 URL
          resolve(url);
          return;
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            cacheIcon(url, dataUrl);
            resolve(dataUrl);
          } else {
            resolve(url);
          }
        } catch (error) {
          console.warn('图标转换失败，使用原URL:', error);
          resolve(url);
        }
      };

      img.onerror = () => {
        if (enableAnonymous) {
          console.warn('匿名加载图标失败，尝试非跨域模式');
          tryLoad(false);
          return;
        }
        reject(new Error('图标加载失败'));
      };

      img.src = url;
    };

    tryLoad(true);
  });
}

/**
 * 提取域名
 */
export function extractDomain(url: string): string | null {
  if (!url) return null;

  try {
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'http://' + url;
    }
    const parsedUrl = new URL(fullUrl);
    return parsedUrl.hostname;
  } catch {
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
    return match && match[1] ? match[1] : null;
  }
}

/**
 * 自动获取网站 favicon
 */
export async function autoFetchFavicon(
  siteUrl: string,
  iconApiTemplate: string = 'https://www.faviconextractor.com/favicon/{domain}?larger=true'
): Promise<string | null> {
  const domain = extractDomain(siteUrl);
  if (!domain) {
    return null;
  }

  const ensureProtocol = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const normalizedSiteUrl = ensureProtocol(siteUrl);
  const candidates: string[] = [];

  if (iconApiTemplate) {
    const hasPlaceholder = iconApiTemplate.includes('{domain}');
    const templateUrl = hasPlaceholder
      ? iconApiTemplate.replace('{domain}', domain)
      : iconApiTemplate;
    candidates.push(templateUrl);
  }

  candidates.push(`https://${domain}/favicon.ico`);
  candidates.push(`http://${domain}/favicon.ico`);
  candidates.push(
    `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(normalizedSiteUrl)}`
  );

  const uniqueCandidates = Array.from(new Set(candidates));

  for (const iconUrl of uniqueCandidates) {
    try {
      const favicon = await getIconWithCache(iconUrl);
      if (favicon) {
        return favicon;
      }
    } catch (error) {
      console.warn(`自动获取 favicon 失败: ${iconUrl}`, error);
    }
  }

  return null;
}

/**
 * 清除所有图标缓存
 */
export async function clearAllIconCache(): Promise<void> {
  // 清除内存缓存
  iconCache.clear();

  // 清除 IndexedDB
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (error) {
    console.error('清除图标缓存失败:', error);
  }
}

/**
 * 获取缓存统计信息
 */
export async function getIconCacheStats(): Promise<{
  count: number;
  memoryCount: number;
}> {
  const memoryCount = iconCache.size;

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve({
          count: request.result,
          memoryCount,
        });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return { count: 0, memoryCount };
  }
}
