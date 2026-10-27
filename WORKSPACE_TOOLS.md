# Site Knight workspace tools

The existing scanner is extended with private saved scan summaries, an email preflight checker, shared page feedback/approval and content request checklists. No AI API is used.

## Storage and access

- A cryptographically random 256-bit recovery key is stored in the browser. The server stores its SHA-256 digest, never the raw key.
- Each free workspace holds one website and the latest two scan summaries. IndexedDB is the local fallback; explicit saves also write to D1 with optimistic revision checks.
- Backups include the recovery key. Anyone holding it can access that workspace; treat it as a password. Account-based recovery is not implemented.
- Page sharing is explicit. A separate random capability link exposes only that page snapshot and its content requests, not the private workspace. Review links expire after 30 days and owners can revoke them. Names and approval statements are self-reported, not authenticated signatures.
- Review events are append-only and bounded to 300 per link. Content collection accepts copy and asset URLs, not file uploads.

## Monitoring

The hourly trigger processes up to three due workspaces. Each enabled monitor checks at most ten same-site URLs once per 24 hours, comparing server-delivered text, titles and outgoing link lists. The initial check establishes a baseline. A failed fetch preserves its old baseline and is reported unverified. Results appear in the app, with no email or push delivery. This is not a full background grammar/visual scan. Full scans still use the browser.

## Email checker

Copy rules, merge tokens, relative/missing URLs, alt text, HTML size and selected CSS support risks are checked locally. The preview is sandboxed, blocks remote assets and strips active content. Explicit destination checks submit only URLs to the existing link checker. This is not actual inbox rendering and does not certify compliance or deliverability.

## Deployment and validation

`wrangler.jsonc` binds `SK_DB` to the workspace D1 database and defines the hourly cron. The schema is in `migrations/0001_workspaces.sql`; it is idempotent and was initialized before this release. No billing plan was changed.

Run browser regression tests with Node 24+ and Playwright installed:

```
node tests/workspace.cjs
node tests/report-navigation.cjs
```

Optional `SITEKNIGHT_PLAYWRIGHT` selects a Playwright module path and `SITEKNIGHT_CHROME` an installed browser. Workspace tests use an isolated in-memory SQLite implementation of the D1 prepared-statement contract, including the scheduled handler with a controlled fetch fixture. They exercise the UI, independent-browser sharing, revision conflicts, origin protection, page pins and persistence.
