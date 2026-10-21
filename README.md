# Toy Market Radar

An independent field guide to sofubi, designer toy and creative-market opportunities in Hong Kong and Taiwan. React, TypeScript and Vite; static GitHub Pages deployment with no backend.

## Run locally

Use Node24 and npm. Run `npm ci`, then `npm run dev`. Open the printed URL including `/toy-market-radar/`. `npm test` runs the domain/data-integrity suite; `npm run build` type-checks and builds `dist/`; `npm run preview` serves the production build locally.

## What is included

- Editorial homepage with all eight November–December2026 records and dynamically computed totals.
- Search, region/city/category/tier/status/date/score filters; cards/table; five sorting modes.
- Hash-routed event details with original facts, analyst assessments, all linked sources and limits.
- Timeline for confirmed events, application deadlines, historical editions and undated future monitoring.
- Organizer directory with documented event and network relationships.
- Private bookmarks, application status, notes and follow-up dates, stored in browser localStorage.
- CSV upsert import, validation, research export, and separate private JSON backup/restore.

## Research and trust

The seven CSV tables are in `public/data/`; Markdown notes are in `public/research/`. The baseline has56 editions,39 series/programmes,36 entities and62 sources. UI totals are calculated, not hardcoded. Test assertions document this baseline so deliberate dataset changes should update the corresponding test expectations.

Correction verified 2026-10-21: the user supplied the ATS Instagram-bio form omitted during initial research. Its complete content was read in authenticated Chrome. ATS now has a reviewed application route, sign-in requirement, published table/booth rates and direct email (S062). The early-bird cutoff, remaining capacity, sharing and application deadline remain unknown. No application was submitted.

Research reference date:2026-10-20. Website development did not repeat the original investigation or independently confirm availability. `UNKNOWN` values remain unknown. A conditional form or waitlist is never labelled as guaranteed registration. Date evidence is separate from application evidence. Some dates rely on indexed sources or incomplete historical validation.

View-as-of dates use Hong Kong calendar dates. The default is the browser's current date in Asia/Hong_Kong; the date control supports reviewing the research snapshot. Past events change to Historical in the current view, while detail pages retain the application status recorded at verification. The fixed2026 priority section remains an archival shortlist after that window passes.

The homepage's provisional order uses availability (listed open window, conditional, waitlist, unknown, closed, historical), then collector score, practicality score and nearest deadline/event date. It is an analyst aid, not an objective ranking. Category filters are a disclosed derivation from name/category/tier; original category text stays in event details.

## Update data without changing application source

### Browser-only updates

1. Export the desired table in Research & data, or use the baseline CSV.
2. Edit it in Excel/Sheets, preserving the filename, headers and stable IDs. Use ISO dates or UNKNOWN; scores1–5.
3. Select one or more CSVs in Research & data → Validate & import. Include dependent tables when adding a new series, organizer or source.
4. Matching IDs update existing records; new IDs append. Duplicate input IDs, missing columns, unsafe links, invalid dates/scores and missing foreign keys are rejected. Imports are atomic; invalid input does not partially update the research.
5. Updates persist on this browser only. Personal tracking remains separate and retains its original event IDs.

Import is an upsert, not a deletion mechanism. To discard browser research overrides, use Restore baseline research; personal tracking is retained. Storage failures are reported rather than claiming persistence. Unknown tracking IDs are preserved for backup/restoration.

### Permanent public updates

Replace matching files in `public/data/` using GitHub's file editor or a local checkout, preserving table headers and stable IDs. Update source/date fields honestly. Update accompanying research notes and baseline test counts when appropriate. Commit/push to `main`; GitHub Actions installs, tests, builds and deploys Pages. Never copy private tracking backups into this repository.

The November–December shortlist and series totals are computed from current event records, not hardcoded IDs. `priority_2026.csv` preserves the original shortlist as source material; after updating event records, also update this companion export for consistency. Add new fields only when extending the schema and UI intentionally. To add events using existing schema, no application source changes are required.

Research exports escape spreadsheet formula prefixes and use UTF-8 BOM and quoted CSV fields. Ordinary commas, quotes and multiline values roundtrip. Values starting with formula characters may gain a protective apostrophe for spreadsheet safety.

## Privacy and backups

Private tracking uses `tmr.tracking.v1`; local imported research uses `tmr.research.v1`. The application contains no backend submission, email integration, analytics or account system. Notes are not uploaded. Browser-local does not mean encrypted: anyone with access to the browser profile can access that storage. Clearing site data removes local records; export a private JSON backup regularly. Restore merges backup records by event ID.

Do not publish private notes, backups, credentials, API keys, personal Gmail details or `.env` files. Public dataset contacts are organizer/artist professional contacts from the supplied research. Typography optionally loads Google Fonts; system fonts provide a fallback.

## GitHub Pages

`.github/workflows/deploy.yml` runs on pushes to main or manual dispatch. Repository Settings → Pages → Source must be GitHub Actions. The workflow sets Vite's base to the actual repository name and deploys `dist/`. Hash routes work on static Pages and direct refreshes without rewrite rules. The default local base is `/toy-market-radar/`; set `BASE_PATH` when building for a different repository/custom domain.

## QA

`npm test` covers baseline relationships, the8-event evidence gate, status preservation, date boundaries, combined filters, provisional ordering, CSV quoting/invalid imports, atomic stable-ID updates, private-backup validation and unsafe links. Browser QA also checks real rendering, search/filter controls, detail sources, notebook persistence and responsive layout. Deployment must be verified at its actual URL before any completion notification is sent.
