import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Users,
  Database,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Check,
  Menu,
  X,
  Download,
  Upload,
  Info,
  ExternalLink,
  Link2,
  Clock,
  SlidersHorizontal,
  RefreshCw,
  Radio,
  FileText,
  Heart,
} from "lucide-react";
import {
  availability,
  category,
  contactUrl,
  csvText,
  DATA_KEY,
  dateText,
  dates,
  display,
  download,
  emptyFilters,
  filterEvents,
  ids,
  isConfirmed,
  isDate,
  keys,
  known,
  loadBaseline,
  mergeFiles,
  priority,
  provisional,
  referenceDate,
  safeUrl,
  statusLabel,
  tables,
  temporal,
  todayHK,
  TRACK_KEY,
  trackingStates,
  validateDataset,
  validateTracking,
} from "./data";
import type { Dataset, Filters, Row, Table, Tracker, Tracking } from "./data";

const nav = [
  ["overview", "The radar", Radio],
  ["opportunities", "Opportunities", Search],
  ["timeline", "Timeline", CalendarDays],
  ["community", "People & places", Users],
  ["applications", "My applications", Bookmark],
  ["data", "Research & data", Database],
] as const;
const base = import.meta.env.BASE_URL;
function useRoute() {
  const [hash, set] = useState(location.hash || "#/overview");
  useEffect(() => {
    const f = () => {
      set(location.hash || "#/overview");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const [path, query] = hash.replace(/^#\/?/, "").split("?");
  return {
    page: path.split("/")[0] || "overview",
    id: path.split("/")[1],
    query: new URLSearchParams(query),
  };
}
function Outside({
  url,
  children,
  className = "",
}: {
  url?: string;
  children: ReactNode;
  className?: string;
}) {
  const href = safeUrl(url);
  return href ? (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} />
    </a>
  ) : (
    <span className="muted">{children} · not verified</span>
  );
}
function Tag({ event, asOf }: { event: Row; asOf: string }) {
  return (
    <span className={`tag tag-${availability(event, asOf).toLowerCase()}`}>
      <i />
      {statusLabel(event, asOf)}
    </span>
  );
}
function Proof({ event }: { event: Row }) {
  return (
    <span
      className="proof"
      title={`${event.date_confirmation_status} · ${event.confidence_level} confidence. Details are from the dated research, not a live check.`}
    >
      {isConfirmed(event) ? <Check size={12} /> : <Info size={12} />}{" "}
      {isConfirmed(event)
        ? "Primary evidence"
        : event.date_confirmation_status.includes("INDEXED")
          ? "Indexed source only"
          : "Limited date evidence"}
      <span> · {dateText(event.date_last_verified)}</span>
    </span>
  );
}
function Empty({
  title = "Nothing on this frequency.",
  text = "Try a wider search or reset your filters.",
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Radio size={36} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function ToyArt() {
  return (
    <svg
      className="toy-art"
      viewBox="0 0 400 300"
      role="img"
      aria-label="An original illustrated vinyl creature with a radar antenna"
    >
      <defs>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#a9b999" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#dots)" />
      <ellipse cx="204" cy="258" rx="106" ry="12" fill="#a3b682" />
      <path
        d="M140 214Q95 204 91 172Q80 141 100 140L135 163M267 214Q311 199 313 164Q316 144 303 145L269 169"
        fill="#ccdd8c"
        stroke="#284238"
        strokeWidth="3"
      />
      <path
        d="M151 219 139 251Q162 264 181 249L190 220M218 220 224 249Q251 264 266 251L253 217"
        fill="#ccdd8c"
        stroke="#284238"
        strokeWidth="3"
      />
      <path
        d="M132 167Q125 104 155 91L144 57Q142 48 154 48L181 79Q202 70 225 79L246 48Q259 45 259 58L253 96Q280 116 274 176L264 217Q235 244 148 221Z"
        fill="#d5e594"
        stroke="#284238"
        strokeWidth="3"
      />
      <path
        d="M166 116Q182 108 195 118M218 118Q234 108 248 118"
        fill="none"
        stroke="#284238"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="181" cy="135" rx="10" ry="14" fill="#284238" />
      <ellipse cx="234" cy="135" rx="10" ry="14" fill="#284238" />
      <circle cx="184" cy="130" r="3" fill="#fff9e9" />
      <circle cx="237" cy="130" r="3" fill="#fff9e9" />
      <path
        d="M190 159Q207 176 224 159"
        fill="none"
        stroke="#284238"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="206" cy="204" rx="28" ry="18" fill="#b6ca74" />
      <circle cx="152" cy="153" r="10" fill="#e88e70" />
      <circle cx="257" cy="153" r="10" fill="#e88e70" />
      <path d="M204 76V41" stroke="#284238" strokeWidth="3" />
      <circle
        cx="204"
        cy="33"
        r="8"
        fill="#e87854"
        stroke="#284238"
        strokeWidth="3"
      />
      <path
        d="M181 21Q202 2 225 21M172 12Q202-12 234 12"
        stroke="#284238"
        fill="none"
        strokeWidth="2"
      />
      <text x="35" y="273" fontSize="9" letterSpacing="2" fill="#284238">
        SMALL RUNS. BIG WORLDS.
      </text>
      <text x="320" y="34" fontSize="10" fill="#284238">
        TM/R
      </text>
    </svg>
  );
}
function EventCard({
  e,
  asOf,
  tracking,
  onSave,
  compact = false,
}: {
  e: Row;
  asOf: string;
  tracking: Tracker;
  onSave: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <article className={`event-card ${compact ? "compact" : ""}`}>
      <div className="card-top">
        <span className="eyebrow">
          {e.region === "Hong Kong" ? "HK" : "TW"} / {e.city}
        </span>
        <button
          className={`icon-button save ${tracking[e.event_id]?.bookmarked ? "selected" : ""}`}
          aria-label={`${tracking[e.event_id]?.bookmarked ? "Unsave" : "Save"} ${e.official_name}`}
          aria-pressed={!!tracking[e.event_id]?.bookmarked}
          onClick={() => onSave(e.event_id)}
        >
          <Bookmark
            size={19}
            fill={tracking[e.event_id]?.bookmarked ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="card-date">
        <CalendarDays size={14} />
        {dates(e)}
      </div>
      <h3>
        <a href={`#/event/${e.event_id}`}>{e.official_name}</a>
      </h3>
      <div className="card-tags">
        <Tag event={e} asOf={asOf} />
        <span className="tier">Tier {e.relevance_tier}</span>
      </div>
      <p className="card-fee">
        {known(e.booth_fees) ? e.booth_fees : "Booth fee not verified"}
      </p>
      {!compact && <p className="card-action">{e.recommended_next_action}</p>}
      <div className="card-bottom">
        <Proof event={e} />
        <a
          href={`#/event/${e.event_id}`}
          className="icon-button"
          aria-label={`Details for ${e.official_name}`}
        >
          <ArrowUpRight size={20} />
        </a>
      </div>
    </article>
  );
}
function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {kicker && <div className="eyebrow">{kicker}</div>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<Dataset | null>(null),
    [baseline, setBaseline] = useState<Dataset | null>(null),
    [error, setError] = useState(""),
    [local, setLocal] = useState(false),
    [tracker, setTracker] = useState<Tracker>({}),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [asOf, setAsOf] = useState(todayHK());
  const route = useRoute();
  const [globalSearch, setGlobalSearch] = useState("");
  function message(text: string) {
    setToast(text);
  }
  useEffect(() => {
    let active = true;
    loadBaseline()
      .then((b) => {
        if (!active) return;
        setBaseline(b);
        let chosen = b;
        try {
          const stored = localStorage.getItem(DATA_KEY);
          if (stored) {
            chosen = validateDataset(JSON.parse(stored));
            setLocal(true);
          }
          const track = localStorage.getItem(TRACK_KEY);
          if (track) setTracker(validateTracking(JSON.parse(track)));
        } catch {
          setToast(
            "Some saved browser data could not be read. Baseline research is available; saved storage was left intact.",
          );
        }
        setData(chosen);
      })
      .catch((e) => setError(String(e.message)));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => setMenu(false), [route.page, route.id]);
  function updateTracking(id: string, patch: Partial<Tracking>) {
    const next = {
      ...tracker,
      [id]: {
        ...(tracker[id] || {
          bookmarked: false,
          status: "Interested" as const,
          notes: "",
          followUp: "",
        }),
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    };
    setTracker(next);
    try {
      localStorage.setItem(TRACK_KEY, JSON.stringify(next));
    } catch {
      message(
        "Browser storage is unavailable or full. Changes are in memory only; export a backup now.",
      );
    }
  }
  function save(id: string) {
    updateTracking(id, { bookmarked: !tracker[id]?.bookmarked });
  }
  function replaceTracking(next: Tracker) {
    setTracker(next);
    try {
      localStorage.setItem(TRACK_KEY, JSON.stringify(next));
      message("Private tracking restored on this browser.");
    } catch {
      message(
        "Tracking restored in memory only. Browser storage is unavailable.",
      );
    }
  }
  function replaceData(next: Dataset | null) {
    try {
      if (next) {
        localStorage.setItem(DATA_KEY, JSON.stringify(next));
        setData(next);
        setLocal(true);
      } else {
        localStorage.removeItem(DATA_KEY);
        setData(baseline);
        setLocal(false);
      }
      message(
        next
          ? "Research update saved to this browser. Personal tracking preserved."
          : "Public baseline restored. Personal tracking preserved.",
      );
    } catch {
      message(
        "Could not save the research update. Browser storage may be full; baseline remains unchanged.",
      );
    }
  }
  if (error)
    return (
      <main className="fatal">
        <Radio />
        <h1>The research could not load.</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>Try again</button>
      </main>
    );
  if (!data)
    return (
      <main className="loading">
        <Radio className="pulse" size={44} />
        <p>Tuning into the toy community…</p>
      </main>
    );
  const common = { data, asOf, tracker, onSave: save };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
        <a className="brand" href="#/overview">
          <img src={`${base}radar.svg`} alt="" />
          <span>
            TOY MARKET
            <br />
            RADAR<span className="brand-sub">THE INDEPENDENT FIELD GUIDE</span>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="nav-caption">YOUR NEXT CONNECTION</div>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <a
              key={path}
              href={`#/${path}`}
              className={
                route.page === path ||
                (route.page === "event" && path === "opportunities")
                  ? "active"
                  : ""
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {path === "applications" && Object.keys(tracker).length > 0 && (
                <small>{Object.keys(tracker).length}</small>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="tiny-label">
            <i /> HONG KONG ↔ TAIWAN
          </span>
          <p>
            Made for independent minds
            <br />
            and small production runs.
          </p>
          <a href="#/data">
            A note on the research <ArrowUpRight size={13} />
          </a>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <span className="top-label">
            A little niche. A lot of possibility.
          </span>
          <form
            className="global-search"
            onSubmit={(e) => {
              e.preventDefault();
              location.hash = `/opportunities?q=${encodeURIComponent(globalSearch)}`;
            }}
          >
            <Search size={16} />
            <input
              aria-label="Search the radar"
              placeholder="Find an event, city or character…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </form>
          <a
            href="#/applications"
            className="top-bookmark"
            aria-label="My applications"
          >
            <Bookmark size={18} />
            <span>My collection</span>
          </a>
        </header>
        <main id="main-content">
          <div className="context-row">
            <span>
              <i className={local ? "local-dot" : "snapshot-dot"} />
              {local
                ? "Your local research edition"
                : "Public research edition"}{" "}
              <span className="context-divider">/</span> Evidence reviewed{" "}
              {dateText(referenceDate)}
            </span>
            <label>
              View as of{" "}
              <input
                type="date"
                aria-label="View as of date"
                value={asOf}
                onChange={(e) => {
                  if (isDate(e.target.value)) setAsOf(e.target.value);
                }}
              />
            </label>
          </div>
          {route.page === "overview" ? (
            <Overview {...common} />
          ) : route.page === "opportunities" ? (
            <Opportunities
              {...common}
              initialQuery={route.query.get("q") || ""}
              initialRegion={route.query.get("region") || ""}
            />
          ) : route.page === "event" ? (
            <EventDetail
              {...common}
              id={route.id || ""}
              update={updateTracking}
            />
          ) : route.page === "timeline" ? (
            <Timeline {...common} />
          ) : route.page === "community" ? (
            <Community data={data} />
          ) : route.page === "applications" ? (
            <Applications
              {...common}
              update={updateTracking}
              replaceTracking={replaceTracking}
            />
          ) : route.page === "data" ? (
            <DataPage
              data={data}
              local={local}
              replaceData={replaceData}
              message={message}
            />
          ) : (
            <Empty
              title="This page drifted off the radar."
              action={
                <a className="button" href="#/overview">
                  Back to the radar
                </a>
              }
            />
          )}
        </main>
        <footer className="footer">
          <span>
            TOY MARKET RADAR <span className="muted">/</span> Independent by
            nature.
          </span>
          <span>
            Sources over assumptions.{" "}
            <a href="#/data">
              Research notes <ArrowUpRight size={12} />
            </a>
          </span>
        </footer>
      </div>
      {toast && (
        <div role="status" className="toast">
          <Info size={18} />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
interface Common {
  data: Dataset;
  asOf: string;
  tracker: Tracker;
  onSave: (id: string) => void;
}
function Overview({ data, asOf, tracker, onSave }: Common) {
  const p = priority(data).sort((a, b) => provisional(a, b, asOf));
  const upcoming = data.events.filter(
    (e) => temporal(e, asOf) === "Confirmed upcoming",
  );
  const actionable = upcoming.filter((e) =>
    ["Open", "Conditional", "Waitlist"].includes(availability(e, asOf)),
  );
  const historic = data.events.filter(
    (e) => temporal(e, asOf) === "Historical",
  );
  const recurring = data.event_series.filter(
    (s) =>
      s.recurrence_status !== "ONE_OR_MORE_EDITIONS_NEXT_UNCONFIRMED" &&
      data.events.some(
        (e) =>
          e.event_series_id === s.event_series_id &&
          temporal(e, asOf) === "Historical",
      ),
  );
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> THE WORLD BEYOND YOUR FEED
          </div>
          <h1>
            Small runs.
            <br />
            <em>Real connections.</em>
          </h1>
          <p>
            Sofubi, designer toy & creative market opportunities.
            <br />
            Find your people. Find your next table.
          </p>
          <div className="hero-links">
            <a className="button dark" href="#/opportunities">
              Explore the opportunities <ArrowUpRight size={17} />
            </a>
            <span className="handwritten">香港 ↔ 台灣</span>
          </div>
        </div>
        <div className="hero-art">
          <span className="art-label">ORIGINALS ONLY / FIELD NOTES № 01</span>
          <ToyArt />
          <span className="art-caption">
            A radar for the wonderfully niche.
          </span>
        </div>
      </section>
      <div className="metrics">
        {[
          [
            new Set(data.events.map((e) => e.event_series_id)).size,
            "Event series",
          ],
          [data.events.length, "Recorded editions"],
          [upcoming.length, "Confirmed upcoming"],
          [actionable.length, "Routes to investigate"],
          [data.organizers.length, "People & places"],
        ].map(([n, label]) => (
          <div className="metric" key={label}>
            <strong>{n}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="priority-section">
        <SectionHead
          kicker="THE YEAR-END EDIT"
          title="Your next table could be here."
        >
          <span className="issue-label">
            NOV — DEC 2026 <span>{p.length} EVENTS</span>
          </span>
        </SectionHead>
        <div className="section-description">
          <p>
            Confirmed dates. Different ways in. Start with the application
            label.
          </p>
          <details className="order-note">
            <summary>
              <SlidersHorizontal size={14} /> Provisional attention order
            </summary>
            <p>
              Research-based suggestion, not a verified ranking: listed
              application windows, conditional forms, waitlists, unknown intake,
              then closed. Ties use collector fit, practical feasibility, then
              the nearest deadline/event date. Historical entries fall last.
              Scores are analyst judgments.
            </p>
          </details>
        </div>
        <div className="legend">
          <span className="tag tag-conditional">
            <i />
            Conditional ≠ accepted
          </span>
          <span className="tag tag-waitlist">
            <i />
            Waitlist ≠ vacancy
          </span>
          <span>
            Application evidence is dated. Check the source before committing.
          </span>
        </div>
        <div className="event-grid">
          {p.map((e) => (
            <EventCard
              key={e.event_id}
              e={e}
              asOf={asOf}
              tracking={tracker}
              onSave={onSave}
            />
          ))}
        </div>
      </section>
      <section className="split-section">
        <div className="network-callout">
          <span className="eyebrow">PEOPLE MAKE THE SCENE</span>
          <h2>
            Find the people
            <br />
            <em>behind the table.</em>
          </h2>
          <p>
            Specialist shops, small galleries, artist collectives. The best
            connection might start between events.
          </p>
          <a className="text-link" href="#/community">
            Meet the community <ArrowRight size={18} />
          </a>
          <div className="network-names">
            CODE CORNER <span>↗</span> Fairycookies <span>↗</span> Angel Abby
          </div>
        </div>
        <div className="archive-callout">
          <span className="eyebrow">LOOK BACK TO LOOK AHEAD</span>
          <div className="big-stat">
            {historic.length}
            <span>historical editions</span>
          </div>
          <p>
            {recurring.length} programmes carry recurring, numbered, touring or
            repeated history. A past date is a clue to follow—not a future
            announcement.
          </p>
          <a className="text-link" href="#/timeline">
            Explore the timeline <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
function Opportunities({
  data,
  asOf,
  tracker,
  onSave,
  initialQuery,
  initialRegion,
}: Common & { initialQuery: string; initialRegion: string }) {
  const [filters, set] = useState<Filters>({
      ...emptyFilters,
      q: initialQuery,
      region: initialRegion,
    }),
    [view, setView] = useState("cards");
  useEffect(
    () => set((f) => ({ ...f, q: initialQuery, region: initialRegion })),
    [initialQuery, initialRegion],
  );
  const result = useMemo(
    () => filterEvents(data.events, filters, asOf),
    [data, filters, asOf],
  );
  const put = (key: keyof Filters, value: string) =>
    set((f) => ({ ...f, [key]: value }));
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">THE COMPLETE FIELD GUIDE</div>
        <h1>
          Find your next <em>opportunity.</em>
        </h1>
        <p>
          Every edition, every source, every unknown. Explore with your own
          priorities.
        </p>
      </div>
      <div className="database-layout">
        <aside className="filters">
          <div className="filter-title">
            <SlidersHorizontal size={17} />
            <strong>Refine the radar</strong>
            <button onClick={() => set({ ...emptyFilters })}>Reset</button>
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search opportunities"
              placeholder="Event, city, venue…"
              value={filters.q}
              onChange={(e) => put("q", e.target.value)}
            />
          </label>
          {(
            [
              ["region", "Region", ["Hong Kong", "Taiwan"]],
              [
                "city",
                "City",
                [
                  ...new Set(
                    data.events
                      .filter(
                        (e) => !filters.region || e.region === filters.region,
                      )
                      .map((e) => e.city),
                  ),
                ].sort(),
              ],
              [
                "kind",
                "Category",
                ["Sofubi", "Designer Toy", "Art Market", "Other"],
              ],
              ["tier", "Relevance tier", ["A", "B", "C"]],
              [
                "time",
                "Event confirmation",
                ["Confirmed upcoming", "Historical", "Unconfirmed"],
              ],
              [
                "application",
                "Application status",
                [
                  "Open",
                  "Conditional",
                  "Waitlist",
                  "Closed",
                  "Unknown",
                  "Historical",
                ],
              ],
            ] as [keyof Filters, string, string[]][]
          ).map(([key, label, options]) => (
            <label key={key}>
              {label}
              <select
                value={filters[key]}
                onChange={(e) => {
                  put(key, e.target.value);
                  if (key === "region") put("city", "");
                }}
              >
                <option value="">All {label.toLowerCase()}</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <div className="filter-dates">
            <label>
              From
              <input
                type="date"
                value={filters.from}
                onChange={(e) => put("from", e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={filters.to}
                onChange={(e) => put("to", e.target.value)}
              />
            </label>
          </div>
          <label>
            Collector fit, at least
            <select
              value={filters.audience}
              onChange={(e) => put("audience", e.target.value)}
            >
              <option value="">Any assessment</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </label>
          <label>
            First-time access, at least
            <select
              value={filters.access}
              onChange={(e) => put("access", e.target.value)}
            >
              <option value="">Any assessment</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </label>
          <p className="small muted">
            Category is a browsing aid derived from names, recorded category and
            relevance tier. Scores are analyst judgments.
          </p>
        </aside>
        <div>
          <div className="results-bar">
            <span>
              <strong>{result.length}</strong> of {data.events.length} editions
            </span>
            <div>
              <select
                aria-label="Sort opportunities"
                value={filters.sort}
                onChange={(e) => put("sort", e.target.value)}
              >
                <option value="date">Upcoming event date</option>
                <option value="deadline">Application deadline</option>
                <option value="audience">Collector relevance</option>
                <option value="practicality">Practical feasibility</option>
                <option value="verified">Recently verified</option>
              </select>
              <div className="view-switch">
                <button
                  className={view === "cards" ? "active" : ""}
                  aria-label="Card view"
                  aria-pressed={view === "cards"}
                  onClick={() => setView("cards")}
                >
                  <LayoutGrid size={17} />
                </button>
                <button
                  className={view === "table" ? "active" : ""}
                  aria-label="Table view"
                  aria-pressed={view === "table"}
                  onClick={() => setView("table")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
          {!result.length ? (
            <Empty
              action={
                <button
                  className="button"
                  onClick={() => set({ ...emptyFilters })}
                >
                  Reset filters
                </button>
              }
            />
          ) : view === "cards" ? (
            <div className="event-grid database-grid">
              {result.map((e) => (
                <EventCard
                  key={e.event_id}
                  e={e}
                  asOf={asOf}
                  tracking={tracker}
                  onSave={onSave}
                  compact
                />
              ))}
            </div>
          ) : (
            <EventTable events={result} asOf={asOf} />
          )}
          <button
            className="text-link export-filtered"
            disabled={!result.length}
            onClick={() =>
              download(
                "filtered-events.csv",
                csvText(result),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={15} />
            Export these results
          </button>
        </div>
      </div>
    </>
  );
}
function EventTable({ events, asOf }: { events: Row[]; asOf: string }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Opportunity</th>
            <th>Where / when</th>
            <th>Application</th>
            <th>Fit</th>
            <th>Evidence</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.event_id}>
              <td>
                <a href={`#/event/${e.event_id}`}>
                  {e.official_name}
                  <ArrowUpRight size={14} />
                </a>
                <small>
                  Tier {e.relevance_tier} · {category(e)}
                </small>
              </td>
              <td>
                {e.city}
                <small>{dates(e)}</small>
              </td>
              <td>
                <Tag event={e} asOf={asOf} />
              </td>
              <td>{e.audience_fit_score}/5</td>
              <td>
                <Proof event={e} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>{display(value)}</dd>
    </div>
  );
}
function EventDetail({
  data,
  id,
  asOf,
  tracker,
  onSave,
  update,
}: Common & {
  id: string;
  update: (id: string, p: Partial<Tracking>) => void;
}) {
  const e = data.events.find((e) => e.event_id === id);
  if (!e)
    return (
      <Empty
        title="That event is not in this edition."
        action={
          <a className="button" href="#/opportunities">
            All opportunities
          </a>
        }
      />
    );
  const org = data.organizers.find((o) => o.organizer_id === e.organizer_id);
  const sources = data.sources.filter((s) =>
    ids(e.source_ids).includes(s.source_id),
  );
  const other = data.events.filter(
    (o) => o.event_series_id === e.event_series_id && o.event_id !== e.event_id,
  );
  const links = data.relationships.filter(
    (r) => r.to_id === id || r.from_id === id,
  );
  return (
    <>
      <a className="back-link" href="#/opportunities">
        <ArrowLeft size={15} />
        All opportunities
      </a>
      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            {e.region} / {e.city} <span> · {e.event_id}</span>
          </div>
          <h1>{e.official_name}</h1>
          <div className="detail-tags">
            <Tag event={e} asOf={asOf} />
            <span className="tier">Tier {e.relevance_tier}</span>
            <span className="tag neutral">{temporal(e, asOf)}</span>
          </div>
          <p className="detail-date">
            <CalendarDays size={18} />
            {dates(e)}
          </p>
        </div>
        <button
          className={`button ${tracker[id]?.bookmarked ? "dark" : ""}`}
          onClick={() => onSave(id)}
        >
          <Bookmark
            size={17}
            fill={tracker[id]?.bookmarked ? "currentColor" : "none"}
          />
          {tracker[id]?.bookmarked ? "Saved to your radar" : "Save opportunity"}
        </button>
      </div>
      <div className="detail-layout">
        <div>
          <section className="panel next-step">
            <span className="eyebrow">THE NEXT CONVERSATION</span>
            <h3>Recommended next step</h3>
            <p>{e.recommended_next_action}</p>
          </section>
          <section className="panel">
            <SectionHead
              kicker="RECORDED FACTS"
              title="The practical details"
            />
            <dl className="facts">
              <Fact label="Venue" value={e.venue} />
              <Fact label="Alternative name" value={e.alternative_names} />
              <Fact label="Recorded category" value={e.category} />
              <Fact
                label="Application deadline"
                value={
                  isDate(e.application_deadline)
                    ? dateText(e.application_deadline)
                    : "UNKNOWN"
                }
              />
              <Fact label="Booth fee / conditions" value={e.booth_fees} />
              <Fact label="Space & equipment" value={e.booth_size} />
              <Fact
                label="Exhibitor eligibility"
                value={e.exhibitor_eligibility}
              />
              <Fact
                label="Overseas eligibility"
                value={e.overseas_eligibility}
              />
              <Fact
                label="Alternative route evidence"
                value={e.alternative_route_evidence}
              />
              <Fact
                label="Application at verification"
                value={e.application_status}
              />
              <Fact
                label="Date confirmation"
                value={e.date_confirmation_status}
              />
              <Fact label="Record confidence" value={e.confidence_level} />
            </dl>
            <div className="external-links">
              {known(e.registration_url) && (
                <Outside className="button dark" url={e.registration_url}>
                  {availability(e) === "Waitlist"
                    ? "View waitlist source"
                    : "View application source"}
                </Outside>
              )}
              {known(e.official_website) && (
                <Outside className="button" url={e.official_website}>
                  Official channel
                </Outside>
              )}
              {known(e.social_media_url) && (
                <Outside className="button" url={e.social_media_url}>
                  Social profile
                </Outside>
              )}
            </div>
            <p className="small muted">
              Reviewed {dateText(e.date_last_verified)}. A linked form is not
              proof of a vacancy or acceptance. Eligibility and costs may have
              changed.
            </p>
          </section>
          <section className="panel">
            <SectionHead
              kicker="ANALYST JUDGMENTS · NOT MEASURED OUTCOMES"
              title="Is it a fit for your first run?"
            />
            <div className="assessments">
              {[
                ["audience_fit", "Collector audience"],
                ["accessibility", "First-time accessibility"],
                ["networking", "Networking"],
                ["commercial", "Commercial potential"],
                ["practicality", "Practical feasibility"],
              ].map(([key, label]) => (
                <div className="assessment" key={key}>
                  <div>
                    <strong>{label}</strong>
                    <span>
                      {e[key + "_score"]}
                      <small>/5</small>
                    </span>
                  </div>
                  <div className="score-bars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <i
                        key={n}
                        className={
                          n <= Number(e[key + "_score"]) ? "filled" : ""
                        }
                      />
                    ))}
                  </div>
                  <p>{e[key + "_reason"]}</p>
                </div>
              ))}
            </div>
            <p className="small muted">{e.evaluation_explanation}</p>
          </section>
          <section className="panel">
            <SectionHead
              kicker="FOLLOW THE EVIDENCE"
              title="Sources & limitations"
            />
            {sources.map((s) => (
              <div className="source" key={s.source_id}>
                <div>
                  <span className="source-id">{s.source_id}</span>
                  <Outside url={s.source_url}>{s.publisher}</Outside>
                  <span className="tag neutral">
                    {s.access_method === "SEARCH_INDEX_ONLY"
                      ? "Index only"
                      : "Page inspected"}
                  </span>
                </div>
                <p>{s.what_source_establishes}</p>
                <p className="small muted">
                  {s.reliability_limitations} Accessed{" "}
                  {dateText(s.date_accessed)}.
                </p>
              </div>
            ))}
          </section>
          {other.length > 0 && (
            <section>
              <SectionHead title="Other recorded editions" />
              {other.map((o) => (
                <a
                  className="edition-link"
                  key={o.event_id}
                  href={`#/event/${o.event_id}`}
                >
                  <span>
                    {o.official_name}
                    <small>{dates(o)}</small>
                  </span>
                  <ArrowUpRight size={19} />
                </a>
              ))}
            </section>
          )}
        </div>
        <aside className="detail-aside">
          <TrackingPanel e={e} track={tracker[id]} update={update} />
          <section className="panel">
            <span className="eyebrow">PEOPLE & PLACES</span>
            <h3>{org ? org.name : "Organizer not verified"}</h3>
            {org && (
              <>
                <p>{org.relevance_to_brand}</p>
                <div className="external-links">
                  <Outside url={org.official_website}>Official channel</Outside>
                  {known(org.public_contact_email_or_form) && (
                    <Outside url={contactUrl(org.public_contact_email_or_form)}>
                      Public contact
                    </Outside>
                  )}
                </div>
                <p className="small muted">{org.notes}</p>
                <a
                  className="text-link"
                  href={`#/community?q=${encodeURIComponent(org.name)}`}
                >
                  Directory record <ArrowRight size={15} />
                </a>
              </>
            )}
            {links.length > 0 && (
              <div className="relation-list">
                {links.map((r) => {
                  const related = data.organizers.find(
                    (o) =>
                      o.organizer_id ===
                      (r.from_id === id ? r.to_id : r.from_id),
                  );
                  return (
                    <div key={r.relationship_id}>
                      <Link2 size={13} />
                      <span>
                        {related?.name || r.from_id}
                        <small>
                          {r.relationship_type
                            .replaceAll("_", " ")
                            .toLowerCase()}{" "}
                          · {r.source_ids}
                        </small>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
function TrackingPanel({
  e,
  track,
  update,
}: {
  e: Row;
  track?: Tracking;
  update: (id: string, p: Partial<Tracking>) => void;
}) {
  return (
    <section className="panel tracking-panel">
      <span className="eyebrow">
        <Heart size={13} /> JUST FOR YOU
      </span>
      <h3>Your application notebook</h3>
      <label>
        Progress
        <select
          value={track?.status || "Interested"}
          onChange={(ev) =>
            update(e.event_id, {
              status: ev.target.value as Tracking["status"],
            })
          }
        >
          {trackingStates.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Follow-up date
        <input
          type="date"
          value={track?.followUp || ""}
          onInput={(ev) =>
            update(e.event_id, { followUp: ev.currentTarget.value })
          }
          onBlur={(ev) =>
            update(e.event_id, { followUp: ev.currentTarget.value })
          }
        />
      </label>
      <label>
        Personal notes
        <textarea
          rows={5}
          placeholder="A contact, a question, an idea…"
          value={track?.notes || ""}
          onChange={(ev) => update(e.event_id, { notes: ev.target.value })}
        />
      </label>
      <p className="small muted">
        Saved automatically on this browser. Private notes stay on this device
        and do not sync. Export a backup in My applications.
      </p>
    </section>
  );
}

function Timeline({ data, asOf }: Common) {
  const [tab, setTab] = useState("Upcoming");
  const eventItems = data.events.filter((e) =>
    tab === "Historical"
      ? temporal(e, asOf) === "Historical"
      : tab === "Unconfirmed"
        ? temporal(e, asOf) === "Unconfirmed"
        : temporal(e, asOf) === "Confirmed upcoming",
  );
  const deadlines = data.events.filter(
    (e) =>
      isDate(e.application_deadline) &&
      (tab === "Historical"
        ? e.application_deadline < asOf
        : tab === "Upcoming"
          ? e.application_deadline >= asOf
          : false),
  );
  const items = [
    ...eventItems.map((e) => ({ e, date: e.event_date_start, type: "Event" })),
    ...deadlines.map((e) => ({
      e,
      date: e.application_deadline,
      type: "Application deadline",
    })),
  ].sort((a, b) =>
    (isDate(a.date) ? a.date : "9999").localeCompare(
      isDate(b.date) ? b.date : "9999",
    ),
  );
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const key = isDate(item.date) ? item.date.slice(0, 7) : "Undated";
    groups.set(key, [...(groups.get(key) || []), item]);
  }
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">THE LONG VIEW</div>
        <h1>
          Keep the next date <em>in sight.</em>
        </h1>
        <p>
          Events and application deadlines, with the past kept in its proper
          place.
        </p>
      </div>
      <div className="segmented">
        {["Upcoming", "Historical", "Unconfirmed", "Future watchlist"].map(
          (t) => (
            <button
              key={t}
              className={t === tab ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ),
        )}
      </div>
      {tab === "Future watchlist" ? (
        <>
          <p className="section-intro">
            These programmes have no confirmed upcoming edition in this dataset.
            Monitor the organizers; no future date has been inferred.
          </p>
          <div className="watch-grid">
            {data.event_series
              .filter(
                (s) =>
                  !data.events.some(
                    (e) =>
                      e.event_series_id === s.event_series_id &&
                      temporal(e, asOf) === "Confirmed upcoming",
                  ),
              )
              .map((s) => (
                <div className="panel" key={s.event_series_id}>
                  <span className="eyebrow">FUTURE EDITION UNCONFIRMED</span>
                  <h3>{s.series_name}</h3>
                  <p>
                    {s.recurrence_status.replaceAll("_", " ").toLowerCase()}
                  </p>
                  <a
                    className="text-link"
                    href={`#/event/${ids(s.edition_ids)[0]}`}
                  >
                    View recorded history <ArrowUpRight size={15} />
                  </a>
                </div>
              ))}
          </div>
        </>
      ) : items.length ? (
        <div className="timeline">
          {Array.from(groups, ([month, list]) => (
            <section key={month}>
              <h2>
                {month === "Undated"
                  ? "Dates not established"
                  : new Intl.DateTimeFormat("en-GB", {
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Hong_Kong",
                    }).format(new Date(month + "-01T00:00:00+08:00"))}
              </h2>
              {list!.map(({ e, date, type }) => (
                <a
                  className={`timeline-item ${type === "Application deadline" ? "deadline-item" : ""}`}
                  key={e.event_id + type}
                  href={`#/event/${e.event_id}`}
                >
                  <div className="timeline-day">
                    {isDate(date) ? date.slice(8) : "—"}
                    <small>{type === "Event" ? "EVENT" : "DEADLINE"}</small>
                  </div>
                  <div>
                    <h3>{e.official_name}</h3>
                    <p>
                      {e.city} ·{" "}
                      {type === "Event"
                        ? dates(e)
                        : `Application deadline ${dateText(date)}`}
                    </p>
                    <Tag event={e} asOf={asOf} />
                  </div>
                  <ArrowUpRight size={21} />
                </a>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <Empty text="No dated entries in this view. Try the watchlist for programmes awaiting announcements." />
      )}
    </>
  );
}
function Community({ data }: { data: Dataset }) {
  const route = useRoute(),
    [q, setQ] = useState(route.query.get("q") || ""),
    [region, setRegion] = useState(""),
    [kind, setKind] = useState("");
  const filtered = data.organizers.filter(
    (o) =>
      (!q ||
        [o.name, o.city, o.relevance_to_brand]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!region || o.region.includes(region)) &&
      (!kind || o.organization_type === kind),
  );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">THE COMMUNITY IS THE CONNECTION</div>
        <h1>
          Good people.
          <br />
          <em>Wonderful places.</em>
        </h1>
        <p>
          Organizers, specialist shops, galleries and artist networks. A lead
          starts a conversation; it does not promise a place.
        </p>
      </div>
      <div className="directory-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            placeholder="Search people, places, cities…"
            aria-label="Search community"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label="Community region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">All regions</option>
          <option>Hong Kong</option>
          <option>Taiwan</option>
          <option>Japan</option>
        </select>
        <select
          aria-label="Organization type"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">All organization types</option>
          {[...new Set(data.organizers.map((o) => o.organization_type))]
            .sort()
            .map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ").toLowerCase()}
              </option>
            ))}
        </select>
        <button
          className="text-link"
          onClick={() => {
            setQ("");
            setRegion("");
            setKind("");
          }}
        >
          Reset
        </button>
      </div>
      <div className="results-count">{filtered.length} connections</div>
      <div className="community-grid">
        {filtered.map((o) => {
          const rel = data.relationships.filter(
            (r) => r.from_id === o.organizer_id || r.to_id === o.organizer_id,
          );
          const events = data.events.filter(
            (e) =>
              e.organizer_id === o.organizer_id ||
              rel.some(
                (r) => r.from_id === e.event_id || r.to_id === e.event_id,
              ),
          );
          return (
            <article className="community-card" key={o.organizer_id}>
              <div className="community-monogram">{o.name.slice(0, 1)}</div>
              <span className="eyebrow">
                {o.region} / {o.city}
              </span>
              <h3>{o.name}</h3>
              <span className="org-type">
                {o.organization_type.replaceAll("_", " ").toLowerCase()}
              </span>
              <p>{o.relevance_to_brand}</p>
              <div className="contact-links">
                {known(o.official_website) && (
                  <Outside url={o.official_website}>Website</Outside>
                )}
                {known(o.instagram) && (
                  <Outside url={o.instagram}>Instagram</Outside>
                )}
                {known(o.facebook) && (
                  <Outside url={o.facebook}>Facebook</Outside>
                )}
                {known(o.public_contact_email_or_form) && (
                  <Outside url={contactUrl(o.public_contact_email_or_form)}>
                    Contact
                  </Outside>
                )}
                {known(o.public_phone) && <span>{o.public_phone}</span>}
              </div>
              {events.length > 0 && (
                <details>
                  <summary>
                    {events.length} associated edition
                    {events.length === 1 ? "" : "s"}
                  </summary>
                  {events.map((e) => (
                    <a
                      className="org-event"
                      href={`#/event/${e.event_id}`}
                      key={e.event_id}
                    >
                      {e.official_name}
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </details>
              )}
              {rel.length > 0 && (
                <details>
                  <summary>
                    {rel.length} documented network link
                    {rel.length === 1 ? "" : "s"}
                  </summary>
                  {rel.map((r) => (
                    <p className="small" key={r.relationship_id}>
                      {r.relationship_type.replaceAll("_", " ").toLowerCase()} ·{" "}
                      {r.source_ids}
                      <br />
                      {known(r.notes) ? r.notes : ""}
                    </p>
                  ))}
                </details>
              )}
              <p className="small muted org-notes">{o.notes}</p>
              <div className="proof">
                {o.source_ids.replaceAll(";", ", ")} · reviewed{" "}
                {dateText(o.date_last_verified)}
              </div>
            </article>
          );
        })}
      </div>
      {!filtered.length && <Empty />}
    </>
  );
}
function Applications({
  data,
  asOf,
  tracker,
  onSave,
  update,
  replaceTracking,
}: Common & {
  update: (id: string, p: Partial<Tracking>) => void;
  replaceTracking: (t: Tracker) => void;
}) {
  const [filter, setFilter] = useState(""),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const list = data.events.filter(
    (e) =>
      tracker[e.event_id] && (!filter || tracker[e.event_id].status === filter),
  );
  const orphan = Object.keys(tracker).filter(
    (id) => !data.events.some((e) => e.event_id === id),
  );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">A NOTEBOOK OF YOUR OWN</div>
        <h1>
          Your next <em>chapter.</em>
        </h1>
        <p>
          Save an opportunity, start a conversation, keep a little momentum.
        </p>
      </div>
      <div className="privacy-note">
        <Bookmark size={19} />
        <span>
          Your notes and progress live in this browser only. They are never sent
          to the public site and do not sync between devices. Export regularly.
        </span>
      </div>
      <div className="results-bar application-tools">
        <select
          aria-label="Filter personal status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All personal statuses</option>
          {trackingStates.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div>
          <button
            className="button"
            onClick={() =>
              download(
                "toy-market-radar-private-tracking.json",
                JSON.stringify(
                  {
                    format: "tmr-tracking-v1",
                    exportedAt: new Date().toISOString(),
                    tracking: tracker,
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            <Download size={15} />
            Export private backup
          </button>
          <button className="button" onClick={() => input.current?.click()}>
            <Upload size={15} />
            Restore backup
          </button>
          <input
            ref={input}
            type="file"
            hidden
            accept=".json,application/json"
            onChange={async (e) => {
              try {
                const f = e.target.files?.[0];
                if (!f) return;
                const value = JSON.parse(await f.text());
                if (value.format !== "tmr-tracking-v1")
                  throw Error("Choose a Toy Market Radar tracking backup.");
                replaceTracking({
                  ...tracker,
                  ...validateTracking(value.tracking),
                });
                setError("");
              } catch (err) {
                setError((err as Error).message);
              }
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {list.length ? (
        <div className="application-list">
          {list.map((e) => (
            <article key={e.event_id} className="application-card">
              <div>
                <div className="eyebrow">
                  {e.city} / {dates(e)}
                </div>
                <h3>
                  <a href={`#/event/${e.event_id}`}>
                    {e.official_name}
                    <ArrowUpRight size={17} />
                  </a>
                </h3>
                <Tag event={e} asOf={asOf} />
                <button
                  className="text-link"
                  onClick={() => onSave(e.event_id)}
                >
                  <Bookmark size={14} />
                  {tracker[e.event_id].bookmarked
                    ? "Bookmarked"
                    : "Add bookmark"}
                </button>
              </div>
              <div className="application-fields">
                <label>
                  Progress
                  <select
                    value={tracker[e.event_id].status}
                    onChange={(ev) =>
                      update(e.event_id, {
                        status: ev.target.value as Tracking["status"],
                      })
                    }
                  >
                    {trackingStates.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Follow-up
                  <input
                    type="date"
                    value={tracker[e.event_id].followUp}
                    onInput={(ev) =>
                      update(e.event_id, { followUp: ev.currentTarget.value })
                    }
                    onBlur={(ev) =>
                      update(e.event_id, { followUp: ev.currentTarget.value })
                    }
                  />
                </label>
                <label className="note-field">
                  Personal notes
                  <textarea
                    rows={2}
                    value={tracker[e.event_id].notes}
                    placeholder="A question to ask, a person to meet…"
                    onChange={(ev) =>
                      update(e.event_id, { notes: ev.target.value })
                    }
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Your notebook starts with a possibility."
          text="Bookmark an event or add a note on its detail page. Your private tracking will appear here."
          action={
            <a className="button dark" href="#/opportunities">
              Find an opportunity <ArrowRight size={16} />
            </a>
          }
        />
      )}{" "}
      {!!orphan.length && (
        <div className="notice">
          {orphan.length} tracking record(s) refer to IDs absent from this
          research edition. They are preserved in your browser and included in
          backups: {orphan.join(", ")}.
        </div>
      )}
    </>
  );
}
function DataPage({
  data,
  local,
  replaceData,
  message,
}: {
  data: Dataset;
  local: boolean;
  replaceData: (d: Dataset | null) => void;
  message: (m: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [exportTable, setExportTable] = useState<Table>("events");
  const [sourceQ, setSourceQ] = useState("");
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">A LIVING FIELD GUIDE</div>
        <h1>
          Good research.
          <br />
          <em>Room to grow.</em>
        </h1>
        <p>
          Keep the sources close and the database useful. Updated CSVs, stable
          IDs, no code required.
        </p>
      </div>
      <div className="data-banner">
        <span className="tag neutral">
          {local ? "LOCAL IMPORTED DATA" : "PUBLIC BASELINE"}
        </span>
        <p>
          {local
            ? "You are viewing updates stored on this browser. The public GitHub site has not changed."
            : "You are viewing the research shipped with this website."}{" "}
          Personal tracking stays separate.
        </p>
      </div>
      <div className="data-grid">
        <section className="panel">
          <div className="eyebrow">01 / IMPORT A RESEARCH UPDATE</div>
          <h3>A new edition of the radar.</h3>
          <p>
            Choose one or more compatible table CSVs. Records merge by stable
            ID. Existing IDs update; new IDs are added. Duplicate IDs and broken
            relationships are rejected before saving.
          </p>
          <label className="upload-zone">
            <Upload size={25} />
            <strong>Choose CSV files</strong>
            <span>
              events.csv, organizers.csv, sources.csv and companion tables
            </span>
            <input
              type="file"
              multiple
              accept=".csv,text/csv"
              aria-label="Import research CSV files"
              onChange={(e) => {
                setFiles(Array.from(e.target.files || []));
                setError("");
              }}
            />
          </label>
          {files.length > 0 && (
            <p className="small">{files.map((f) => f.name).join(", ")}</p>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button
            className="button dark"
            disabled={!files.length || busy}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await mergeFiles(data, files);
                replaceData(result.data);
                setFiles([]);
                setError("");
                message(
                  `${result.count} CSV records validated. Research and private tracking remain separate.`,
                );
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Checking your files…" : "Validate & import"}
            <ArrowRight size={16} />
          </button>
          <p className="small muted">
            Import changes this browser only. Dates, scores, columns and
            references are checked. Your personal notes are preserved.
          </p>
        </section>
        <section className="panel">
          <div className="eyebrow">02 / TAKE THE DATA WITH YOU</div>
          <h3>Portable by design.</h3>
          <p>
            Export a table for Excel, Google Sheets or a future deployment.
            These exports contain research only. Private notes have their own
            backup in My applications.
          </p>
          <label>
            Research table
            <select
              value={exportTable}
              onChange={(e) => setExportTable(e.target.value as Table)}
            >
              {tables.map((t) => (
                <option key={t} value={t}>
                  {t}.csv · {data[t].length} records
                </option>
              ))}
            </select>
          </label>
          <button
            className="button"
            onClick={() =>
              download(
                `${exportTable}.csv`,
                csvText(data[exportTable]),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={16} />
            Export CSV
          </button>
          <hr />
          <h3>Return to the public edition</h3>
          <p>
            Remove local research overrides while retaining your private
            application notebook.
          </p>
          <button
            className="button"
            disabled={!local}
            onClick={() => replaceData(null)}
          >
            <RefreshCw size={15} />
            Restore baseline research
          </button>
          <p className="small muted">
            To publish permanent updates, replace the matching files in
            public/data in the GitHub repository. A push to main rebuilds the
            site. Full instructions are in the project README.
          </p>
        </section>
      </div>
      <section className="panel research-note">
        <SectionHead
          kicker="TRANSPARENCY IS PART OF THE PRODUCT"
          title="What this research can tell you"
        />
        <p>
          The baseline was reviewed on {dateText(referenceDate)}. It preserves a
          mixture of inspected primary pages, secondary reports and indexed
          extracts. It has not been independently reverified during website
          development.
        </p>
        <div className="trust-columns">
          <div>
            <h3>Two different questions.</h3>
            <p>
              Event confirmation establishes dates. Application availability
              needs separate evidence. A confirmed event may have closed or
              unknown intake.
            </p>
          </div>
          <div>
            <h3>Unknown stays unknown.</h3>
            <p>
              Missing fees, deadlines and overseas eligibility are not filled by
              assumptions. Historical dates never become future announcements.
            </p>
          </div>
          <div>
            <h3>Judgment has a label.</h3>
            <p>
              Fit scores and the homepage's provisional order are analyst tools.
              They are not measured sales outcomes or acceptance probabilities.
            </p>
          </div>
        </div>
        <div className="external-links">
          {[
            ["report.md", "Full research report"],
            ["README.md", "Database field guide"],
            ["taiwan_participation.md", "Taiwan participation notes"],
            ["research_log.md", "Research log"],
          ].map(([file, label]) => (
            <Outside
              key={file}
              className="button"
              url={new URL(`${base}research/${file}`, location.origin).href}
            >
              {label}
            </Outside>
          ))}
        </div>
      </section>
      <section className="panel">
        <SectionHead
          kicker="UNRESOLVED DISCOVERY LEADS"
          title="Keep a little curiosity"
        />
        <p className="small muted">
          These leads are separate from confirmed event counts.
        </p>
        {data.leads_to_verify.map((l) => (
          <div className="lead" key={l.lead_id}>
            <h3>{l.name}</h3>
            <p>
              {l.city} · {l.reason_not_confirmed}
            </p>
            <p className="small">{l.next_action}</p>
            <span className="proof">{l.source_ids}</span>
          </div>
        ))}
      </section>
      <section className="panel">
        <SectionHead
          kicker="THE EVIDENCE LIBRARY"
          title={`${data.sources.length} sources, with their limits`}
        />
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search sources"
            placeholder="Publisher, source ID or subject…"
            value={sourceQ}
            onChange={(e) => setSourceQ(e.target.value)}
          />
        </label>
        {data.sources
          .filter((s) =>
            [s.source_id, s.publisher, s.what_source_establishes]
              .join(" ")
              .toLowerCase()
              .includes(sourceQ.toLowerCase()),
          )
          .map((s) => (
            <div className="source" key={s.source_id}>
              <div>
                <span className="source-id">{s.source_id}</span>
                <Outside url={s.source_url}>{s.publisher}</Outside>
                <span className="tag neutral">
                  {s.access_method.replaceAll("_", " ").toLowerCase()}
                </span>
              </div>
              <p>{s.what_source_establishes}</p>
              <p className="small muted">
                {s.reliability_limitations} Accessed {dateText(s.date_accessed)}
                .
              </p>
            </div>
          ))}
      </section>
    </>
  );
}
