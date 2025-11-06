import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface LazyBackgroundProps {
  imageUrl: string;
  opacity: number;
  darkMode: boolean;
}

/**
 * 背景图懒加载组件
 */
const LazyBackground: React.FC<LazyBackgroundProps> = ({ imageUrl, opacity, darkMode }) => {
  const [loaded, setLoaded] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setLoaded(false);
      setImageData(null);
      return;
    }

    // 创建 Image 对象预加载
    const img = new Image();

    img.onload = () => {
      setImageData(imageUrl);
      setLoaded(true);
    };

    img.onerror = () => {
      console.error('背景图加载失败:', imageUrl);
      setLoaded(false);
      setImageData(null);
    };

    // 开始加载
    img.src = imageUrl;

    // 清理函数
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  if (!imageData) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: loaded ? `url(${imageData})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        zIndex: 0,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        // 移动端优化：防止滚动时背景抖动
        '@media (max-width: 600px)': {
          position: 'absolute',
          minHeight: '100vh',
          backgroundAttachment: 'scroll',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: darkMode
            ? `rgba(0, 0, 0, ${1 - opacity})`
            : `rgba(255, 255, 255, ${1 - opacity})`,
          zIndex: 1,
        },
      }}
    />
  );
};

export default LazyBackground;
