---
title: Overview
description: Base URL, authentication, CORS, caching and error format for REST API v1.
order: 1
---

## Base URL

```text
https://<your-deployment>/api
```

Every endpoint accepts and returns JSON unless stated otherwise. The same routes are used by
this website, the Lumo editor's Asset Store tab and any machine client.

## Authentication

Requests are authenticated in one of two ways — both work on **every** route:

```http
Authorization: Bearer <supabase-access-token>
```

```http
X-API-Key: $STORE_API_KEY
```

The `X-API-Key` header exists so the desktop app can call the API without a browser session.
Treat `STORE_API_KEY` as a secret with admin-level power and never ship it in client code.

Public read endpoints (`GET /api/assets`, `GET /api/assets/[id]`, free downloads) need no
credentials at all.

## CORS

Allowed origins come from the `CORS_ORIGINS` environment variable (comma separated). When the
variable is empty, any origin may call the API. `OPTIONS` preflight requests are handled on
every route with a `204` response.

## Caching

| Endpoint class | Cache |
| --- | --- |
| Public reads | `s-maxage=60, stale-while-revalidate=300` |
| Downloads | `no-store` (counter must stay accurate) |
| Auth / admin | `no-store` |

## Error format

Every failure uses the same envelope and a meaningful HTTP status:

```json
{
  "error": {
    "code": "invalid_category",
    "message": "Category must be one of: 3D Models, Textures & Materials, ..."
  }
}
```

See [Errors](#errors) for the full status-code table.

## Versioning

The `v1` prefix is part of the path (`/api/...`). Breaking changes will ship under `/api/v2`
while v1 keeps working.
