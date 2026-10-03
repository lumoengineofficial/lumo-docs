---
title: Admin
description: Moderation queue, approve / reject, user management and site statistics.
order: 4
---

All admin endpoints require an admin Bearer JWT **or** the `X-API-Key` machine credential.

## GET /api/admin/queue

Returns submissions for review.

| Query | Values | Default |
| --- | --- | --- |
| `status` | `pending` \| `approved` \| `rejected` \| `draft` \| `all` | `pending` |

```bash
curl "https://store.example.com/api/admin/queue?status=pending" \
  -H "X-API-Key: $STORE_API_KEY"
```

**Response** — `200 OK`

```json
{
  "items": [ { "id": "6b1f...", "title": "Sci-Fi Door", "status": "pending" } ],
  "total": 1,
  "status": "pending"
}
```

| Status | Meaning |
| --- | --- |
| 200 | Queue returned |
| 401 | No credentials |
| 403 | Caller is not an admin |

## PATCH /api/admin/assets/[id]

```json
{ "action": "approve", "comment": "Looks great, published." }
```

| Action | Effect |
| --- | --- |
| `approve` | `status = approved`, visible in the store |
| `reject` | `status = rejected` + `review_note` (comment **required**) |
| `feature` | Adds the asset to the homepage carousel |
| `unfeature` | Removes it from the carousel |

**Response** — `200 OK` — `{ "asset": { ... }, "action": "approve" }`

## GET /api/admin/users

Lists every account: `{ "items": [ { "id", "email", "username", "handle", "role", "banned", "createdAt" } ], "total": 12 }`.

## PATCH /api/admin/users/[id]

```json
{ "role": "admin" }
```

```json
{ "banned": true }
```

Both fields are optional. You cannot demote or ban your own account.

## GET /api/admin/stats

```json
{
  "totalAssets": 12,
  "approved": 10,
  "pending": 2,
  "rejected": 0,
  "totalUsers": 2,
  "totalDownloads": 48210,
  "featured": 4
}
```
