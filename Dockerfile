FROM rust:1.92-slim-bookworm AS backend
# Rust toolchain is pinned via rust-toolchain.toml; the image version must match
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

FROM node:25-bookworm AS frontend
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .

FROM backend AS tauri-build
COPY --from=frontend /app /app
RUN corepack enable && pnpm tauri build

FROM node:25-bookworm AS dev
WORKDIR /app
COPY --from=backend /usr/lib /usr/lib
COPY pnpm-lock.yaml package.json ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
EXPOSE 1420
CMD ["pnpm", "tauri", "dev"]
