# PWA 和性能优化说明

本文档记录了项目中实现的 PWA 支持和性能优化功能。

## 🚀 已实现的优化

### 1. PWA（渐进式 Web 应用）支持

#### 功能特性

- ✅ 支持添加到主屏幕
- ✅ 离线访问支持
- ✅ 自动更新检测
- ✅ 图标和启动画面配置
- ✅ 智能安装提示

#### 相关文件

- `public/manifest.json` - PWA 应用清单
- `public/sw.js` - Service Worker 脚本
- `src/utils/pwa.ts` - PWA 工具函数
- `src/components/PWAInstallPrompt.tsx` - 安装提示组件

#### 使用方法

应用会在生产环境自动注册 Service Worker。用户访问网站3秒后，如果浏览器支持且未安装，会显示安装提示。

#### 缓存策略

- **API 请求**：网络优先，失败时使用缓存
- **图片资源**：缓存优先，未命中时从网络加载
- **静态资源**：缓存优先，网络回退

### 2. 图标缓存优化

#### 功能特性

- ✅ 两级缓存（内存 + IndexedDB）
- ✅ 自动清理过期缓存（7天）
- ✅ 图标预加载和缓存
- ✅ 缓存统计功能

#### 相关文件

- `src/utils/iconCache.ts` - 图标缓存工具

#### 工作原理

1. 首次加载图标时，转换为 Data URL 并存储到 IndexedDB
2. 后续访问直接从缓存读取，无需网络请求
3. 每7天自动清理过期缓存
4. 使用内存缓存加速频繁访问的图标

### 3. 背景图懒加载

#### 功能特性

- ✅ 图片预加载
- ✅ 平滑淡入动画
- ✅ 加载失败处理
- ✅ 移动端优化

#### 相关文件

- `src/components/LazyBackground.tsx` - 背景图懒加载组件

#### 工作原理

使用 Image 对象预加载背景图，加载完成后才显示，避免图片闪烁和布局抖动。

### 4. 自动获取网站 Favicon

#### 功能特性

- ✅ 创建站点时自动获取图标
- ✅ 保留手动获取按钮
- ✅ 图标自动缓存
- ✅ 失败后支持手动输入

#### 使用位置

- 新增站点时自动获取
- 站点设置中手动获取（点击魔棒图标）

## 📱 PWA 安装指南

### Android 设备

1. 使用 Chrome 浏览器访问网站
2. 等待安装提示弹出
3. 点击"安装"按钮
4. 应用图标将添加到主屏幕

### iOS 设备

1. 使用 Safari 浏览器访问网站
2. 点击分享按钮
3. 选择"添加到主屏幕"
4. 点击"添加"

### 桌面浏览器

1. 访问网站后，地址栏会显示安装图标
2. 点击安装图标
3. 确认安装

## 🔧 开发调试

### 查看 Service Worker 状态

1. 打开 Chrome DevTools
2. 切换到 "Application" 标签
3. 左侧菜单选择 "Service Workers"

### 清除缓存

```javascript
// 在浏览器控制台运行
// 清除所有缓存
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name));
});

// 清除图标缓存
import { clearAllIconCache } from './utils/iconCache';
clearAllIconCache();
```

### 测试 PWA

1. 构建生产版本：`pnpm build`
2. 本地预览：`pnpm preview`
3. 使用 Lighthouse 测试 PWA 评分

## 📊 性能指标

### 预期提升

- **首屏加载**：背景图懒加载减少初始加载时间
- **图标加载**：缓存机制减少 90% 的图标网络请求
- **离线访问**：Service Worker 支持离线浏览
- **安装应用**：PWA 提供类原生应用体验

### 监控建议

使用 Chrome DevTools 的 Performance 和 Network 面板监控实际性能。

## ⚙️ 配置选项

### 修改图标 API

在"网站设置"中可以配置图标获取 API：

```
https://www.faviconextractor.com/favicon/{domain}?larger=true
```

### 修改缓存时长

在 `src/utils/iconCache.ts` 中修改：

```typescript
const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
```

### 修改 Service Worker 缓存策略

在 `public/sw.js` 中修改缓存逻辑。

## 🐛 常见问题

### Q: Service Worker 更新不生效

A: 清除浏览器缓存，或在 DevTools 中点击 "Update on reload"。

### Q: 图标缓存占用空间过大

A: 调用 `cleanExpiredIconCache()` 清理过期缓存。

### Q: PWA 安装提示不显示

A: 确保使用 HTTPS 协议，且浏览器支持 PWA。

### Q: 背景图加载失败

A: 检查图片 URL 是否正确，确保支持 CORS。

## 📝 注意事项

1. **HTTPS 要求**：PWA 必须在 HTTPS 下运行（localhost 除外）
2. **图标准备**：部署前准备好所有尺寸的 PWA 图标
3. **浏览器兼容**：Service Worker 在旧版浏览器中不支持
4. **缓存管理**：定期监控缓存使用情况

## 🔄 后续优化建议

1. 添加推送通知支持
2. 实现更智能的缓存策略
3. 添加网络状态检测
4. 优化图标压缩算法
5. 支持图标备用方案

## 📚 参考资料

- [PWA 最佳实践](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
- [Web App Manifest](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)
