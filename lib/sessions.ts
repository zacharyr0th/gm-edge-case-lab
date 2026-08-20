/**
 * Session clocks for the basis monitor.
 *
 * The monitor differences a live GM token quote against the last completed U.S.
 * regular close. That difference only reads as a dislocation when nothing is
 * trading. GM runs premarket, regular, postmarket and overnight sessions, so for
 * most of the week the token is actively repricing against news, Asian and
 * European hours, and — for crypto-linked wrappers — an underlying that never
 * stops. Knowing which session is live is what separates "this moved" from
 * "this is mispriced".
 *
 * Schedule per Ondo's Get Current Market Status documentation, in U.S. Eastern.
 * Holidays are not modeled; GM follows the NYSE calendar and this does not.
 */

export type GmSessionId = "premarket" | "regular" | "postmarket" | "overnight" | "paused" | "offhours";

export type GmSessionState = {
  id: GmSessionId;
  label: string;
  /** True while GM accepts orders — every session except a transition pause. */
  trading: boolean;
  /** True only during the U.S. regular session, when the underlying is also moving. */
  underlyingLive: boolean;
  note: string;
  nextLabel: string;
  minutesToNext: number;
};

export type ExchangeState = {
  id: string;
  city: string;
  region: "Asia" | "Europe" | "Americas";
  zone: string;
  localTime: string;
  open: boolean;
  minutesToNext: number;
};

type Clock = { weekday: number; minutes: number; time: string };

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(zone: string): Intl.DateTimeFormat {
  let cached = formatters.get(zone);
  if (!cached) {
    cached = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    formatters.set(zone, cached);
  }
  return cached;
}

/** Wall-clock weekday and minute-of-day in a zone, which is all the schedules need. */
export function clockIn(now: Date, zone: string): Clock {
  const parts = formatterFor(zone).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  return {
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: hour * 60 + minute,
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

const at = (hour: number, minute: number) => hour * 60 + minute;
const DAY = 24 * 60;

/** Ondo's published windows. Anything between them is a transition pause. */
const GM_WINDOWS: { id: Exclude<GmSessionId, "paused" | "offhours">; label: string; from: number; to: number; next: string; note: string }[] = [
  {
    id: "premarket",
    label: "Premarket",
    from: at(4, 1),
    to: at(9, 29),
    next: "Regular",
    note: "GM is trading and the U.S. regular session has not opened, so the close is still yesterday's.",
  },
  {
    id: "regular",
    label: "Regular",
    from: at(9, 31),
    to: at(15, 59),
    next: "Postmarket",
    note: "Both sides are moving. Nothing is priced against a close that is no longer current.",
  },
  {
    id: "postmarket",
    label: "Postmarket",
    from: at(16, 1),
    to: at(19, 59),
    next: "Overnight",
    note: "Today's close is set. Anything above or below it is the after-hours move, not a dislocation.",
  },
];

const OVERNIGHT_FROM = at(20, 5);
const OVERNIGHT_TO = at(3, 55);

const OVERNIGHT_NOTE =
  "GM trades while U.S. equities are shut. Gaps here are the overnight session repricing against Asian and European hours, not a premium.";

function minutesUntil(fromMinutes: number, toMinutes: number): number {
  const delta = toMinutes - fromMinutes;
  return delta > 0 ? delta : delta + DAY;
}

export function gmSessionAt(now: Date): GmSessionState {
  const { weekday, minutes } = clockIn(now, "America/New_York");
  const isWeekday = weekday >= 1 && weekday <= 5;

  // Overnight straddles midnight: it opens Sunday through Thursday evening and
  // runs into the following morning, so the two halves are tested separately.
  const inEveningHalf = minutes >= OVERNIGHT_FROM && (weekday === 0 || (weekday >= 1 && weekday <= 4));
  const inMorningHalf = minutes < OVERNIGHT_TO && isWeekday;
  if (inEveningHalf || inMorningHalf) {
    return {
      id: "overnight",
      label: "Overnight",
      trading: true,
      underlyingLive: false,
      note: OVERNIGHT_NOTE,
      nextLabel: "Premarket",
      minutesToNext: minutesUntil(minutes, at(4, 1)),
    };
  }

  // Friday after the postmarket close rolls straight into the weekend; there is
  // no overnight session to carry it, so it is off-hours like Saturday.
  const fridayNight = weekday === 5 && minutes > at(19, 59);
  if (isWeekday && !fridayNight) {
    for (const window of GM_WINDOWS) {
      if (minutes >= window.from && minutes <= window.to) {
        return {
          id: window.id,
          label: window.label,
          trading: true,
          underlyingLive: window.id === "regular",
          note: window.note,
          nextLabel: window.next,
          minutesToNext: minutesUntil(minutes, window.to),
        };
      }
    }
    // Between two windows on a weekday: one of Ondo's short transition pauses.
    const nextEdge = [at(4, 1), at(9, 31), at(16, 1), OVERNIGHT_FROM].find((edge) => edge > minutes) ?? at(4, 1);
    return {
      id: "paused",
      label: "Paused",
      trading: false,
      underlyingLive: false,
      note: "A scheduled transition pause between sessions. Trading resumes in a few minutes.",
      nextLabel: "Resumes",
      minutesToNext: minutesUntil(minutes, nextEdge),
    };
  }

  // Weekend. Ondo runs a separate off-hours venue here for assets that opt in.
  const daysToMonday = ((1 - weekday + 7) % 7) || 7;
  const minutesToMonday = daysToMonday * DAY - minutes + at(4, 1);
  return {
    id: "offhours",
    label: "Off-hours",
    trading: false,
    underlyingLive: false,
    note: "U.S. equities are shut for the weekend. Only assets that opt in to off-hours trading are quotable.",
    nextLabel: "Premarket",
    minutesToNext: minutesToMonday,
  };
}

/** Regular cash sessions. Lunch breaks are modeled where the venue takes one. */
const EXCHANGES: { id: string; city: string; region: ExchangeState["region"]; zone: string; windows: [number, number][] }[] = [
  { id: "tokyo", city: "Tokyo", region: "Asia", zone: "Asia/Tokyo", windows: [[at(9, 0), at(11, 30)], [at(12, 30), at(15, 0)]] },
  { id: "hongkong", city: "Hong Kong", region: "Asia", zone: "Asia/Hong_Kong", windows: [[at(9, 30), at(12, 0)], [at(13, 0), at(16, 0)]] },
  { id: "london", city: "London", region: "Europe", zone: "Europe/London", windows: [[at(8, 0), at(16, 30)]] },
  { id: "frankfurt", city: "Frankfurt", region: "Europe", zone: "Europe/Berlin", windows: [[at(9, 0), at(17, 30)]] },
  { id: "newyork", city: "New York", region: "Americas", zone: "America/New_York", windows: [[at(9, 30), at(16, 0)]] },
];

export function exchangeStatesAt(now: Date): ExchangeState[] {
  return EXCHANGES.map((exchange) => {
    const { weekday, minutes, time } = clockIn(now, exchange.zone);
    const isWeekday = weekday >= 1 && weekday <= 5;
    const openWindow = isWeekday ? exchange.windows.find(([from, to]) => minutes >= from && minutes < to) : undefined;
    const open = openWindow !== undefined;
    const nextEdge = open
      ? openWindow[1]
      : (isWeekday ? exchange.windows.map(([from]) => from).find((from) => from > minutes) : undefined) ??
        exchange.windows[0][0];
    return {
      id: exchange.id,
      city: exchange.city,
      region: exchange.region,
      zone: exchange.zone,
      localTime: time,
      open,
      minutesToNext: minutesUntil(minutes, nextEdge),
    };
  });
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
