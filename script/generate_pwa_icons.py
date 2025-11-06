"""
PWA 图标生成脚本
从 icon-1024.png 生成所需的各种尺寸的 PWA 图标
"""

from PIL import Image
import os

# 定义需要的图标尺寸
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# 定义路径
ICONS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'icons')
SOURCE_ICON = os.path.join(ICONS_DIR, 'icon-1024.png')

def generate_icons():
    """生成所有尺寸的图标"""
    
    # 检查源文件是否存在
    if not os.path.exists(SOURCE_ICON):
        print(f"❌ 错误: 找不到源图标文件 {SOURCE_ICON}")
        return
    
    print(f"📂 正在从 {SOURCE_ICON} 生成图标...")
    
    # 打开源图标
    try:
        img = Image.open(SOURCE_ICON)
        print(f"✅ 源图标尺寸: {img.size}")
    except Exception as e:
        print(f"❌ 无法打开源图标: {e}")
        return
    
    # 生成各个尺寸
    success_count = 0
    for size in SIZES:
        output_path = os.path.join(ICONS_DIR, f'icon-{size}x{size}.png')
        
        try:
            # 调整图片大小（使用高质量重采样）
            resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # 保存图片
            resized_img.save(output_path, 'PNG', optimize=True)
            
            print(f"✅ 生成: icon-{size}x{size}.png")
            success_count += 1
            
        except Exception as e:
            print(f"❌ 生成 {size}x{size} 失败: {e}")
    
    print(f"\n🎉 完成! 成功生成 {success_count}/{len(SIZES)} 个图标")
    print(f"📁 图标位置: {ICONS_DIR}")

if __name__ == '__main__':
    generate_icons()
