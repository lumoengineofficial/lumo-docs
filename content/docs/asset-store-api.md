---
title: Asset Store API
description: How the editor's Asset Store tab talks to this site, and how you can too.
order: 4
---

## Overview

The Lumo editor ships an **Asset Store** tab. It is a thin client over this site's REST API, so
anything the editor can do, your scripts can do too.

- Base URL: `https://<your-deployment>/api`
- Format: JSON (UTF-8)
- Full reference: [API documentation](/api-docs)

## Three ways to authenticate

| Credential | Header | Use it for |
| --- | --- | --- |
| None | — | Public reads (list, detail, download of free assets) |
| Bearer JWT | `Authorization: Bearer <token>` | Publishers editing their own assets |
| Machine key | `X-API-Key: $STORE_API_KEY` | Desktop app / CI, no browser session |

```bash
# public read
curl "https://store.example.com/api/assets?category=3D%20Models&sort=popular"

# publisher write
curl -X POST "https://store.example.com/api/assets" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Sci-Fi Door" -F "category=3D Models" -F "file=@door.zip"

# machine access
curl "https://store.example.com/api/admin/queue" \
  -H "X-API-Key: $STORE_API_KEY"
```

## Typical editor flow

1. `GET /api/assets?category=&q=&page=&sort=` — render the grid.
2. `GET /api/assets/[id]` — render the detail view and the install instructions.
3. `GET /api/assets/[id]/download` — bump the counter and receive the file URL.
4. `POST /api/auth/login` — only needed for paid assets or publishing.

## Rate limits and caching

Public reads are cached for 60 seconds at the edge. Downloads are never cached. Write endpoints
are authenticated and are not cached at all.

## Webhooks

Publishers see status changes (`pending → approved | rejected`) on their dashboard; admin
feedback is attached to the asset as `review_note`.
