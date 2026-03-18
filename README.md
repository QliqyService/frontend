# Qliqy Frontend

Standalone frontend for `qliqy-webapi`.

## Features

- token-based login against `/api/v1/auth/login`
- private dashboard for user forms
- create, edit and disable forms
- owner-side comments view
- public form page with QR preview and comment submission

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Default API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Docker

Build the frontend as a separate service:

```bash
docker build \
  -f .deployment/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:8001/api/v1 \
  -t qliqy-frontend .
```

Run it:

```bash
docker run --rm -p 8002:80 qliqy-frontend
```

The container serves a static SPA over `nginx`, so this is a standalone deployable service.

## Separate repository

This folder is already isolated from the Python backend and can be moved into its own git repository directly:

```bash
git init
git add .
git commit -m "Initial frontend"
```
