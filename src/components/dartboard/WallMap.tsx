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

const TILE_URL = "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

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

    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
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
      color: "#e63946",
      weight: 2,
      dashArray: "6 6",
      fillColor: "#e63946",
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
