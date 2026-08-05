export type Landing =
  | {
      kind: "place";
      name: string;
      area: string;
      country: string;
      category: string;
    }
  | { kind: "nowhere" };

export type SearchResult = { name: string; lat: number; lon: number };

type Address = Partial<
  Record<
    | "city"
    | "town"
    | "village"
    | "hamlet"
    | "suburb"
    | "county"
    | "state_district"
    | "state"
    | "country",
    string
  >
>;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Nominatim reverse response into the one shape the UI understands.
 *
 * `nowhere` carries no reason on purpose. Nominatim returns the same
 * "Unable to geocode" body for an ocean coordinate and for unmapped land,
 * and there is no field that separates them, so claiming to know which
 * would be a guess dressed as a fact.
 */
export function normaliseReverse(raw: unknown): Landing {
  if (!isRecord(raw)) return { kind: "nowhere" };
  if (typeof raw.error === "string") return { kind: "nowhere" };

  const address: Address = isRecord(raw.address) ? (raw.address as Address) : {};
  const displayName = str(raw.display_name);

  const name = str(raw.name) || displayName.split(",")[0]?.trim() || "";
  if (!name) return { kind: "nowhere" };

  const country = str(address.country);
  const category = str(raw.addresstype) || str(raw.type) || "place";

  const areaParts = [
    address.city ?? address.town ?? address.suburb,
    address.state_district ?? address.county,
    address.state,
  ]
    .map(str)
    .filter((part) => part.length > 0 && part !== name);

  const area = [...new Set(areaParts)].join(", ");

  return { kind: "place", name, area, country, category };
}

/** Nominatim forward-search response into pickable locations. */
export function normaliseSearch(raw: unknown): SearchResult[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry): SearchResult[] => {
    if (!isRecord(entry)) return [];
    const name = str(entry.display_name);
    const lat = Number(entry.lat);
    const lon = Number(entry.lon);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return [{ name, lat, lon }];
  });
}
