import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  availability,
  csvText,
  emptyFilters,
  filterEvents,
  isDate,
  mergeFiles,
  parseCsv,
  priority,
  provisional,
  safeUrl,
  tables,
  temporal,
  validateDataset,
  validateTracking,
} from "./data.ts";
import type { Dataset, Row } from "./data.ts";
const d = {} as Dataset;
for (const name of tables)
  d[name] = parseCsv(
    await readFile(
      new URL(`../public/data/${name}.csv`, import.meta.url),
      "utf8",
    ),
    name,
  );
const event = (id: string) => d.events.find((e) => e.event_id === id)!;
test("real baseline has complete foreign keys and original record counts", () => {
  validateDataset(d);
  assert.equal(d.events.length, 56);
  assert.equal(d.event_series.length, 39);
  assert.equal(d.organizers.length, 36);
  assert.equal(d.sources.length, 61);
});
test("year-end dates and evidence gate reproduce the eight researched entries", () => {
  assert.deepEqual(
    priority(d)
      .map((e) => e.event_id)
      .sort(),
    d.priority_2026.map((e) => e.event_id).sort(),
  );
  assert.equal(priority(d).length, 8);
  assert.ok(
    !priority(d).some((e) => e.event_id === "E021" || e.event_id === "E054"),
  );
});
test("conditional, waitlist, login and closed statuses remain distinct", () => {
  assert.equal(availability(event("E017")), "Conditional");
  assert.equal(availability(event("E014")), "Waitlist");
  assert.equal(availability(event("E019")), "Closed");
  assert.equal(availability(event("E054")), "Open");
  assert.equal(availability(event("E001")), "Unknown");
});
test("dates are interpreted as calendar dates and invalid dates rejected", () => {
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2028-02-29"), true);
  assert.equal(temporal(event("E017"), "2026-11-01"), "Confirmed upcoming");
  assert.equal(temporal(event("E017"), "2026-11-02"), "Historical");
  assert.equal(availability(event("E014"), "2027-01-01"), "Historical");
  assert.equal(temporal(event("E021"), "2026-10-20"), "Unconfirmed");
  assert.equal(temporal(event("E047"), "2026-10-20"), "Historical");
});
test("filters combine and reset without losing the baseline", () => {
  const filtered = filterEvents(
    d.events,
    {
      ...emptyFilters,
      region: "Taiwan",
      application: "Waitlist",
      time: "Confirmed upcoming",
      from: "2026-12-01",
      to: "2026-12-31",
    },
    "2026-10-20",
  );
  assert.deepEqual(
    filtered.map((e) => e.event_id),
    ["E015", "E016"],
  );
  assert.equal(filterEvents(d.events, emptyFilters, "2026-10-20").length, 56);
  assert.equal(
    filterEvents(
      d.events,
      { ...emptyFilters, q: "does-not-exist" },
      "2026-10-20",
    ).length,
    0,
  );
});
test("provisional attention order is available to inspect", () => {
  const rows = priority(d).sort((a, b) => provisional(a, b, "2026-10-20"));
  assert.equal(rows[0].event_id, "E017");
  assert.ok(rows.slice(1, 4).every((e) => availability(e) === "Waitlist"));
  assert.ok(rows.slice(-2).every((e) => availability(e) === "Closed"));
});
test("CSV roundtrip preserves commas, quotes and multiline notes", () => {
  const rows = [
    { ...event("E001"), recommended_next_action: 'One, two\n"Quoted" detail' },
  ];
  assert.deepEqual(parseCsv(csvText(rows), "events"), rows);
});
test("malformed, duplicated and incomplete CSV imports are rejected", () => {
  assert.throws(
    () => parseCsv("event_id,official_name\nE001,Test", "events"),
    /missing required/,
  );
  assert.throws(
    () => parseCsv(csvText([event("E001"), event("E001")]), "events"),
    /duplicate ID/,
  );
  assert.throws(
    () =>
      parseCsv(
        csvText([{ ...event("E001"), audience_fit_score: "9" }]),
        "events",
      ),
    /1–5/,
  );
  assert.throws(
    () =>
      parseCsv(
        csvText([{ ...event("E001"), event_date_start: "2026-02-30" }]),
        "events",
      ),
    /YYYY-MM-DD/,
  );
  assert.throws(
    () =>
      parseCsv(
        csvText([
          { ...event("E001"), official_website: "javascript:alert(1)" },
        ]),
        "events",
      ),
    /invalid/,
  );
  assert.throws(
    () => parseCsv("event_id,event_id\nE001,E001", "events"),
    /duplicate column/,
  );
});
test("upserts preserve stable IDs and reject broken dependencies atomically", async () => {
  const next = {
    ...event("E001"),
    recommended_next_action: "Updated local research",
  };
  const merged = await mergeFiles(d, [
    new File([csvText([next])], "events.csv"),
  ]);
  assert.equal(merged.data.events.length, 56);
  assert.equal(
    merged.data.events.find((e) => e.event_id === "E001")
      ?.recommended_next_action,
    "Updated local research",
  );
  assert.notEqual(
    event("E001").recommended_next_action,
    "Updated local research",
  );
  await assert.rejects(
    () =>
      mergeFiles(d, [
        new File(
          [csvText([{ ...next, organizer_id: "O_MISSING" }])],
          "events.csv",
        ),
      ]),
    /organizer/,
  );
});
test("private backups validate and retain records missing from the current edition", () => {
  const record = {
    bookmarked: true,
    status: "Applied",
    notes: "Private note",
    followUp: "2026-11-10",
    updatedAt: "2026-10-20T00:00:00Z",
  };
  const tracking = { E001: record, E_ORPHAN: record };
  assert.deepEqual(validateTracking(tracking), tracking);
  assert.throws(
    () => validateTracking({ E001: { ...record, status: "Invented" } }),
    /Invalid/,
  );
  assert.throws(
    () => validateTracking({ E001: { ...record, followUp: "tomorrow" } }),
    /Invalid/,
  );
});
test("untrusted CSV links cannot execute code", () => {
  assert.equal(safeUrl("javascript:alert(1)"), undefined);
  assert.equal(safeUrl("data:text/html,test"), undefined);
  assert.equal(safeUrl("https://example.com/"), "https://example.com/");
});
