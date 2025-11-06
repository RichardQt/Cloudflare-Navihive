# PWA 图标文件夹

此文件夹用于存放 PWA（Progressive Web App）所需的各种尺寸图标。

## 🚨 快速解决 404 错误

当前项目已包含一个 SVG 图标模板 (`icon.svg`)，但 PWA 需要 PNG 格式的图标。

### 临时解决方案（立即修复 404）

1. 访问 [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. 上传 `icon.svg` 文件
3. 点击生成并下载所有尺寸的图标
4. 将下载的图标文件解压到此文件夹

### 或者使用在线工具

访问 <https://realfavicongenerator.net/> 并上传 `icon.svg`。

## 需要的图标尺寸

请准备以下尺寸的图标文件（PNG 格式）：

- `icon-72x72.png` - 72x72 像素
- `icon-96x96.png` - 96x96 像素
- `icon-128x128.png` - 128x128 像素
- `icon-144x144.png` - 144x144 像素
- `icon-152x152.png` - 152x152 像素
- `icon-192x192.png` - 192x192 像素
- `icon-384x384.png` - 384x384 像素
- `icon-512x512.png` - 512x512 像素

## 图标设计要求

1. **背景颜色**：建议使用纯色背景（如白色或品牌色）
2. **图标内容**：应该在所有尺寸下都清晰可见
3. **安全区域**：建议图标主体内容保持在80%的安全区域内
4. **格式**：PNG 格式，支持透明背景

## 快速生成工具

你可以使用以下工具快速生成不同尺寸的图标：

1. **PWA Builder** - <https://www.pwabuilder.com/imageGenerator>
2. **Real Favicon Generator** - <https://realfavicongenerator.net/>
3. **Favicon.io** - <https://favicon.io/>

## 如何使用

1. 准备一个高分辨率的图标源文件（建议 1024x1024）
2. 使用上述工具生成所有尺寸
3. 将生成的图标文件放在此文件夹中
4. 确保文件名与 manifest.json 中的配置一致

## 注意事项

- 在部署前请确保所有尺寸的图标都已准备好
- 如果缺少某些尺寸，PWA 可能无法正常安装
- iOS 设备会使用 `icon-180x180.png` 作为主屏幕图标（可选添加）

## 开发时临时解决方案

如果你只想快速测试而不想生成所有图标，可以：

1. 创建一个 512x512 的图标
2. 将其复制并重命名为所有需要的尺寸
3. 虽然不是最优方案，但可以让 PWA 正常工作
