"use client";

import { useState } from "react";
import type { LatLon } from "@/lib/geo/sample";
import type { SearchResult } from "@/lib/nominatim";
import { MIN_RADIUS_M, MAX_RADIUS_M } from "./useDartboard";

type Props = {
  radiusM: number;
  onRadiusChange: (m: number) => void;
  onThrow: () => void;
  disabled: boolean;
  needsManualLocation: boolean;
  onOriginChange: (origin: LatLon) => void;
};

/** Matches the bound the search route enforces, so the 400 is unreachable. */
const MAX_QUERY = 120;

/**
 * Every outcome the search can have, as one value. It used to be a results
 * array plus a searching flag, and three of the outcomes below rendered as
 * an empty array: too short, no match, and upstream down all looked like
 * "nothing happened".
 */
type SearchState =
  | { kind: "idle" }
  | { kind: "tooShort" }
  | { kind: "searching" }
  | { kind: "results"; results: SearchResult[] }
  | { kind: "empty"; query: string }
  | { kind: "failed" };

export default function ThrowControls({
  radiusM,
  onRadiusChange,
  onThrow,
  disabled,
  needsManualLocation,
  onOriginChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ kind: "idle" });

  async function runSearch() {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearch({ kind: "tooShort" });
      return;
    }

    setSearch({ kind: "searching" });
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!response.ok) throw new Error("search");

      const body = (await response.json()) as {
        results?: SearchResult[];
        error?: string;
      };
      if (body.error) throw new Error(body.error);

      const results = body.results ?? [];
      setSearch(
        results.length > 0
          ? { kind: "results", results }
          : { kind: "empty", query: trimmed },
      );
    } catch {
      setSearch({ kind: "failed" });
    }
  }

  return (
    <div>
      {needsManualLocation && (
        <div className="locsearch" style={{ marginBottom: 14 }}>
          <input
            className="locsearch__input"
            value={query}
            maxLength={MAX_QUERY}
            onChange={(event) => {
              setQuery(event.target.value);
              // Whatever the last attempt said is about the old query.
              if (search.kind !== "idle") setSearch({ kind: "idle" });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") void runSearch();
            }}
            placeholder="Where are you? Try a town or city"
            aria-label="Search for your location"
            aria-describedby="locsearch-status"
          />
          <button
            type="button"
            className="locsearch__button"
            onClick={() => void runSearch()}
            disabled={search.kind === "searching"}
          >
            {search.kind === "searching" ? "Searching" : "Find it"}
          </button>

          {/* Three of the outcomes below used to render as nothing at all:
              the button went back to "Find it" and the visitor was told
              neither what had happened nor what to do about it. */}
          <p className="locsearch__status" id="locsearch-status" role="status">
            {search.kind === "tooShort" &&
              "Type at least two letters, then search again."}
            {search.kind === "empty" &&
              `Nothing matched "${search.query}". Try a nearby town, or check the spelling.`}
            {search.kind === "failed" &&
              "Couldn't reach the place lookup. Try again in a moment, or throw from where the map already is."}
          </p>

          {search.kind === "results" && (
            <ul className="locsearch__results">
              {search.results.map((result) => (
                <li key={`${result.lat},${result.lon}`}>
                  <button
                    type="button"
                    className="locsearch__result"
                    onClick={() => {
                      onOriginChange({ lat: result.lat, lon: result.lon });
                      setSearch({ kind: "idle" });
                      setQuery("");
                    }}
                  >
                    {result.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="controls">
        <div>
          <label className="controls__label" htmlFor="radius">
            Throwing range: {Math.round(radiusM / 1000)} km
          </label>
          <input
            id="radius"
            className="controls__slider"
            type="range"
            min={MIN_RADIUS_M}
            max={MAX_RADIUS_M}
            step={5_000}
            value={radiusM}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
          />
        </div>
        <button
          type="button"
          className="controls__throw"
          onClick={onThrow}
          disabled={disabled}
        >
          Throw the dart
        </button>
      </div>
    </div>
  );
}
