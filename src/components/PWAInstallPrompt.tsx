import { useState, useEffect } from 'react';
import { Snackbar, Alert, Button, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { isPWAMode } from '../utils/pwa';

/**
 * PWA 安装提示组件
 */
const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 如果已经是 PWA 模式，不显示提示
    if (isPWAMode()) {
      return;
    }

    // 检查是否已经显示过提示
    const hasShownPrompt = localStorage.getItem('pwa-prompt-shown');
    if (hasShownPrompt) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // 延迟3秒显示提示，避免打扰用户
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // 显示安装提示
    deferredPrompt.prompt();

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA 安装结果: ${outcome}`);

    // 清除 prompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    // 标记已显示过提示
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  const handleClose = () => {
    setShowPrompt(false);
    // 标记已显示过提示
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 70, sm: 24 } }}
    >
      <Alert
        severity='info'
        variant='filled'
        icon={<InstallMobileIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color='inherit'
              size='small'
              onClick={handleInstall}
              sx={{ fontWeight: 'bold' }}
            >
              安装
            </Button>
            <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        }
        sx={{ width: '100%', maxWidth: 600 }}
      >
        将 NaviHive 添加到主屏幕，获得更好的使用体验！
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
