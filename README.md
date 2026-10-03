# Lumo Asset Store

The official asset store for **[Lumo Engine](https://github.com/lumoengineofficial/lumo)** — an
open-source 3D game engine.

Static-first Next.js 15 app + Vercel serverless API routes, backed by Supabase (Postgres, Auth,
Storage). Dark game-engine theme, `#4f5ef5` accent, Inter, mobile-first responsive.

```text
Download asset  →  drop the folder into Assets/  →  import in the editor
```

---

## What's inside

| Area | Details |
| --- | --- |
| **Home** | Hero with engine download CTAs, featured carousel, how-it-works, live stats, plugins + docs teasers, support CTA |
| **Store** (`/store`) | Search, category/price filters, newest / popular / rating sorting, pagination |
| **Asset detail** (`/asset/[slug]`) | Gallery, tags, version, size, license, download counter, install steps, related assets |
| **Plugins** (`/plugins`) | Same card system filtered to the Plugins category |
| **Docs** (`/docs`, `/docs/[slug]`) | Sidebar + on-page TOC, markdown driven from `content/docs` |
| **Creators** (`/author/[handle]`) | Avatar, bio and every published asset |
| **Auth** (`/login`, `/signup`) | Email + password via Supabase Auth |
| **Publisher dashboard** (`/dashboard`) | Stats, multipart upload form, edit / unpublish / resubmit |
| **Admin panel** (`/admin`) | Moderation queue, feature toggles, user roles & bans, site stats |
| **REST API v1** | `/api/assets`, `/api/assets/[id]`, `/api/auth/*`, `/api/admin/*` — documented on `/api-docs` |

---

## 1. Create the Supabase project

1. Create a project at [database.new](https://database.new).
2. Open **SQL Editor** and paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   This creates `users`, `assets`, `ratings`, the `assets_public` view, RLS policies, the
   `increment_downloads()` helper and the `assets` + `covers` storage buckets.
3. (Optional, for a populated demo) copy your API keys into a local `.env.local` and run:

```bash
npm install
npm run seed
```

The seed creates **admin@lumo.dev** (admin) and **publisher@lumo.dev** (publisher), 12 assets
across all six categories with real zips uploaded to Storage, ratings and download counters.
Password: `SEED_PASSWORD` (default `lumo-demo-2026`).

> **Authentication:** in *Authentication → Providers → Email* disable "Confirm email" if you
> want instant signups during local development.

---

## 2. Import the repo into Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import Git Repository** (zero config, Next.js is detected).
3. Add the environment variables below (Production + Preview + Development).
4. Deploy.

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side writes + Storage uploads |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical URLs and Open Graph tags |
| `STORE_API_KEY` | ⚙️ | Machine credential (`X-API-Key`) for the desktop app / CI |
| `CORS_ORIGINS` | ⚙️ | Comma-separated allowed origins (empty = allow any) |
| `SEED_PASSWORD` | local only | Password used by `npm run seed` |

Copy [`.env.example`](.env.example) to `.env.local` for local development.

---

## 3. Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run seed                 # optional demo data
npm run dev                  # http://localhost:3000
```

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

---

## REST API v1

Full reference lives at **`/api-docs`** (and in [`content/api`](content/api)).

| Method | Endpoint | Auth |
| --- | --- | --- |
| GET | `/api/assets?category=&q=&page=&sort=&price=&perPage=` | public |
| GET | `/api/assets/[id]` (id **or** slug) | public |
| GET | `/api/assets/[id]/download` | public (paid → login) |
| POST | `/api/assets` (multipart form) | Bearer JWT / `X-API-Key` |
| PATCH | `/api/assets/[id]` | owner / admin |
| POST | `/api/auth/signup` → `{ token, user }` | public |
| POST | `/api/auth/login` → `{ token, user }` | public |
| GET | `/api/admin/queue?status=pending` | admin / `X-API-Key` |
| PATCH | `/api/admin/assets/[id]` `{action: approve\|reject\|feature\|unfeature}` | admin / `X-API-Key` |
| GET/PATCH | `/api/admin/users[/:id]` | admin / `X-API-Key` |
| GET | `/api/admin/stats` | admin / `X-API-Key` |

Errors always use the same envelope:

```json
{ "error": { "code": "invalid_category", "message": "…" } }
```

---

## Data model

```text
users    (id, email, username, handle, avatar_url, role, banned, bio, website, created_at)
assets   (id, author_id, title, slug, description, category, tags[], price, license,
          version, file_url, thumbnail_url, file_size, downloads, status,
          featured, review_note, created_at)
ratings  (id, asset_id, user_id, stars)          -- display only, phase 2
assets_public  -- view: approved catalogue + aggregated rating
```

Status workflow: `draft → pending → approved | rejected` (rejections carry a `review_note`
shown to the author on their dashboard).

---

## Project structure

```text
content/
  docs/                 markdown for /docs
  api/                  markdown for /api-docs
scripts/
  seed.ts               demo users, 12 assets, ratings
  zip.ts                tiny zip writer used by the seed
supabase/migrations/
  0001_init.sql         schema, RLS, storage buckets, helpers
src/
  app/                  App Router pages + /api routes
  components/           UI (layout, assets, store, dashboard, admin, docs…)
  lib/                  supabase clients, queries, auth, api wrappers, seo
```

---

## Notes & v1 limits

- **No real payments.** Paid assets are display-only price tags: the download button is gated
  behind login, nothing is charged.
- **Uploads** go through the serverless API (`POST /api/assets`). Vercel caps request bodies at
  4.5 MB on the default plan — for bigger packs upload directly to the `assets` bucket and send
  `file_url` instead, or raise the limit on a paid plan.
- **`STORE_API_KEY` is admin-equivalent.** It exists so the desktop editor can call the API
  without a browser session — keep it secret.
- **Ratings** are stored and displayed (stars on cards/detail, `sort=rating`), but there is no
  submission UI yet (phase 2).
- Everything renders as static pages + serverless functions — no custom server, no Docker.

---

## License

MIT for this repository. Individual store assets keep the license shown on their page.
