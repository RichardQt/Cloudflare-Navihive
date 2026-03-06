import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  Chip,
  Modal,
  Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { GroupWithSites } from '../types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  groups: GroupWithSites[];
}

interface SearchResult {
  site: {
    id?: number;
    name: string;
    url: string;
    icon?: string;
    description?: string;
  };
  groupName: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, groups }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matched: SearchResult[] = [];
    for (const group of groups) {
      for (const site of group.sites) {
        if (
          site.name.toLowerCase().includes(q) ||
          site.url.toLowerCase().includes(q) ||
          site.description?.toLowerCase().includes(q)
        ) {
          matched.push({ site, groupName: group.name });
        }
      }
    }
    return matched.slice(0, 20);
  }, [query, groups]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const scrollToItem = useCallback((index: number) => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[index] as HTMLElement;
    if (!item) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      item.scrollIntoView({ block: 'nearest' });
    } else if (itemRect.bottom > listRect.bottom) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const openSite = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.min(prev + 1, results.length - 1);
          scrollToItem(next);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          scrollToItem(next);
          return next;
        });
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        openSite(results[selectedIndex].url);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [results, selectedIndex, scrollToItem, openSite, onClose]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'fixed',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 'calc(100% - 32px)', sm: 520, md: 580 },
            maxWidth: '100%',
            outline: 'none',
          }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '60vh',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* 搜索输入框 - 固定在顶部 */}
            <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                placeholder='搜索站点名称、URL 或描述...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete='off'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                }}
              />
            </Box>

            {/* 搜索结果列表 - 可滚动区域 */}
            <Box
              ref={listRef}
              sx={{
                overflowY: 'auto',
                overflowX: 'hidden',
                flexGrow: 1,
                flexShrink: 1,
                minHeight: 0,
                px: 1,
                pb: 1,
              }}
            >
              {query.trim() && results.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant='body2'>没有找到匹配的站点</Typography>
                </Box>
              )}

              {results.map((result, index) => (
                <Box
                  key={result.site.id || index}
                  onClick={() => openSite(result.site.url)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.2,
                    mx: 0.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                    bgcolor:
                      index === selectedIndex
                        ? (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(0,0,0,0.06)'
                        : 'transparent',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  {/* 站点图标 */}
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                    }}
                  >
                    {result.site.icon ? (
                      <img
                        src={result.site.icon}
                        alt=''
                        style={{ width: 20, height: 20, objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <OpenInNewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    )}
                  </Box>

                  {/* 站点信息 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='body2'
                      fontWeight={500}
                      noWrap
                      sx={{ lineHeight: 1.3 }}
                    >
                      {result.site.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      noWrap
                      component='div'
                    >
                      {result.site.url}
                    </Typography>
                  </Box>

                  {/* 分组标签 */}
                  <Chip
                    label={result.groupName}
                    size='small'
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      flexShrink: 0,
                    }}
                  />

                  {/* 打开图标 */}
                  {index === selectedIndex && (
                    <OpenInNewIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                  )}
                </Box>
              ))}
            </Box>

            {/* 底部提示 - 固定在底部，不会被遮挡 */}
            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <KeyboardArrowUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <KeyboardArrowDownIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant='caption' color='text.secondary'>
                    导航
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <KeyboardReturnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant='caption' color='text.secondary'>
                    打开
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <CloseIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant='caption' color='text.secondary'>
                    ESC 关闭
                  </Typography>
                </Box>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {results.length > 0
                  ? `${results.length} 个结果`
                  : query.trim()
                    ? '无结果'
                    : '输入关键词搜索'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CommandPalette;
