"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sampleInRadius, type LatLon } from "@/lib/geo/sample";
import type { Landing } from "@/lib/nominatim";
import type { Nearby } from "@/lib/overpass";

export const MIN_RADIUS_M = 10_000;
export const MAX_RADIUS_M = 500_000;

/** Kanyakumari. Only used if geolocation is denied and no search is made. */
const FALLBACK_ORIGIN: LatLon = { lat: 8.0883, lon: 77.5385 };

export type Phase = "locating" | "ready" | "throwing" | "landed" | "error";

/** How long the dart is in the air before the result is revealed. */
const FLIGHT_MS = 700;

export function useDartboard() {
  const [phase, setPhase] = useState<Phase>("locating");
  const [origin, setOriginState] = useState<LatLon | null>(null);
  const [radiusM, setRadiusM] = useState(100_000);
  const [landing, setLanding] = useState<LatLon | null>(null);
  const [result, setResult] = useState<Landing | null>(null);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsManualLocation, setNeedsManualLocation] = useState(false);

  // Guards a late enrichment response from a previous throw overwriting the
  // strip belonging to the current one.
  const throwIdRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      queueMicrotask(() => {
        setOriginState(FALLBACK_ORIGIN);
        setNeedsManualLocation(true);
        setPhase("ready");
      });
      return;
    }

    let settled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        setOriginState({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setPhase("ready");
      },
      () => {
        if (settled) return;
        settled = true;
        // Denied or unavailable is not an error state. Give them a starting
        // point and a search box.
        setOriginState(FALLBACK_ORIGIN);
        setNeedsManualLocation(true);
        setPhase("ready");
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  const setOrigin = useCallback((next: LatLon) => {
    setOriginState(next);
    setLanding(null);
    setResult(null);
    setNearby([]);
    setError(null);
    setNeedsManualLocation(false);
    setPhase("ready");
  }, []);

  const throwDart = useCallback(() => {
    if (!origin) return;

    const point = sampleInRadius(origin, radiusM);
    const id = throwIdRef.current + 1;
    throwIdRef.current = id;

    setLanding(point);
    setResult(null);
    setNearby([]);
    setError(null);
    setPhase("throwing");

    const query = `lat=${point.lat}&lon=${point.lon}`;

    // The blocking call. The result card cannot appear before this answers.
    const reverse = fetch(`/api/reverse?${query}`).then(async (response) => {
      if (!response.ok) throw new Error("upstream");
      return (await response.json()) as Landing;
    });

    // The dart is in the air for a fixed beat, so a fast API response does not
    // make the result pop in before the animation reads as a throw.
    const flight = new Promise((resolve) => setTimeout(resolve, FLIGHT_MS));

    Promise.all([reverse, flight])
      .then(([landed]) => {
        if (throwIdRef.current !== id) return;
        setResult(landed);
        setPhase("landed");
      })
      .catch(() => {
        if (throwIdRef.current !== id) return;
        setError("Couldn't reach the map service. The dart landed, we just can't name the spot.");
        setPhase("error");
      });

    // Enrichment. Never awaited, never blocks, and a failure is silence.
    fetch(`/api/nearby?${query}`)
      .then(async (response) => (await response.json()) as { nearby?: Nearby[] })
      .then((body) => {
        if (throwIdRef.current !== id) return;
        setNearby(Array.isArray(body.nearby) ? body.nearby : []);
      })
      .catch(() => {
        /* Overpass fails about one call in three. The strip stays empty. */
      });
  }, [origin, radiusM]);

  return {
    phase,
    origin,
    radiusM,
    setRadiusM,
    landing,
    result,
    nearby,
    error,
    needsManualLocation,
    throwDart,
    setOrigin,
  };
}
