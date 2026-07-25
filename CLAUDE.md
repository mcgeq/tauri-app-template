# Tauri App Template

## Project Overview

Modern desktop application template built with Tauri v2 + React 19 + TypeScript + shadcn/ui.

## Architecture

- **App**: React 19 + TypeScript + Vite + Tailwind CSS v3 + shadcn/ui + Tauri v2
- **Server**: Rust + axum + PostgreSQL (REST API)
- **Shared Types**: Rust crate shared between app and server
- **Build**: pnpm + Vite + Cargo workspace

## Module Index

| Module        | Path               | Tech Stack         | Responsibility                     |
| ------------- | ------------------ | ------------------ | ---------------------------------- |
| App (Frontend)| `app/src/`         | TypeScript/React   | UI, components, styles, i18n       |
| App (Desktop) | `app/src-tauri/`   | Rust               | System calls, native features      |
| Server        | `server/`          | Rust/axum          | REST API, data persistence         |
| Shared Types  | `types/`           | Rust               | Domain models shared across crates |
| Documentation | `docs/`            | Markdown           | Project guides and references      |
| Scripts       | `app/scripts/`     | Node.js / PS1      | Code generation, release, signing  |

## Development

### Prerequisites

- Node.js >= 25
- pnpm >= 10
- Rust >= 1.92

### Commands

```bash
pnpm install                  # Install dependencies (from root or app/)
pnpm tauri dev                # Start Tauri dev server
pnpm dev                      # Start Vite frontend only
pnpm tauri build              # Build for production
pnpm build                    # Build frontend only
pnpm lint                     # Lint and format code (from root)
pnpm lint:fix                 # Lint and auto-fix
cd app && pnpm test           # Run tests
cd app && pnpm analyze        # Analyze bundle size
pnpm commitlint               # Check commit message against conventional commits
cd app && pnpm generate:keystore      # Generate Android signing keystore (interactive)
cd app && pnpm generate:keystore:ci   # Generate Android signing keystore (non-interactive, CI)
cd app && pnpm build:android          # Build Android APK (arm64, signed if keystore exists)
```

### Server

```bash
cd server
cp .env.example .env
cargo run  # Start axum server (requires PostgreSQL running)
```

### Docker

```bash
docker compose up  # Start PostgreSQL + optional dev container
```

### Cargo Workspace

```bash
cargo build --workspace  # Build all Rust crates
cargo test --workspace   # Test all Rust crates
```

## Coding Standards

### TypeScript/React

- TypeScript strict mode
- Function components with Hooks
- Path alias: `@/` maps to `src/`
- Format with ESLint (antfu/eslint-config)
- **Comments and logs MUST be in English only**
- Keep code clean and minimal

### Rust

- Follow Rust naming conventions
- Use `#[tauri::command]` macro for Tauri commands
- **Comments and logs MUST be in English only**

### Styling

- Tailwind CSS v3
- shadcn/ui component system
- CSS variables for theming (light/dark mode)

### Code Quality Rules

1. **Language**: All comments, console logs, and error messages MUST be in English
2. **Cleanliness**: Remove unnecessary code, avoid redundant implementations
3. **Simplicity**: Follow KISS principle - keep implementations straightforward

## Key Conventions

1. **Add Components**: `pnpm dlx shadcn@latest add <component>`
2. **Path Alias**: Use `@/` prefix, e.g., `import { Button } from "@/components/ui/button"`
3. **Tauri Commands**: Define in `src-tauri/src/lib.rs`, call with `invoke()`

### Example: Tauri Command

```typescript
// Frontend
import { invoke } from '@tauri-apps/api/core';

const result = await invoke('command_name', { arg1: value });
```

```rust
// Backend (src-tauri/src/lib.rs)
#[tauri::command]
fn command_name(arg1: &str) -> String {
    format!("Result: {}", arg1)
}
```

---

## Frontend Module (app/src)

### Responsibilities

UI rendering, interaction, and styling. Built with React 19 + TypeScript + Tailwind CSS v3 + shadcn/ui.

### Entry Points

- **Entry**: `app/src/main.tsx` delegates to `app/src/app/main.tsx`
- **Router**: `app/src/app/router.tsx` builds TanStack Router from `app/src/routes/builders/build-route-tree.tsx`
- **Routes**: `app/src/routes/__root.tsx` — root layout with AppProviders (theme, query persistence, toaster, Suspense) and desktop window preload wiring
- **Route Metadata**: `app/src/routes/registry/route-registry.ts` — source of truth for route path, nav metadata, and desktop/mobile open behavior
- **Shell**: `app/src/app/shell/` contains shared desktop/mobile shell UI, shell primitives, and shell-specific hooks
- **Provider Adapters**: `app/src/providers/` contains cross-cutting context adapters such as theming
- **Features**: `app/src/features/home/`, `app/src/features/tasks/`, `app/src/features/profile/`, `app/src/features/settings/`, `app/src/features/about/`
- **Build Tool**: Vite (`app/vite.config.ts`) with `manualChunks` splitting vendor/router/ui

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.0 | UI framework |
| @tauri-apps/api | ^2 | Tauri frontend API |
| tailwindcss | ^3.4.17 | CSS framework |
| lucide-react | ^0.577.0 | Icon library |
| i18next | ^25.8.18 | Internationalization core |
| react-i18next | ^16.5.8 | React i18n integration |
| next-themes | ^0.4.6 | Theme provider |
| @antfu/eslint-config | ^9.0.0 | ESLint + formatter |
| @tanstack/react-router | ^1.170.15 | Routing |
| @tanstack/react-query | ^5.101.0 | Data fetching |
| @tanstack/react-query-persist-client | ^5.101.0 | Official query persistence provider |
| @tanstack/query-async-storage-persister | ^5.101.0 | Async storage persister |
| zustand | ^5.0.14 | State management |
| cmdk | ^1.1.1 | Command palette |
| zod | ^4.4.3 | Schema validation |
| sonner | ^2.0.7 | Toast notifications |
| vitest | ^4.1.8 | Unit testing |
| motion | | Animation library |
| date-fns | | Date utilities |

### Query Persistence

- Wired in `src/app/providers/query-persistence.ts`
- The app uses `PersistQueryClientProvider` instead of manually subscribing to cache updates
- Only queries with `meta.persist = true` are dehydrated and restored
- The persisted cache buster follows `VITE_APP_VERSION`, so app releases automatically invalidate incompatible cached query data

### Configuration

- `tsconfig.json` — TypeScript strict mode with `@/*` → `./src/*` alias
- `vite.config.ts` — Vite build config with chunk splitting
- `components.json` — shadcn/ui config
- `src/i18n/index.ts` — i18next configuration

### Internationalization

```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <h1>{t("app.title")}</h1>
      <button onClick={() => i18n.changeLanguage("zh")}>
        {t("language.toggle")}
      </button>
    </div>
  );
}
```

**Supported Languages**: English (en), Chinese (zh)

**Translation Files**: `src/i18n/locales/{en,zh}.json`

See [I18N Documentation](./docs/I18N.md) for detailed usage.

### Toast Notifications

Uses sonner (via shadcn/ui). Add `<Toaster />` from `@/components/ui/sonner` to your page root.

```typescript
import { toast } from 'sonner';
toast.success(t('settings.shortcut.setSuccess', { shortcut: 'Ctrl+Shift+A' }));
```

Auto-adapts to light/dark theme, supports i18n with variable interpolation, auto-dismisses after 4s.

### Tauri API Usage

**Invoke (Request-Response):**
```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('greet', { name: 'World' });
```

**Event Streaming (Rust → Frontend):**
```typescript
import { listen } from '@tauri-apps/api/event';
const unlisten = await listen<{ progress: number }>('task-progress', (event) => {
  console.log(event.payload.progress);
});
```

See `src/api/task.ts` and `src/features/home/components/task-demo.tsx` for a complete example.

### Common Tasks

**Add shadcn/ui Component:**
```bash
pnpm dlx shadcn@latest add button
```

**Add Routing:**
1. Create page component under `src/features/<name>/pages/`
2. Create `src/features/<name>/route.ts` with `createRoute`
3. Add route metadata to `src/routes/registry/route-registry.ts`
4. Wire into `src/routes/builders/build-route-tree.tsx`

**Add Sidebar Section:**
1. Add/update route in `src/routes/registry/route-registry.ts`
2. Set `shell: 'app'`, provide `nav` metadata
3. `sidebar.tsx` / `bottom-nav.tsx` derive items automatically

**Scaffold a New Feature:**
```bash
node scripts/generate-feature.mjs <name>
```
Then register route in `route-registry.ts` and `build-route-tree.tsx`.

### File Structure (app/src)

```
src/
├── main.tsx               # Tiny entry → mountApp()
├── index.css              # Global styles + Tailwind theme + cmdk styles
├── app/                   # App composition (mounting, router, shell, providers)
│   ├── main.tsx           # Mounts RouterProvider
│   ├── router.tsx         # Creates router from buildRouteTree()
│   ├── providers/         # Provider composition + query client
│   └── shell/             # Desktop/mobile shell UI, primitives, hooks
├── api/                   # Tauri command wrappers
├── assets/                # Static assets
├── components/            # Shared UI primitives
│   ├── ui/                # shadcn/ui components
│   ├── error-boundary.tsx
│   └── loading.tsx
├── features/              # Feature modules
│   ├── about/             # About route / desktop child window
│   ├── command-palette/   # Global command entrypoint
│   ├── home/              # Main dashboard page
│   ├── profile/           # Profile page
│   ├── settings/          # Settings route / desktop child window
│   ├── tasks/             # Tasks page
│   └── updater/           # Update detection and install UX
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization
├── lib/                   # Utilities (query-keys, shortcut, updater, utils)
├── providers/             # Cross-cutting context adapters
├── platform/              # Platform/runtime-specific helpers
│   ├── runtime/           # Runtime detection
│   ├── tauri/             # Tauri event contracts
│   └── windows/           # Desktop window lifecycle
├── routes/                # Route definitions + metadata
│   ├── __root.tsx         # Root layout + providers + preload wiring
│   └── registry/          # Route metadata source of truth
├── stores/                # Zustand stores
└── test/                  # Test files (setup, api, features, platform, routes)
```

### Placement Rules

- `components/ui/` — low-level shadcn primitives and styling wrappers only
- `components/` — generic shared UI; no routing, i18n, platform, or feature logic
- `providers/` — reusable context adapters consumed across app, features, and UI
- `app/` — top-level composition, shell layout, shell primitives, provider assembly
- `features/` — application capabilities owned per module (command palette, updater, settings, etc.)
- `types/` — shared Rust domain models used across `app/src-tauri` and `server`
- `server/` — axum REST API, PostgreSQL migrations, routes, and business logic

---

## Backend Module (app/src-tauri)

### Responsibilities

System-level calls, native features, cross-platform desktop app wrapper.

### Entry Points

- **Entry**: `app/src-tauri/src/main.rs`
- **App Logic**: `app/src-tauri/src/lib.rs`
- **Build Config**: `app/src-tauri/Cargo.toml`

### Commands

| Command | Parameters   | Returns  | Description              |
| ------- | ------------ | -------- | ------------------------ |
| `greet` | `name: &str` | `String` | Example greeting command |
| `start_background_task` | `app: AppHandle` | `Result<(), String>` | Spawn thread, emit progress events to frontend |

### Event Streaming (Backend → Frontend)

```rust
use tauri::Emitter;

#[tauri::command]
fn start_background_task(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        app.emit("task-progress", serde_json::json!({"progress": 50})).ok();
    });
    Ok(())
}
```

Frontend uses `listen()` from `@tauri-apps/api/event` to receive events. See `app/src/api/task.ts` and `app/src/features/home/components/task-demo.tsx`.

### Key Dependencies

- tauri@2 - Tauri framework
- tauri-plugin-opener@2 - Open external links
- serde@1, serde_json@1 - Serialization

### Configuration

- `app/src-tauri/tauri.conf.json` - Tauri app config
- `app/src-tauri/capabilities/default.json` - Permissions config

**Key Settings**:

- Product: `tauri-app-template`
- Identifier: `com.mcgeq.qianyu`
- Window: 800x600
- Dev Port: 1420

---

## Documentation (docs)

### Available Guides

- **AUTO_UPDATE.md** - Tauri auto-update configuration and GitHub Actions setup
- **I18N.md** - Internationalization guide (English)
- **I18N.zh-CN.md** - 国际化指南（中文）

### Adding Documentation

When adding new features, create corresponding documentation:

1. Create English version: `docs/FEATURE.md`
2. Create Chinese version: `docs/FEATURE.zh-CN.md`
3. Update README.md and README.zh-CN.md if needed
