# Sofubi opportunity database — Hong Kong & Taiwan

Reference date and access date: **2026-10-20**, Asia/Hong_Kong.

This database supports a Hong Kong artist launching approximately 40 original sofubi toys in two colourways. It distinguishes confirmed year-end events, historical editions, and prospective retail/community relationships. **No organizers were contacted, no applications submitted, and no website built.**

The user subsequently requested no final ranking and no further validation of minor historical records. Consequently, the files preserve verification levels and five analyst evaluation fields but contain no overall ranking.

## Files and relationships

| File | Unit of record / purpose |
|---|---|
| `events.csv` | One event edition or separately dated tour/market stop |
| `event_series.csv` | Series/programme grouping, recurrence evidence and linked editions |
| `organizers.csv` | Organizers, co-organizers, galleries, shops, artists and collectives; type distinguishes their roles |
| `sources.csv` | Evidence URL, access method, established facts and limitations |
| `priority_2026.csv` | Confirmed events overlapping 1 November–31 December 2026; unranked |
| `relationships.csv` | Typed connections such as co-organizer, venue, artist participation or represented booth |
| `leads_to_verify.csv` | Undated or insufficiently verified discovery leads, separate from event totals |
| `research_log.md` | Methods, coverage and material limitations |
| `report.md` | Human-readable findings, Parts A–G |
| `taiwan_participation.md` | Evidence-backed Taiwan entry/import/selling questions |
| `statistics.json` | Machine-readable counts from the final tables |

Primary keys: `event_id`, `event_series_id`, `organizer_id`, `source_id`, `relationship_id`, `lead_id`. Keep these stable when updating. Semicolon-delimited ID lists represent one-to-many links, not nested JSON. A web application can normalize those lists into junction tables. Relationship endpoints may be event or organizer IDs.

`organizers.csv.associated_events` lists events where that entity is the principal organizer record. Additional roles appear in `relationships.csv`. A named entity is not necessarily offering an application, representation, or consignment service.

## Data conventions

- UTF-8 CSV with BOM for Excel, comma separator, CRLF endings and quoted fields.
- Snake-case headers. Dates are ISO `YYYY-MM-DD`; missing dates are the literal `UNKNOWN`, never invented first-of-month placeholders.
- `UNKNOWN` means not established, not zero, free, ineligible or unavailable. Convert it to `null` when importing into a typed database.
- Amounts use original currencies: `TWD` and `HKD`. No currency conversion or travel-price estimate is supplied.
- `fee_amount` is the stated booth charge only. `fee_basis` explains duration and historical applicability. Read `booth_fees` for qualifications. A refundable deposit is **not** a booth price.
- Visitor tickets are not stored as booth fees or used as exhibitor registration routes.
- `official_website` may be an organizer homepage/social page where no event-specific website exists.
- `date_last_verified` means the record was reviewed against the stated evidence on that date. It does not mean every field was verified with the organizer.
- `source_ids` attach evidence to the record. `what_source_establishes` limits the claims supported by each source; an event-date source does not automatically support prices or eligibility.

## Event status fields

`temporal_status`:

- `PAST`: historical edition; participation is no longer possible. Year-only historical entries retain UNKNOWN exact dates.
- `FUTURE`: a dated edition after the reference date, subject to its evidence level.

`opportunity_status` implements the requested A–E classification:

| Code | Meaning |
|---|---|
| A | Confirmed dates plus a current public exhibitor application pathway; acceptance and remaining capacity are not guaranteed |
| B | Confirmed event; published deadline/closure notice shows public registration closed |
| C | Confirmed event; application status unknown |
| D | Confirmed event with a documented alternative route, here a waitlist |
| E | Historical edition or no verified future edition |

**Read `application_status` alongside the code.** White Market is `OPEN_PUBLIC_FORM_CONDITIONAL`: the public first section is accessible, but later sections require an email and were not entered. Fees, stock acceptance and capacity remain UNKNOWN. HKICS2027 is `OPEN_ANNOUNCED_LOGIN_REQUIRED`, based on its current published application window; no account was created.

A future record with only indexed evidence may retain C as its application-state category, but its date evidence is not sufficient for the confirmed shortlist. Never display it as “confirmed” without also applying the date-confirmation filter.

`date_confirmation_status`:

- `PRIMARY_VERIFIED`: live organizer/venue rules or participating-artist source inspected. Whampoa additionally uses a matching secondary year reference.
- `SECONDARY_VERIFIED`: readable secondary report, not organizer confirmation.
- `INDEXED_PRIMARY_ONLY` / `INDEXED_SECONDARY_ONLY`: search-index extract inspected; full page body not verified.
- `START_ONLY_VERIFIED`: an opening date is known; closing date remains UNKNOWN.
- `YEAR_ONLY_2023` etc.: edition identity/year known; exact dates unverified.

`confidence_level` is a record-level summary, not a warranty. HIGH usually means strong primary support for identity/date; MEDIUM reflects secondary evidence or a material unresolved field; LOW identifies discovery-stage records. Application availability always needs its own evidence.

## Shortlist filter and counts

The shortlist includes events whose date range overlaps `2026-11-01`–`2026-12-31` and whose dates passed the primary-evidence gate. Events starting 31 October are included because 1 November is within the requested window; they may require participation on both days.

It excludes historical events, undated Huashan Town options, the index-only Taichung design fair, and HKICS2027. A public 2027 application is actionable planning, but it does not fulfil the immediate 2026 objective.

“Event series” includes one-off named programmes so each edition has a consistent grouping key; it does not imply all 39 series recur. The historical-recurring count uses recorded recurring, numbered, repeated, touring or multi-venue patterns. Read each `recurrence_status`; it does not announce a future edition.

Hong Kong/Taiwan and Tier A/B/C totals count **edition rows**, not organizers or deduplicated audiences. A touring artist show has separate rows for separate cities. ToyTaste2026 is one subevent record, not duplicated as both ToyTaste and its parent design fair. TTF, Taipei Toy Show and TMTC are distinct.

## Five analyst scores

Each score is 1–5 with a separate reason column. These are reasoned screening judgments, not measured visitor quality, acceptance probability or sales forecasts:

- Audience fit: 1 weak overlap → 5 dedicated original/collectible-toy community.
- Accessibility: 1 closed/invited-only → 5 clearly accessible small-creator intake. Unknown rules generally score2; visible conditional/waitlist paths generally3.
- Networking: 1 limited relevant contacts → 5 concentrated artists/collectors/retailers.
- Commercial: 1 weak purchase context → 5 strong collector buying context. Unverified fees and outcomes constrain judgments.
- Practicality: 1 difficult → 5 straightforward for a small HK artist. Local events avoid overseas logistics; Taiwan entries remain constrained by travel/import/selling questions.

Historical scores describe the **format for future consideration**, not a chance to enter a past event. Scores are not summed and no overall rank is provided.

## Update workflow

1. Start with the organizer/source URLs, not an aggregator’s predicted annual dates.
2. Create a new edition ID only after establishing a real new edition. Retain the existing series ID.
3. Inspect dated application terms and closure notices; a lingering “Apply Now” button is insufficient.
4. Record prices separately from deposits, furniture, taxes and visitor tickets.
5. Confirm original toy eligibility, first-time criteria, overseas eligibility and any sharing permission.
6. Keep the old evidence row when dates/rules change; add a source and explain the change.
7. Recalculate the shortlist and statistics from event records after updates.
8. Recheck unique IDs, foreign keys, date order, score bounds and duplicated series/date/venue combinations.

For a future website, show source/access date, evidence level and unknown fields prominently. Default the immediate-opportunity view to `priority_2026.csv`; keep retailer leads and historical records in separate views. Do not infer “applications open” from a link or treat a gallery address as an invitation.
