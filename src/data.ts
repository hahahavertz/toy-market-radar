import Papa from "papaparse";
import schemas from "./schema.json" with { type: "json" };

export type Row = Record<string, string>;
export type Table = keyof typeof schemas;
export type Dataset = { [K in Table]: Row[] };
export const tables = Object.keys(schemas) as Table[];
export const keys: Record<Table, string> = {
  events: "event_id",
  organizers: "organizer_id",
  sources: "source_id",
  event_series: "event_series_id",
  relationships: "relationship_id",
  leads_to_verify: "lead_id",
  priority_2026: "event_id",
};
export const referenceDate = "2026-10-20";
export const trackingStates = [
  "Interested",
  "Contacted",
  "Applied",
  "Accepted",
  "Rejected",
  "Attended",
  "Not Pursuing",
] as const;
export type TrackingState = (typeof trackingStates)[number];
export interface Tracking {
  bookmarked: boolean;
  status: TrackingState;
  notes: string;
  followUp: string;
  updatedAt: string;
}
export type Tracker = Record<string, Tracking>;
export const DATA_KEY = "tmr.research.v1",
  TRACK_KEY = "tmr.tracking.v1";
export const known = (v?: string) => !!v && v !== "UNKNOWN";
export const display = (v?: string) => (known(v) ? v! : "Unknown");
export const ids = (v?: string) =>
  known(v) ? v!.split(";").filter(Boolean) : [];
export const todayHK = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function isDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
}
export function dateText(v: string) {
  return isDate(v)
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Hong_Kong",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(v + "T00:00:00+08:00"))
    : "Unknown";
}
export function dates(e: Row) {
  if (!isDate(e.event_date_start))
    return (
      (e.date_confirmation_status.match(/YEAR_ONLY_(\d{4})/)?.[1] ||
        "Dates unknown") + " · exact dates unknown"
    );
  return (
    dateText(e.event_date_start) +
    (e.event_date_end === e.event_date_start
      ? ""
      : ` — ${isDate(e.event_date_end) ? dateText(e.event_date_end) : "end unknown"}`)
  );
}
export function isConfirmed(e: Row) {
  return ["PRIMARY_VERIFIED", "CORROBORATED_PRIMARY_SECONDARY"].includes(
    e.date_confirmation_status,
  );
}
export function temporal(e: Row, asOf: string) {
  const end = isDate(e.event_date_end) ? e.event_date_end : e.event_date_start;
  if (isDate(end) && end < asOf) return "Historical";
  if (isDate(e.event_date_start) && isConfirmed(e)) return "Confirmed upcoming";
  if (e.temporal_status === "PAST" && !isDate(e.event_date_start))
    return "Historical";
  return "Unconfirmed";
}
export type Availability =
  "Open" | "Conditional" | "Waitlist" | "Closed" | "Unknown" | "Historical";
export function availability(e: Row, asOf?: string): Availability {
  if (asOf && temporal(e, asOf) === "Historical") return "Historical";
  if (e.application_status === "HISTORICAL_ENDED") return "Historical";
  if (e.application_status.includes("CONDITIONAL")) return "Conditional";
  if (e.application_status.includes("WAITLIST")) return "Waitlist";
  if (e.application_status.startsWith("CLOSED")) return "Closed";
  if (e.application_status.startsWith("OPEN")) return "Open";
  return "Unknown";
}
export function statusLabel(e: Row, asOf: string) {
  const a = availability(e, asOf);
  if (a === "Open" && e.application_status === "OPEN_REVIEWED_FORM_LOGIN_REQUIRED")
    return "Apply for review · login required";
  return a === "Open" && e.application_status.includes("LOGIN")
    ? "Window listed · login required"
    : a === "Conditional"
      ? "Conditional form"
      : a === "Waitlist"
        ? "Waitlist only"
        : a === "Unknown"
          ? "Intake unknown"
          : a === "Closed"
            ? "Applications closed"
            : a;
}
export function category(e: Row) {
  const text = e.official_name + " " + e.category;
  return /sofubi|sofvi|ソフビ|軟膠|NU-DE|GARGAMEL|ELEGAB|GID|NIGIRU/i.test(text)
    ? "Sofubi"
    : e.relevance_tier === "A" || /TOY|POPUP|RETAIL/i.test(e.category)
      ? "Designer Toy"
      : e.relevance_tier === "B" || /CREATIVE_MARKET/i.test(e.category)
        ? "Art Market"
        : "Other";
}
export function priority(d: Dataset) {
  return d.events.filter(
    (e) =>
      isDate(e.event_date_start) &&
      isDate(e.event_date_end) &&
      e.event_date_start <= "2026-12-31" &&
      e.event_date_end >= "2026-11-01" &&
      isConfirmed(e),
  );
}
export function provisional(a: Row, b: Row, asOf: string) {
  const w: Record<Availability, number> = {
    Open: 5,
    Conditional: 4,
    Waitlist: 3,
    Unknown: 2,
    Closed: 1,
    Historical: 0,
  };
  return (
    w[availability(b, asOf)] - w[availability(a, asOf)] ||
    Number(b.audience_fit_score) - Number(a.audience_fit_score) ||
    Number(b.practicality_score) - Number(a.practicality_score) ||
    (isDate(a.application_deadline)
      ? a.application_deadline
      : a.event_date_start
    ).localeCompare(
      isDate(b.application_deadline)
        ? b.application_deadline
        : b.event_date_start,
    )
  );
}
export function safeUrl(v?: string) {
  try {
    const u = new URL(v || "");
    return ["https:", "http:", "mailto:"].includes(u.protocol)
      ? u.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function contactUrl(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "mailto:" + v : safeUrl(v);
}
export interface Filters {
  q: string;
  region: string;
  city: string;
  kind: string;
  tier: string;
  time: string;
  application: string;
  from: string;
  to: string;
  audience: string;
  access: string;
  sort: string;
}
export const emptyFilters: Filters = {
  q: "",
  region: "",
  city: "",
  kind: "",
  tier: "",
  time: "",
  application: "",
  from: "",
  to: "",
  audience: "",
  access: "",
  sort: "date",
};
export function filterEvents(events: Row[], f: Filters, asOf: string) {
  return events
    .filter(
      (e) =>
        (!f.q ||
          [e.official_name, e.alternative_names, e.city, e.venue, e.category]
            .join(" ")
            .toLocaleLowerCase()
            .includes(f.q.toLocaleLowerCase())) &&
        (!f.region || e.region === f.region) &&
        (!f.city || e.city === f.city) &&
        (!f.kind || category(e) === f.kind) &&
        (!f.tier || e.relevance_tier === f.tier) &&
        (!f.time || temporal(e, asOf) === f.time) &&
        (!f.application || availability(e, asOf) === f.application) &&
        (!f.from ||
          ((isDate(e.event_date_end || "")
            ? e.event_date_end
            : e.event_date_start) >= f.from &&
            isDate(e.event_date_start))) &&
        (!f.to || (isDate(e.event_date_start) && e.event_date_start <= f.to)) &&
        (!f.audience || Number(e.audience_fit_score) >= Number(f.audience)) &&
        (!f.access || Number(e.accessibility_score) >= Number(f.access)),
    )
    .sort((a, b) => {
      const asc = (key: string) =>
        (isDate(a[key]) ? a[key] : "9999").localeCompare(
          isDate(b[key]) ? b[key] : "9999",
        );
      if (f.sort === "deadline") return asc("application_deadline");
      if (f.sort === "audience")
        return Number(b.audience_fit_score) - Number(a.audience_fit_score);
      if (f.sort === "practicality")
        return Number(b.practicality_score) - Number(a.practicality_score);
      if (f.sort === "verified")
        return b.date_last_verified.localeCompare(a.date_last_verified);
      const ta =
          temporal(a, asOf) === "Confirmed upcoming"
            ? 0
            : temporal(a, asOf) === "Unconfirmed"
              ? 1
              : 2,
        tb =
          temporal(b, asOf) === "Confirmed upcoming"
            ? 0
            : temporal(b, asOf) === "Unconfirmed"
              ? 1
              : 2;
      return ta - tb || asc("event_date_start");
    });
}
export function parseCsv(text: string, table: Table): Row[] {
  const rawHeaders =
    Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), { preview: 1 }).data[0] ||
    [];
  if (new Set(rawHeaders.map((h) => h.trim())).size !== rawHeaders.length)
    throw Error(`${table}: duplicate column names.`);
  const parsed = Papa.parse<Row>(text.replace(/^\uFEFF/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  if (parsed.errors.length)
    throw Error(
      `${table}: ${parsed.errors[0].message} (row ${(parsed.errors[0].row ?? 0) + 2})`,
    );
  const headers = parsed.meta.fields || [];
  if (new Set(headers).size !== headers.length)
    throw Error(`${table}: duplicate column names.`);
  for (const column of schemas[table])
    if (!headers.includes(column))
      throw Error(`${table}: missing required column "${column}".`);
  if (!parsed.data.length) throw Error(`${table}: file contains no records.`);
  const seen = new Set<string>();
  parsed.data.forEach((r, i) => {
    const id = r[keys[table]];
    if (!id || id === "UNKNOWN")
      throw Error(`${table} row ${i + 2}: stable ID is required.`);
    if (seen.has(id)) throw Error(`${table}: duplicate ID ${id}.`);
    seen.add(id);
    for (const [key, value] of Object.entries(r)) {
      if (typeof value !== "string")
        throw Error(`${table} row ${i + 2}: malformed value.`);
      if (
        (key.endsWith("_date") ||
          key.startsWith("event_date_") ||
          key === "date_last_verified" ||
          key === "date_accessed" ||
          key === "application_deadline") &&
        known(value) &&
        !isDate(value)
      )
        throw Error(
          `${table} row ${i + 2}: ${key} must be YYYY-MM-DD or UNKNOWN.`,
        );
      if (key.endsWith("_score") && !/^[1-5]$/.test(value))
        throw Error(`${table} row ${i + 2}: ${key} must be 1–5.`);
      if (key === "fee_amount" && known(value) && !/^\d+(\.\d+)?$/.test(value))
        throw Error(
          `${table} row ${i + 2}: fee_amount must be a nonnegative number or UNKNOWN.`,
        );
      if (
        (key.endsWith("_url") ||
          ["official_website", "instagram", "facebook", "source_url"].includes(
            key,
          )) &&
        known(value) &&
        !safeUrl(value)
      )
        throw Error(`${table} row ${i + 2}: unsafe or invalid ${key}.`);
    }
    if (table === "events") {
      if (!["A", "B", "C"].includes(r.relevance_tier))
        throw Error(`${id}: relevance_tier must be A, B or C.`);
      if (!["A", "B", "C", "D", "E"].includes(r.opportunity_status))
        throw Error(`${id}: opportunity_status must be A–E.`);
      if (!["PAST", "FUTURE"].includes(r.temporal_status))
        throw Error(`${id}: invalid temporal_status.`);
      if (!["HIGH", "MEDIUM", "LOW"].includes(r.confidence_level))
        throw Error(`${id}: invalid confidence_level.`);
      if (
        isDate(r.event_date_start) &&
        isDate(r.event_date_end) &&
        r.event_date_start > r.event_date_end
      )
        throw Error(`${id}: end date precedes start date.`);
    }
  });
  return parsed.data;
}
export function validateDataset(d: Dataset) {
  for (const name of tables)
    if (!Array.isArray(d[name])) throw Error(`Missing table ${name}.`);
  const sets = Object.fromEntries(
    tables.map((t) => [t, new Set(d[t].map((r) => r[keys[t]]))]),
  ) as Record<Table, Set<string>>;
  for (const table of tables)
    for (const row of d[table]) {
      for (const id of ids(row.source_ids))
        if (!sets.sources.has(id))
          throw Error(
            `${table} ${row[keys[table]]}: source ${id} is missing. Import related files together.`,
          );
    }
  for (const e of d.events) {
    if (known(e.organizer_id) && !sets.organizers.has(e.organizer_id))
      throw Error(`${e.event_id}: organizer ${e.organizer_id} is missing.`);
    if (!sets.event_series.has(e.event_series_id))
      throw Error(`${e.event_id}: series ${e.event_series_id} is missing.`);
  }
  for (const r of d.relationships)
    for (const id of [r.from_id, r.to_id])
      if (!sets.events.has(id) && !sets.organizers.has(id))
        throw Error(`${r.relationship_id}: endpoint ${id} is missing.`);
  for (const r of d.priority_2026)
    if (!sets.events.has(r.event_id))
      throw Error(`priority_2026: ${r.event_id} is missing.`);
  for (const r of d.leads_to_verify)
    if (known(r.organizer_id) && !sets.organizers.has(r.organizer_id))
      throw Error(`${r.lead_id}: organizer is missing.`);
  return d;
}
export async function loadBaseline() {
  const d = {} as Dataset;
  await Promise.all(
    tables.map(async (table) => {
      const r = await fetch(`${import.meta.env.BASE_URL}data/${table}.csv`);
      if (!r.ok) throw Error(`Could not load ${table} (${r.status}).`);
      d[table] = parseCsv(await r.text(), table);
    }),
  );
  return validateDataset(d);
}
export async function mergeFiles(d: Dataset, files: File[]) {
  if (!files.length) throw Error("Choose one or more CSV files.");
  const next = { ...d },
    used = new Set<string>();
  let count = 0;
  for (const file of files) {
    const name = file.name.replace(/\.csv$/i, "") as Table;
    if (!tables.includes(name))
      throw Error(
        `Unrecognized filename "${file.name}". Use a supported table filename.`,
      );
    if (used.has(name)) throw Error(`Choose only one ${name}.csv file.`);
    used.add(name);
    const rows = parseCsv(await file.text(), name);
    const map = new Map(d[name].map((r) => [r[keys[name]], r]));
    rows.forEach((r) => map.set(r[keys[name]], r));
    next[name] = Array.from(map.values());
    count += rows.length;
  }
  validateDataset(next);
  return { data: next, count };
}
export function csvText(rows: Row[]) {
  return (
    "\uFEFF" +
    Papa.unparse(rows, { quotes: true, newline: "\r\n", escapeFormulae: true })
  );
}
export function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function validateTracking(value: unknown): Tracker {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Tracking must be an object indexed by event ID.");
  for (const [id, t] of Object.entries(value)) {
    if (!id || !t || typeof t !== "object")
      throw Error("Invalid tracking record.");
    const r = t as Tracking;
    if (
      !trackingStates.includes(r.status) ||
      typeof r.notes !== "string" ||
      typeof r.bookmarked !== "boolean" ||
      typeof r.updatedAt !== "string" ||
      typeof r.followUp !== "string" ||
      (r.followUp !== "" && !isDate(r.followUp))
    )
      throw Error(`Invalid tracking data for ${id}.`);
  }
  return value as Tracker;
}
