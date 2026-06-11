# Contributing

## Development Setup

```bash
pnpm install
pnpm tauri dev
```

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for module index and key conventions.

## Commit Guidelines

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.
- Keep commits small and focused.
- Commit messages are validated by `commitlint` via `simple-git-hooks`.

## Before Submitting

- Run `pnpm lint` to ensure code style compliance.
- Run `pnpm test` to verify tests pass.
- Run `pnpm tauri build` to verify the app builds successfully for your platform.

## Scaffold a New Feature

```bash
node scripts/generate-feature.mjs <name>
```

Generates `src/features/<name>/` with `index.ts`, `pages/<name>.tsx`, `components/`, `hooks/`.

## Docker Development

```bash
docker compose up
```

Mounts the project directory and exposes port 1420. Set `TAURI_DEV_HOST=0.0.0.0` to allow LAN access.

## Adding a shadcn Component

```bash
pnpm dlx shadcn@latest add <component>
```

## Adding a New Language

1. Create `src/i18n/locales/<lang>.json`
2. Register it in `src/i18n/index.ts`
3. Update language menu in `src/components/command-palette.tsx`

## Adding a Tauri Command

1. Define the command in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Register it in the `invoke_handler` in the same file
3. Add the corresponding capability in `src-tauri/capabilities/default.json`
4. Call from frontend with `invoke('command_name', { args })`

## Releases

See [docs/AUTO_UPDATE.md](./docs/AUTO_UPDATE.md) for the release workflow.

```bash
node release-version.mjs
```
