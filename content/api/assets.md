---
title: Assets
description: List, read, create, update and download assets.
order: 3
---

## GET /api/assets

Public catalogue listing with search, filters, sorting and pagination.

**Query parameters**

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `category` | string | — | One of the six store categories |
| `q` | string | — | Matches title and description |
| `price` | `free` \| `paid` | — | Filter by price |
| `sort` | `newest` \| `popular` \| `rating` | `newest` | |
| `page` | number | `1` | |
| `perPage` | number | `12` | Max `48` |

```bash
curl "https://store.example.com/api/assets?category=Audio&sort=popular&page=1"
```

**Response** — `200 OK`

```json
{
  "items": [
    {
      "id": "6b1f...",
      "title": "Footstep Pack Vol. 1",
      "slug": "footstep-pack-vol-1",
      "author": { "id": "9c2f...", "username": "Ada Lovelace", "handle": "ada", "avatar": null },
      "category": "Audio",
      "tags": ["footsteps", "sfx"],
      "price": 0,
      "downloads": 6712,
      "thumbnail": "https://.../cover.png",
      "version": "1.2.0",
      "file": "https://.../pack.zip",
      "license": "CC0 1.0",
      "fileSize": 18432000,
      "rating": 4.5,
      "featured": true,
      "status": "approved",
      "createdAt": "2026-01-12T09:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "perPage": 12,
  "pageCount": 4
}
```

## GET /api/assets/[id]

Accepts an asset `id` (UUID) or a `slug`.

```bash
curl "https://store.example.com/api/assets/footstep-pack-vol-1"
```

**Response** — `200 OK` — a single object with the same shape as one element of `items` above.

| Status | Meaning |
| --- | --- |
| 200 | Found |
| 404 | Missing, or not yet approved |

## POST /api/assets

Requires a Bearer JWT (publisher) or `X-API-Key`.

Send `multipart/form-data`:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | max 120 chars |
| `category` | yes | must match a store category |
| `description` | no | max 5000 chars |
| `tags` | no | comma separated or repeated fields |
| `license` | no | defaults to `Lumo Asset License` |
| `version` | no | defaults to `1.0.0` |
| `price` | no | USD amount, `0` = free |
| `status` | no | `draft` keeps it private, otherwise `pending` |
| `file` | yes* | the asset `.zip`, max 50 MB |
| `thumbnail` | no | image, max 5 MB |

`file_url` / `thumbnail_url` may be sent as plain fields instead of uploading a file (JSON
bodies are supported too).

**Response** — `201 Created` — `{ "asset": { ... } }` with `status: "pending"`.

## PATCH /api/assets/[id]

Owner or admin only. Accepts the same fields as `POST` (partial payloads are merged with the
current values) and may replace `file` / `thumbnail`.

Sending `{"status": "draft"}` unpublishes an asset; `{"status": "pending"}` sends it back
through review. Only admins can approve.

| Status | Meaning |
| --- | --- |
| 200 | Updated |
| 400 | Validation failed |
| 403 | Not the owner |
| 404 | Missing asset |

## GET /api/assets/[id]/download

Increments the download counter and returns the file.

- Browsers receive a `302` redirect to the file.
- API clients (`Accept: application/json`, `?format=json` or `X-API-Key`) receive JSON:

```json
{
  "id": "6b1f...",
  "title": "Footstep Pack Vol. 1",
  "slug": "footstep-pack-vol-1",
  "url": "https://.../pack.zip",
  "filename": "footstep-pack-vol-1-v1.2.0.zip",
  "fileSize": 18432000,
  "downloads": 6713,
  "license": "CC0 1.0"
}
```

| Status | Meaning |
| --- | --- |
| 200 | URL returned |
| 302 | Browser redirect |
| 401 | Paid asset without a session (`login_required`) |
| 404 | Asset or file missing |
