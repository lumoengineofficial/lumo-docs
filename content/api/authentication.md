---
title: Authentication
description: Create accounts, exchange credentials for a token and use it on later requests.
order: 2
---

## POST /api/auth/signup

Creates an account from an email and password.

**Body**

```json
{
  "email": "publisher@example.com",
  "password": "correct-horse-battery",
  "username": "Ada Lovelace",
  "handle": "ada"
}
```

**Response** — `201 Created`

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "9c2f...",
    "email": "publisher@example.com",
    "username": "Ada Lovelace",
    "handle": "ada",
    "role": "user",
    "banned": false,
    "createdAt": "2026-01-08T12:00:00.000Z"
  },
  "requiresConfirmation": false,
  "message": "Account created."
}
```

When the Supabase project requires email confirmation, `token` is `null` and
`requiresConfirmation` is `true`.

| Status | Meaning |
| --- | --- |
| 201 | Account created |
| 400 | Invalid email, weak password or duplicate account |
| 503 | Supabase environment variables missing |

## POST /api/auth/login

Exchanges credentials for a token.

**Body**

```json
{ "email": "publisher@example.com", "password": "correct-horse-battery" }
```

**Response** — `200 OK`

```json
{
  "token": "eyJhbGciOi...",
  "refreshToken": "...",
  "expiresAt": 1767225600,
  "user": { "id": "9c2f...", "role": "user" }
}
```

| Status | Meaning |
| --- | --- |
| 200 | Signed in |
| 401 | Wrong credentials |
| 403 | Account suspended (`account_banned`) |

## Using the token

Send it on every authenticated request:

```bash
TOKEN=$(curl -s -X POST /api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.dev","password":"secret123"}' | jq -r .token)

curl -X POST /api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -F title="Sci-Fi Door" \
  -F category="3D Models" \
  -F file=@door.zip
```

## Roles

| Role | Can do |
| --- | --- |
| `user` | Download, publish own assets, edit own assets |
| `admin` | Everything above plus moderation, user management and featuring |

Roles live in the `users.role` column and are enforced server-side on every admin route.
