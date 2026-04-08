# AGENTS.md

## Project Snapshot

- Full-stack monorepo: Laravel 13 backend + Angular 21 SPA.
- Backend code lives in `src/` (not `app/`), configured in `bootstrap/app.php` via `useAppPath('../src')`.
- Frontend source is `public/src`; build output is `webroot/` (see `public/angular.json`).
- Existing AI guidance files were searched with the requested glob; only `README.md` exists, and it is currently empty.

## Architecture and Data Flow

- HTTP entrypoint is API-only routing in `routes/api.php`; health endpoints: `/api/health`.
- Public catalog flow: controllers (`src/Http/Controllers/Api/*`) -> Eloquent models (`src/Models/*`) -> API resources (
  `src/Http/Resources/*`).
- Admin write operations are policy-gated and mostly use `AdminRequest` (`src/Http/Requests/AdminRequest.php`) for role
  checks.
- Session auth is explicit on API routes: `StartSession` middleware wraps `/session`, `/login`, `/register`, then `auth`
  protects admin/profile endpoints.
- Angular app boot (`public/src/main.ts`) initializes auth on startup and injects locale header interceptor for every
  request.

## Domain Rules You Should Preserve

- Order invariants are observer-driven: `OrderObserver` timestamps status/payment transitions; `OrderItemObserver`
  recalculates subtotal/total.
- Order numbers come from `OrderService::generateOrderNumber()`; do not bypass this when creating orders.
- Product/category/ingredient localization is model/resource-driven (`HasTranslationConfig`, `ResolvesTranslatedValue`)
  using `lang/en/catalog.php` and `lang/uk/catalog.php`.
- File uploads use `App\Helpers\FileUpload` and the `public` disk; resources convert storage paths to URLs via
  `FileUpload::publicUrl()`.
- Soft deletes are common in catalog/order tables; validation often excludes soft-deleted rows with
  `whereNull('deleted_at')`.

## Developer Workflows (Verified From Repo)

- Initial backend setup: `make setup` (copies `.env`, installs deps, generates key, migrates, seeds).
- Run backend tests: `make test` (wrapper for `php vendor/bin/phpunit`).
- Container lifecycle: `make build`, `make up`, `make down`, `make restart`; bash access via `make php`, `make web`,
  `make db`.
- Frontend (run in `public/`): `npm run start`, `npm run build`, `npm run build:prod`.
- Frontend builds target `../webroot` with `deleteOutputPath: false`; avoid manual cleanup assumptions during
  build/debug.

## Conventions and Patterns

- Use strict types in PHP files (`declare(strict_types=1);`) and keep namespaces under `App\` matching `src/` paths.
- Controllers are thin: validation in FormRequests, authorization via policies, response shape via JsonResources.
- Keep eager-loading explicit (`with([...])`) before serializing resources to avoid relation-dependent shape
  regressions.
- Add/modify policy mappings in `src/Providers/AppServiceProvider.php` when introducing new protected models.
- Follow formatting with Pint (`pint.json`, Laravel preset with custom docblock rule toggles).
- Follow formatting with PSR-12

## Integrations and Environment

- Primary DB in runtime is PostgreSQL (`compose.yaml`), while tests run sqlite in-memory (`phpunit.xml`).
- Nginx serves SPA + API from one host (`.docker/conf/nginx/default.conf`) with `/api` routed to `index.php`.
- Localization accepts `Accept-Language` and supports `en`/`uk` (`config/laravellocalization.php`, `SetRequestLocale`
  middleware).
- Deployment script (`deploy.sh`) runs `composer deploy` (migrate + optimize clear + config/route cache).

