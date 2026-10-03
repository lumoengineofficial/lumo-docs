---
title: Errors
description: Error envelope, status codes and how to handle failures in your client.
order: 5
---

## Envelope

Every non-2xx response uses the same shape:

```json
{
  "error": {
    "code": "invalid_category",
    "message": "Category must be one of: 3D Models, Textures & Materials, Sprites & 2D, Audio, Plugins, Templates.",
    "details": {}
  }
}
```

`code` is stable and safe to branch on. `message` is human readable and may change.

## Status codes

| Status | `code` examples | What to do |
| --- | --- | --- |
| 400 | `invalid_title`, `invalid_category`, `invalid_price`, `invalid_license`, `missing_file`, `missing_comment`, `invalid_action` | Fix the payload |
| 401 | `unauthorized`, `invalid_credentials`, `login_required`, `signup_failed` | Log in and retry with a fresh token |
| 402/401 | `login_required` | Paid asset — sign in first |
| 403 | `forbidden`, `account_banned`, `role_required` | Caller is not allowed |
| 404 | `not_found` | Asset or user does not exist (or is not public) |
| 409 | `not_approved` | Approve the asset before featuring it |
| 500 | `internal_error` | Retry, then open an issue |
| 503 | `not_configured`, `storage_unavailable` | Deployment is missing environment variables |

## Handling errors in a client

```ts
const res = await fetch("/api/assets", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});

if (!res.ok) {
  const { error } = await res.json();
  console.error(error.code, error.message);
}
```

## CORS failures

If your request fails with a network error instead of a JSON body, the origin is probably not
listed in `CORS_ORIGINS`. Add your deployment origin to the variable and redeploy.

## Reporting bugs

The API is part of Lumo Engine — report problems on the
[issue tracker](https://github.com/lumoengineofficial/lumo/issues).
