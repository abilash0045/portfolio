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

/* CARTO ships the same basemap in both polarities. Only `dark_all` was ever
   used, so in light theme the map was a black slab dropped into a cream page. */
const TILE_URL = {
  dark: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
} as const;

type Polarity = keyof typeof TILE_URL;

/** The theme lives as an attribute on <html> and nothing broadcasts it. */
const readPolarity = (): Polarity =>
  document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

export default function WallMap({ origin, radiusM, landing, shake }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tilesRef = useRef<L.TileLayer | null>(null);

  // Init once. The ref guard survives React StrictMode's double-invoke in development.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([origin.lat, origin.lon], 9);

    tilesRef.current = L.tileLayer(TILE_URL[readPolarity()], {
      attribution: ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    // The theme toggle writes an attribute and tells nobody. Watching it beats
    // threading a theme context down here for one string.
    const observer = new MutationObserver(() =>
      tilesRef.current?.setUrl(TILE_URL[readPolarity()]),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      circleRef.current = null;
      markerRef.current = null;
      tilesRef.current = null;
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

    if (!landing) map.fitBounds(circle.getBounds(), { padding: [40, 40] });
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

    map.flyTo([landing.lat, landing.lon], 11, { duration: 0.9 });
  }, [landing]);

  return (
    <div className={`wallmap${shake ? " wallmap--shake" : ""}`}>
      <div ref={containerRef} className="wallmap__canvas" />
      <div className="wallmap__vignette" />
      <div className="wallmap__hud-overlay" />
    </div>
  );
}
