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

export default function ThrowControls({
  radiusM,
  onRadiusChange,
  onThrow,
  disabled,
  needsManualLocation,
  onOriginChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function runSearch() {
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const body = (await response.json()) as { results?: SearchResult[] };
      setResults(body.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      {needsManualLocation && (
        <div className="locsearch" style={{ marginBottom: 14 }}>
          <input
            className="locsearch__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void runSearch();
            }}
            placeholder="Where are you? Try a town or city"
            aria-label="Search for your location"
          />
          <button
            type="button"
            className="locsearch__button"
            onClick={() => void runSearch()}
            disabled={searching}
          >
            {searching ? "Searching" : "Find it"}
          </button>
          {results.length > 0 && (
            <ul className="locsearch__results" style={{ flexBasis: "100%" }}>
              {results.map((result) => (
                <li key={`${result.lat},${result.lon}`}>
                  <button
                    type="button"
                    className="locsearch__result"
                    onClick={() => {
                      onOriginChange({ lat: result.lat, lon: result.lon });
                      setResults([]);
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
