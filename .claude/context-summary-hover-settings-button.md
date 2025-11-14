# 项目上下文摘要（悬浮显示设置按钮优化）

生成时间：2025-11-14 07:30:00

## 1. 相似实现分析

- **实现1**: src/components/SiteCard.tsx:1-360

  - 模式：React + MUI 卡片组件，依靠 `useState` 控制设置弹窗，`IconButton` 通过 `sx` 实现悬浮显隐，排序模式下配合 `@dnd-kit`。
  - 可复用：图标加载 Skeleton + Fade、`handleSettingsClick`/`handleCloseSettings`、`cardContent` 结构抽离。
  - 需注意：`IconButton` 使用 `'div:hover &'` 选择器导致任意祖先 div 悬浮都会触发，可能带来所有卡片同步显示的问题。

- **实现2**: src/components/GroupCard.tsx:1-360
  - 模式：分组容器组件，利用 `DndContext`/`SortableContext` 提供站点排序，并批量渲染 `SiteCard`。
  - 可复用：`renderSites` 中 `Box` 布局断点、排序状态判断、`isCurrentEditingGroup` 控制是否传 `isEditMode`。
  - 需注意：普通模式下 `SiteCard` 默认 `isEditMode=false`，因此 hover 行为只来自 `SiteCard` 自身；任何全局样式都可能通过这里的容器影响所有子卡片。

- **实现3**: src/components/SiteSettingsModal.tsx:1-260
  - 模式：MUI Dialog 作为站点设置面板，整合 `TextField`、`Select`、`autoFetchFavicon`。
  - 可复用：表单状态管理、`iconPreview` 逻辑、`autoFetchFavicon` 调用。
  - 需注意：`SiteCard` 中 `showSettings` 控制弹窗显隐，逻辑解耦，修改显示按钮时需保持状态管理不变。

## 2. 项目约定

- **命名约定**: 组件使用 PascalCase（`SiteCard`）、函数/变量使用 camelCase；接口来自 `types.ts`/`API`。
- **文件组织**: 视图组件位于 `src/components`，API 与类型在 `src/API`、`src/types.ts`，静态样式在 `App.css`/`index.css`。
- **导入顺序**: 先 React hooks，再本地类型/组件，再第三方库（MUI、dnd-kit），最后图标。
- **代码风格**: TypeScript + JSX，MUI `sx` 做样式，注释使用中文，函数式组件偏好 `memo`。

## 3. 可复用组件清单

- `src/components/SiteCard.tsx`: 单个站点卡片渲染和设置弹窗控制。
- `src/components/GroupCard.tsx`: 分组容器及排序入口，可提供 `isEditMode` 状态来源。
- `src/utils/iconCache.ts`: `autoFetchFavicon` 帮助函数，相关设置面板已使用。

## 4. 测试策略

- **测试框架**: 项目中未发现 `*.test.tsx` 或 `*.spec.tsx` 文件，暂无自动化测试。
- **测试模式**: 需新增或通过手动回归验证关键交互。
- **参考文件**: 无直接可参考测试文件。
- **覆盖要求**: 需手动验证 hover 显示逻辑、排序模式下按钮仍可访问。

## 5. 依赖和集成点

- **外部依赖**: `@mui/material`, `@mui/icons-material`, `@dnd-kit/sortable`, `@dnd-kit/core`。
- **内部依赖**: `SiteCard` → `SiteSettingsModal`、`GroupCard` → `SiteCard`、`autoFetchFavicon`。
- **集成方式**: `SiteCard` 在多处被 `GroupCard` 调用，设置按钮影响 `SiteSettingsModal` 打开。
- **配置来源**: `GroupCard` 可将 `configs?.['site.iconApi']` 传入 `SiteCard`。

## 6. 技术选型理由

- **为什么用这个方案**: MUI `IconButton` + `sx` 提供一致主题，`@dnd-kit` 满足拖拽需求。
- **优势**: 组件化清晰，`sx` 写法可针对具体元素定制 hover/transition。
- **劣势和风险**: 当前 `sx` 中通配选择器造成所有卡片按钮同步显示，易出现交互混乱。

## 7. 关键风险点

- **并发问题**: 无显著并发，主要是多个 `SiteCard` 同时渲染。
- **边界条件**: `isEditMode`、`icon` 缺失、`site.url` 为空等需保持原有处理。
- **性能瓶颈**: 多个 `SiteCard` 同时渲染 hover 状态可能触发额外 re-render，需保持 `memo`。
- **安全考虑**: 未涉及敏感逻辑，但应避免额外 window 操作导致阻塞。
