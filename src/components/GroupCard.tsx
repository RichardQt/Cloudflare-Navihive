import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Site, Group } from '../API/http';
import SiteCard from './SiteCard';
import { GroupWithSites } from '../types';
import EditGroupDialog from './EditGroupDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Collapse,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// 更新组件属性接口
interface GroupCardProps {
  group: GroupWithSites;
  index?: number; // 用于Draggable的索引，仅在分组排序模式下需要
  sortMode: 'None' | 'GroupSort' | 'SiteSort';
  currentSortingGroupId: number | null;
  onUpdate: (updatedSite: Site) => void;
  onDelete: (siteId: number) => void;
  onSaveSiteOrder: (groupId: number, sites: Site[]) => void;
  onStartSiteSort: (groupId: number) => void;
  onAddSite?: (groupId: number) => void; // 新增添加卡片的可选回调函数
  onUpdateGroup?: (group: Group) => void; // 更新分组的回调函数
  onDeleteGroup?: (groupId: number) => void; // 删除分组的回调函数
  configs?: Record<string, string>; // 传入配置
  viewMode?: 'default' | 'compact';
}

const GroupCard: React.FC<GroupCardProps> = React.memo(({
  group,
  sortMode,
  currentSortingGroupId,
  onUpdate,
  onDelete,
  onSaveSiteOrder,
  onStartSiteSort,
  onAddSite,
  onUpdateGroup,
  onDeleteGroup,
  configs,
  viewMode = 'default',
}) => {
  const [sites, setSites] = useState<Site[]>(group.sites);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem(`group-${group.id}-collapsed`);
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    if (group.id) {
      localStorage.setItem(`group-${group.id}-collapsed`, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, group.id]);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev: boolean) => !prev);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSiteDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSites((prev) => {
      const oldIndex = prev.findIndex((site) => `site-${site.id}` === active.id);
      const newIndex = prev.findIndex((site) => `site-${site.id}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(prev, oldIndex, newIndex);
      }
      return prev;
    });
  }, []);

  const handleEditClick = useCallback(() => {
    setEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
  }, []);

  const handleUpdateGroup = useCallback((updatedGroup: Group) => {
    if (onUpdateGroup) {
      onUpdateGroup(updatedGroup);
      setEditDialogOpen(false);
    }
  }, [onUpdateGroup]);

  const handleDeleteGroup = useCallback((groupId: number) => {
    if (onDeleteGroup) {
      onDeleteGroup(groupId);
      setEditDialogOpen(false);
    }
  }, [onDeleteGroup]);

  const isCurrentEditingGroup = sortMode === 'SiteSort' && currentSortingGroupId === group.id;

  const sortableItems = useMemo(
    () => (isCurrentEditingGroup ? sites : group.sites).map((site) => `site-${site.id}`),
    [isCurrentEditingGroup, sites, group.sites]
  );

  // 渲染站点卡片区域
  const renderSites = () => {
    // 使用本地状态中的站点数据
    const sitesToRender = isCurrentEditingGroup ? sites : group.sites;

    // 如果当前不是正在编辑的分组且处于站点排序模式，不显示站点
    if (!isCurrentEditingGroup && sortMode === 'SiteSort') {
      return null;
    }

    // 如果是编辑模式，使用DndContext包装
    if (isCurrentEditingGroup) {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSiteDragEnd}
        >
          <SortableContext
            items={sortableItems}
            strategy={horizontalListSortingStrategy}
          >
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  margin: -1, // 抵消内部padding，确保边缘对齐
                }}
              >
                {sitesToRender.map((site, idx) => (
                  <Box
                    key={site.id || idx}
                    sx={{
                      width: {
                        xs: '50%',
                        sm: '50%',
                        md: '25%',
                        lg: '25%',
                        xl: '25%',
                      },
                      padding: 1, // 内部间距，更均匀的分布
                      boxSizing: 'border-box', // 确保padding不影响宽度计算
                    }}
                  >
                    <SiteCard
                      site={site}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      isEditMode={true}
                      index={idx}
                      iconApi={configs?.['site.iconApi']} // 传入iconApi配置
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </SortableContext>
        </DndContext>
      );
    }

    // 普通模式下的渲染
    const isCompact = viewMode === 'compact';
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: isCompact ? -0.5 : -1,
        }}
      >
        {sitesToRender.map((site) => (
          <Box
            key={site.id}
            sx={{
              width: isCompact
                ? { xs: '50%', sm: '33.33%', md: '20%', lg: '16.66%', xl: '12.5%' }
                : { xs: '100%', sm: '50%', md: '33.33%', lg: '25%', xl: '20%' },
              padding: isCompact ? 0.5 : 1,
              boxSizing: 'border-box',
            }}
          >
            <SiteCard
              site={site}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isEditMode={false}
              iconApi={configs?.['site.iconApi']}
              compact={isCompact}
            />
          </Box>
        ))}
      </Box>
    );
  };

  const handleSaveSiteOrder = useCallback(() => {
    onSaveSiteOrder(group.id!, sites);
  }, [onSaveSiteOrder, group.id, sites]);

  const handleSortClick = useCallback(() => {
    if (group.sites.length < 2) {
      setSnackbarMessage('至少需要2个站点才能进行排序');
      setSnackbarOpen(true);
      return;
    }
    setIsCollapsed(false);
    onStartSiteSort(group.id!);
  }, [group.sites.length, group.id, onStartSiteSort]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // 修改分组标题区域的渲染
  return (
    <Paper
      elevation={sortMode === 'None' ? 2 : 3}
      sx={{
        borderRadius: 4,
        p: { xs: 2, sm: 3 },
        transition: 'all 0.3s ease-in-out',
        border: '1px solid transparent',
        '&:hover': {
          boxShadow: sortMode === 'None' ? 6 : 3,
          borderColor: 'divider',
          transform: sortMode === 'None' ? 'scale(1.01)' : 'none',
        },
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Box
        display='flex'
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={2.5}
        gap={1}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              '& .collapse-icon': {
                color: 'primary.main',
              },
            },
          }}
          onClick={handleToggleCollapse}
        >
          <IconButton
            size='small'
            className='collapse-icon'
            sx={{
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
          <Typography
            variant='h5'
            component='h2'
            fontWeight='600'
            color='text.primary'
            sx={{ mb: { xs: 1, sm: 0 } }}
          >
            {group.name}
            <Typography component='span' variant='body2' color='text.secondary' sx={{ ml: 1 }}>
              ({group.sites.length})
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          {isCurrentEditingGroup ? (
            <Button
              variant='contained'
              color='primary'
              size='small'
              startIcon={<SaveIcon />}
              onClick={handleSaveSiteOrder}
              sx={{
                minWidth: 'auto',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              保存顺序
            </Button>
          ) : (
            sortMode === 'None' && (
              <>
                {onAddSite && (
                  <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    onClick={() => onAddSite(group.id!)}
                    startIcon={<AddIcon />}
                    sx={{
                      minWidth: 'auto',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    添加卡片
                  </Button>
                )}
                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  startIcon={<SortIcon />}
                  onClick={handleSortClick}
                  sx={{
                    minWidth: 'auto',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  排序
                </Button>

                {onUpdateGroup && onDeleteGroup && (
                  <Tooltip title='编辑分组'>
                    <IconButton
                      color='primary'
                      onClick={handleEditClick}
                      size='small'
                      sx={{ alignSelf: 'center' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )
          )}
        </Box>
      </Box>

      <Collapse in={!isCollapsed} timeout='auto' unmountOnExit>
        {renderSites()}
      </Collapse>

      {/* 编辑分组弹窗 */}
      {onUpdateGroup && onDeleteGroup && editDialogOpen && (
        <EditGroupDialog
          open={editDialogOpen}
          group={group}
          onClose={handleCloseEditDialog}
          onSave={handleUpdateGroup}
          onDelete={handleDeleteGroup}
        />
      )}

      {/* 提示消息 */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity='info' sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
});

export default GroupCard;
