# Qliqy Frontend

![CI](https://github.com/QliqyService/frontend/actions/workflows/frontend-build.yml/badge.svg)
![Status](https://img.shields.io/badge/status-active%20development-b4492f)

React frontend for Qliqy.

## What It Does

- provides the authenticated dashboard
- renders public form pages
- lets users manage forms and profile settings
- exposes Telegram and email notification controls

## How It Works

The frontend talks to `webapi` over REST. Public pages are rendered in React, while all business data comes from `webapi` endpoints under `/api/v1`.

## Product Note

Public registration is intentionally disabled for now while the interface is being refined.

Test account:

```json
{
  "email": "admin@admin.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "admin123"
}
```

- Developer: Ilia Fedorenko
- Developer: Ernest Berezin
