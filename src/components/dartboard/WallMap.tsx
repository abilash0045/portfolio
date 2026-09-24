"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./wallmap.css";
import type { LatLon } from "@/lib/geo/sample";

type Props = {
  origin: LatLon;
  radiusM: number;
  landing: LatLon | null;
  shake: boolean;
};

/* OpenStreetMap's own tiles. This was CARTO's dark_all and light_all until
   CARTO started stamping every tile requested without an API key with "API KEY
   REQUIRED", in late August 2026. OSM ships one full-colour style, so each
   theme is a CSS filter on the tile pane in wallmap.css, which also means
   nothing here has to watch the theme. */
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/* Leaflet pans and flies in JavaScript, which the reduced-motion rule in
   globals.css cannot reach. Asked on every move, so changing the setting
   applies from the next throw. */
const animate = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function WallMap({ origin, radiusM, landing, shake }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Init once. The ref guard survives React StrictMode's double-invoke in development.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([origin.lat, origin.lon], 9);

    L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      circleRef.current = null;
      markerRef.current = null;
    };
    // Deliberately runs once. Origin changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Radius circle, redrawn whenever the origin or the slider moves.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    circleRef.current?.remove();
    const circle = L.circle([origin.lat, origin.lon], {
      radius: radiusM,
      color: "var(--color-accent)",
      weight: 2,
      dashArray: "6 6",
      fillColor: "var(--color-accent)",
      fillOpacity: 0.12,
    }).addTo(map);
    circleRef.current = circle;

    if (!landing) map.fitBounds(circle.getBounds(), { padding: [40, 40], animate: animate() });
  }, [origin.lat, origin.lon, radiusM, landing]);

  // Landing pin with neon glow and expanding ripple animation.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.remove();
    markerRef.current = null;
    if (!landing) return;

    const marker = L.marker([landing.lat, landing.lon], {
      icon: L.divIcon({
        className: "",
        html: `
          <div class="dartpin-glow" aria-hidden="true">
            <div class="dartpin-core"></div>
            <div class="dartpin-ripple"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
      keyboard: false,
    }).addTo(map);
    markerRef.current = marker;

    map.flyTo([landing.lat, landing.lon], 11, { duration: 0.9, animate: animate() });
  }, [landing]);

  return (
    <div className={`wallmap${shake ? " wallmap--shake" : ""}`}>
      <div ref={containerRef} className="wallmap__canvas" />
      <div className="wallmap__vignette" />
      <div className="wallmap__hud-overlay" />
    </div>
  );
}
