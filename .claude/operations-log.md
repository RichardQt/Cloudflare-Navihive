# 编码前检查 - 悬浮显示设置按钮优化

时间：2025-11-14 07:35:00

- [x] 已查阅上下文摘要文件：`.claude/context-summary-hover-settings-button.md`
- [x] 将使用以下可复用组件：
  - `SiteCard`（src/components/SiteCard.tsx）：复用图标与设置弹窗逻辑
  - `GroupCard`（src/components/GroupCard.tsx）：确保传入 `isEditMode` 行为兼容
- [x] 将遵循命名约定：组件 PascalCase、事件处理 `handleXxx`
- [x] 将遵循代码风格：TypeScript + MUI `sx`、尽量复用现有 `Box`/`Card` 样式
- [x] 确认不重复造轮子，已检查 `SiteCard`、`GroupCard`、`SiteSettingsModal`、`utils` 中无现成 hover 逻辑可直接复用

## 上下文充分性验证

1. 能否列出至少3个相似实现？是：`SiteCard.tsx`、`GroupCard.tsx`、`SiteSettingsModal.tsx`
2. 理解实现模式了吗？是：卡片组件通过 `sx` 控制 hover，`isEditMode` 切换行为
3. 知道可复用工具/类吗？是：`SiteCard` 状态与 `autoFetchFavicon` 等
4. 理解命名约定和代码风格吗？是：见上
5. 知道如何测试此功能吗？是：手动验证 hover/焦点与排序模式，暂无自动化
6. 确认没有重复造轮子吗？是：项目中无现成 hover 管控工具
7. 理解依赖与集成点吗？是：`SiteCard` 被 `GroupCard` 调用，依赖 `@mui/material`/`@dnd-kit`

## 实施计划

1. 在 `SiteCard` 的 `IconButton` 添加稳定类名（如 `site-card-settings-btn`），并将其样式默认设为 `opacity: 0`，仅在必要交互下显示。
2. 调整包裹 `Card`/`Box` 的 `sx`，使用局部选择器 `&:hover .site-card-settings-btn` 和 `&:focus-within .site-card-settings-btn` 只在当前卡片悬浮或聚焦时显示，同时保持移动端可点（保留 `pointerEvents`）。
3. 确保排序模式 (`isEditMode`) 下按钮保持隐藏（编辑模式 UI 中没有设置按钮），普通模式 hover 显示，与 `SiteSettingsModal` 交互逻辑保持不变。
4. 手动测试：普通模式 hover 单卡仅显示该按钮，鼠标移开隐藏；Tab 聚焦时按钮可见；在排序模式下按钮未出现；触摸设备点击 IconButton 仍可打开设置。
5. 若需要回归保证，在 `task_incremental_updates.md` 记录变更点（如已有流程）。

> 备注：`shrimp-task-manager` 工具在当前环境不可用，计划步骤由本地日志记录代替。

## 编码后声明 - 悬浮显示设置按钮优化

时间：2025-11-14 07:55:00

### 1. 复用了以下既有组件

- `SiteCard`：保留原有 `cardContent`、拖拽与设置弹窗逻辑，仅在 `sx` 中增加局部 hover 控制。
- `GroupCard`：继续作为 `SiteCard` 的调用方，无需额外改动但验证其渲染路径。

### 2. 遵循了以下项目约定

- 命名约定：新增类名 `site-card-settings-btn` 保持 kebab 风格，未引入中文命名。
- 代码风格：继续使用 `sx` 写法和扩展对象，注释保持最小化。
- 文件组织：仅修改 `src/components/SiteCard.tsx`，未引入新文件。

### 3. 对比了以下相似实现

- 对比 `SiteCard` 原本 hover 逻辑：由 `'div:hover &'` 改为 `Card` 内局部 `&:hover .site-card-settings-btn`，只作用于当前卡片，避免全局触发。
- 对比 `GroupCard` 内站点排序视图：确认编辑模式下没有 IconButton，无需额外逻辑差异。

### 4. 未重复造轮子的证明

- 已检查 `SiteCard`、`GroupCard`、`SiteSettingsModal`、`utils`；项目内无通用 hover 控制工具，因此直接在 `sx` 中精细化选择器是最小改动方案。

### 验证记录

- 计划执行 `pnpm run build` 以确认编译通过，但终端交互被用户侧跳过，未能运行；需要用户后续在本地执行 `pnpm run build` 完成验证。
