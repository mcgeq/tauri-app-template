<div align="center">

# Tauri 模板

[English](./README.md) | 简体中文

[![Tauri](https://img.shields.io/badge/Tauri-2.11-24C8DB?logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

基于 Tauri v2 + React 19 + TypeScript + shadcn/ui 和 Rust + axum + PostgreSQL 的全栈模板，Windows 优先桌面端应用，并提供 Android 开发支持。

</div>

## 截图

### 桌面端

| 亮色模式 | 暗色模式 |
|---|---|
| ![亮色模式](screenshots/app-light.png) | ![暗色模式](screenshots/app-dark.png) |

### 移动端

| 亮色模式 | 暗色模式 |
|---|---|
| ![移动端亮色模式](screenshots/app-mobile-light.jpg) | ![移动端暗色模式](screenshots/app-mobile-dark.jpg) |

## 特点

### 核心
- ⚡ **现代技术栈** — Tauri v2 + React 19 + TypeScript + Vite
- 📱 **响应式应用壳层** — 桌面端侧边栏 / 子窗口，移动端底部导航，以及处理安全区域的二级页面头部
- 🎨 **主题系统** — CSS 变量主题（cupcake 亮色 / forest 暗色），next-themes 驱动，自动跟随系统
- 🌐 **国际化** — i18next 集成，支持中英文切换
- 🪟 **自定义标题栏** — 无边框窗口拖拽，最小化/关闭行为在设置页可配置

### 交互
- 🗂️ **多窗口管理** — 子窗口创建、生命周期管理、惰性加载 + 子窗口预加载
- 🔔 **系统托盘** — 托盘图标与菜单（显示 / 设置 / 退出），标签通过 i18n 本地化
- ⌨️ **全局快捷键** — 注册快捷键，应用未聚焦也能响应
- 🔍 **命令面板** — Ctrl+K 快速搜索打开窗口、切换主题、切换语言
- 🛎️ **原生通知** — 通过 `tauri-plugin-notification` 发送操作系统级通知

### 架构与质量
- 📦 **状态管理** — Zustand（窗口行为持久化）+ TanStack Query（服务端状态，稳定查询支持官方按需持久化）
- 🧩 **模块化结构** — 基于 feature 的目录结构（`features/`、`api/`、`stores/`）
- 🧪 **测试** — Vitest + Testing Library
- 📊 **包体积分析** — rollup-plugin-visualizer
- 🦀 **生产级 Rust 后端** — 模块化结构（`commands/`、`error/`、`logging/`、`models/`、`plugins/`、`services/`）、`thiserror` 错误类型、`tracing` 埋点、Cargo workspace 模式
- 🖥️ **REST API 服务端** — axum + sea-orm + PostgreSQL，支持自动迁移、CORS、结构化错误处理和集成测试
- 📝 **结构化日志** — `tracing-subscriber` + `EnvFilter`，控制台输出

### DevOps
- 🔄 **发布自动化** — `v*` 标签触发 GitHub Actions 校验与发布；Windows 更新器产物开箱即用，macOS/Linux 保持 CI 构建通道
- 🔧 **构建脚本** — `build.ps1` 支持多平台（Windows 开发/构建、Android 开发/构建、清理）
- 🤖 **Android 工程重生成** — 当 `src-tauri/gen/android` 被删除或损坏时，可通过 `pnpm tauri android init` 重新生成
- 🏷️ **版本管理** — 交互式或 CLI 驱动的发布流程，内置 lint/build/changelog 关卡

## 平台范围

- Windows 桌面端：模板当前的产品化主路径，内置 NSIS 打包与更新器产物。
- macOS / Linux 桌面端：CI 会持续构建校验，但签名、公证、发行渠道等仍需业务项目自行补齐。
- Android：支持本地开发与 APK 生成。
- iOS：当前仅保留配置脚手架，尚未提供产品化的本地脚本或 CI 打包流程。

当前支持状态见 [支持矩阵](./docs/SUPPORT_MATRIX.md)。

## 技术栈

- **桌面框架**: [Tauri v2](https://tauri.app/)
- **前端框架**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vite.dev/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **样式方案**: [Tailwind CSS v3](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query)，并通过 `PersistQueryClientProvider` 接入官方持久化
- **路由**: [TanStack Router](https://tanstack.com/router)
- **图标**: [Lucide](https://lucide.dev/)
- **国际化**: [i18next](https://www.i18next.com/)
- **主题**: [next-themes](https://github.com/pacocoursey/next-themes)
- **表单校验**: [Zod](https://zod.dev/)
- **命令面板**: [cmdk](https://cmdk.paco.me/)
- **动画**: [motion](https://motion.dev/)
- **通知**: [sonner](https://sonner.emilkowal.ski/)（Toast）+ `tauri-plugin-notification`（原生）
- **日志**: [tracing](https://docs.rs/tracing/) + `tracing-subscriber`
- **服务端框架**: [axum](https://github.com/tokio-rs/axum)
- **ORM**: [Sea-ORM](https://www.sea-ql.org/SeaORM/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/)
- **容器**: [Docker](https://www.docker.com/)
- **代码规范**: [ESLint (antfu/eslint-config)](https://github.com/antfu/eslint-config)

## 快速开始

### 环境要求

| 工具 | 最低版本 |
|------|---------|
| Node.js | 25 |
| pnpm | 10 |
| Rust | 1.92 |
| Docker | 24+ |

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm tauri dev
```

启动应用并开启热重载。单独运行 `pnpm dev` 可启动前端 Vite 开发服务器（`http://localhost:1420`）。

### 生产构建

```bash
pnpm tauri build
```

编译 Rust 后端并将前端打包为平台安装程序。

### Android

```bash
pnpm tauri android init
pnpm build:android:debug
```

首次构建 Android，或者删除 / 重生成 `src-tauri/gen/android` 后，先执行一次 `pnpm tauri android init`。如果整个生成目录不存在，`build.ps1` 也会自动尝试初始化。

### 服务端

```bash
docker compose up -d postgres  # 后台启动 PostgreSQL
pnpm server                     # 启动 axum 服务端（默认 http://localhost:3000）
```

服务端需要运行中的 PostgreSQL 实例。使用 Docker 是最快的启动方式，也可以将 `server/.env` 指向任意 PostgreSQL 17 数据库。

### Docker

```bash
docker compose up  # 启动 PostgreSQL + 可选开发容器
```

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 前端 Vite 开发服务器 |
| `pnpm build` | TypeScript 检查 + Vite 生产构建 |
| `pnpm lint` | 运行 linter |
| `pnpm lint:fix` | Lint 并自动修复 |
| `pnpm server` | 启动 axum 服务端（需要 PostgreSQL） |
| `pnpm tauri dev` | 启动 Tauri 桌面应用（热重载） |
| `pnpm tauri build` | 构建 Tauri 桌面应用 |
| `pnpm release:version` | 版本发布流程（见下方） |
| `pnpm check:all` | 一次性运行 lint、测试、前端构建与 Rust 测试 |
| `cd app && pnpm test` | 运行 Vitest 测试 |
| `cd app && pnpm analyze` | 包体积分析 |
| `cd app && pnpm changelog` | 从 conventional commits 自动生成 CHANGELOG |
| `cd app && pnpm build:win` | 通过 `build.ps1` 构建 Windows |
| `cd app && pnpm build:android` | 通过 `build.ps1` 构建 Android |
| `cd app && pnpm build:clean` | 通过 `build.ps1` 清理构建产物 |
| `cargo build --workspace` | 构建所有 Rust crate |
| `cargo test --workspace` | 测试所有 Rust crate |
| `docker compose up` | 启动 PostgreSQL + 开发容器 |

## 版本管理

`pnpm release:version` 驱动完整的发布流程：

```bash
pnpm release:version              # 交互式（英文）
pnpm release:version --lang zh    # 交互式（中文）
pnpm release:version 0.1.0        # 非交互，直接指定版本
pnpm release:version 0.1.0 --dry-run  # 仅预览
```

**CLI 参数：**

| 参数 | 说明 |
|------|------|
| `--dry-run` | 打印将执行的操作，不实际执行 |
| `--no-push` | 本地提交和打 tag，跳过推送 |
| `--no-lint` | 跳过 lint 检查 |
| `--no-build` | 跳过构建检查 |
| `--no-changelog` | 跳过 changelog 生成 |
| `--lang zh\|en` | 强制语言（默认从环境变量自动检测） |

**前置检查：**

- 工作区干净，当前分支为 `main`
- 版本文件一致：`app/package.json`、`app/src-tauri/tauri.conf.json`、`app/src-tauri/Cargo.toml`、`Cargo.lock`
- 目标 tag 不存在于本地或远端 `origin`

**关卡（在修改文件前执行）：**

- `pnpm run lint` — lint 检查（可跳过）
- `pnpm run build` — 前端构建检查（可跳过）

**执行操作：**

- 从 conventional commits 自动生成 CHANGELOG 章节
- 同步更新 `app/package.json`、`app/src-tauri/tauri.conf.json`、`app/src-tauri/Cargo.toml`、`Cargo.lock`
- 创建发布提交和 `vX.Y.Z` tag
- 可选推送分支和 tag

## 项目结构

```
.
├── app/                    # 桌面应用（前端 + Tauri）
│   ├── src/               # 前端源码
│   │   ├── app/           # 应用装配层（挂载、路由、providers、shell）
│   │   ├── assets/        # 静态资源（图标、Logo）
│   │   ├── api/           # Tauri 命令封装（类型化的服务函数）
│   │   ├── components/    # 共享 React 组件
│   │   │   └── ui/       # shadcn/ui 组件
│   │   ├── features/      # 功能模块
│   │   │   ├── about/     # 关于页 / 子窗口
│   │   │   ├── command-palette/# Ctrl+K 命令面板
│   │   │   ├── home/      # 主页面、桌面壳层切换
│   │   │   ├── profile/   # 移动端"我的"页
│   │   │   ├── settings/  # 设置页 / 子窗口（主题、语言、窗口行为、快捷键）
│   │   │   ├── tasks/     # 后台任务演示 / 笔记演示
│   │   │   └── updater/   # 更新检测与安装 UX
│   │   ├── hooks/         # 共享自定义 Hook
│   │   ├── i18n/          # 国际化
│   │   │   └── locales/   # 翻译文件（中/英）
│   │   ├── lib/           # 工具函数和常量
│   │   ├── platform/      # runtime / Tauri / 桌面窗口平台辅助代码
│   │   ├── providers/     # 跨层上下文适配器（主题、query 持久化）
│   │   ├── routes/        # TanStack Router 路由定义与路由元数据注册表
│   │   ├── stores/        # Zustand 状态仓库
│   │   └── test/          # 测试设置与测试文件
│   ├── src-tauri/         # Tauri/Rust 后端
│   │   ├── src/
│   │   │   ├── main.rs    # 入口
│   │   │   ├── lib.rs     # 应用配置、插件初始化、命令注册
│   │   │   ├── app.rs + app/              # 应用启动、配置、共享状态
│   │   │   ├── commands.rs + commands/  # Tauri 命令（greet、task、notification、config、tray、notes）
│   │   │   ├── config.rs                # 兼容导出的配置模块
│   │   │   ├── error.rs + error/        # 自定义错误类型（thiserror、serde）
│   │   │   ├── logging.rs + logging/    # tracing-subscriber + EnvFilter
│   │   │   ├── models.rs + models/      # Serde 结构体（任务进度等）
│   │   │   ├── platform.rs + platform/  # 桌面平台集成（托盘、窗口规则）
│   │   │   ├── plugins.rs + plugins/    # 插件封装
│   │   │   ├── response.rs              # API 响应辅助
│   │   │   ├── services.rs + services/  # 服务层
│   │   │   └── state.rs                 # 兼容导出的状态模块
│   │   ├── capabilities/  # Tauri 权限配置
│   │   └── tauri.conf.json# Tauri 配置
│   ├── scripts/           # 构建与发布脚本
│   ├── build.ps1          # 多平台构建脚本（Windows、Android、清理）
│   ├── components.json    # shadcn/ui 配置
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── tsconfig.json
├── server/                # REST API 服务端
│   ├── src/
│   │   ├── main.rs        # 入口（axum）
│   │   ├── lib.rs         # 模块导出
│   │   ├── config.rs      # 环境变量配置
│   │   ├── db.rs          # 数据库连接
│   │   ├── error.rs       # 结构化错误类型
│   │   └── routes/        # API 路由处理器
│   ├── tests/             # 集成测试
│   ├── .env.example
│   └── Cargo.toml
├── types/                 # 共享 Rust 领域模型
│   ├── src/
│   └── Cargo.toml
├── entity/                # Sea-ORM 实体
│   ├── src/
│   └── Cargo.toml
├── migration/             # 数据库迁移
│   ├── src/
│   └── Cargo.toml
├── docs/                  # 文档
│   ├── AUTO_UPDATE.zh-CN.md # 自动更新指南
│   ├── I18N.zh-CN.md      # 国际化指南
│   └── GLOBAL_SHORTCUT.zh-CN.md # 全局快捷键指南
├── .github/
│   └── workflows/         # CI/CD 流水线
├── docker-compose.yml     # PostgreSQL + 开发容器
├── Cargo.toml             # Cargo workspace 配置
├── package.json           # workspace 根
├── pnpm-workspace.yaml
└── README.md
```

## 架构约定

- 路由语义与窗口元数据统一放在 `app/src/routes/registry/`
- Router 装配统一放在 `app/src/app/router.tsx` 与 `app/src/routes/builders/`
- Shell UI 统一放在 `app/src/app/shell/`
- 平台/runtime 相关代码统一放在 `app/src/platform/`
- Rust 模块根使用 `app.rs`、`platform.rs`、`services.rs`，不使用 `mod.rs`
- 共享 Rust 类型放在 `types/` crate 中，供 `app/src-tauri` 和 `server` 共同使用
- 数据库实体放在 `entity/` crate，迁移放在 `migration/` crate

## Query 持久化

- 稳定的只读查询可通过设置 `meta.persist = true` 选择性启用官方 TanStack 持久化
- 持久化由 `app/src/app/providers/query-persistence.ts` 和 `PersistQueryClientProvider` 统一装配
- 只有显式标记的查询会被 dehydrate / restore
- 持久化缓存的 buster 会跟随 `VITE_APP_VERSION` 变化，因此新版本发布后会自动失效旧缓存，避免结构不兼容

## CI/CD

GitHub Actions 负责自动化构建和发布。

### 发布工作流

推送符合 `v*` 格式的标签（如 `v0.1.0`）即可触发发布构建。推荐使用 `pnpm release:version`，它会自动创建对应标签。

也可以手动推送：

```bash
git tag v0.1.0
git push origin v0.1.0
```

### 构建产物

当前发布工作流主要面向 Windows 自动更新分发，生成：

- **NSIS 安装包** — Windows `.exe` 安装程序
- `latest.json` — 供内置自动更新机制使用的更新清单

macOS 与 Linux 目前更接近“持续构建校验通道”，还不是模板内完整文档化的分发目标。

### 自动更新

启用自动更新需要：

1. 生成签名密钥对：`pnpm tauri signer generate -w ~/.tauri/myapp.key`
2. 在 GitHub 仓库 Secrets 中添加 `TAURI_SIGNING_PRIVATE_KEY` 和 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

> 发布构建时，GitHub Actions 会自动替换 `src-tauri/tauri.conf.json` 中的公钥和更新端点占位符。自动更新器从最新 GitHub Release 资源中读取 `latest.json`。

详细说明请查看[自动更新配置文档](./docs/AUTO_UPDATE.zh-CN.md)。

### 代码签名（可选）

如需对 Windows 安装包签名，添加以下 Secrets：

- `TAURI_SIGNING_PRIVATE_KEY` — 私钥内容
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — 私钥密码

不配置也能正常构建，但安装包不会被签名。

### 多平台支持

Windows 是当前主要打包目标。macOS 与 Linux 桌面构建保留在 CI 中用于回归校验，但生产分发步骤刻意留给下游项目自行接入。Android 通过本地 Tauri mobile 工具链和 `build.ps1` 支持。iOS 仍需后续手动集成。

## IDE 推荐

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

MIT
