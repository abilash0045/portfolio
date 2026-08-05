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

const TILE_URL = "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

export default function WallMap({ origin, radiusM, landing, shake }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Init once. The ref guard also survives React StrictMode's double-invoke
  // in development, which would otherwise leave two maps on one container.
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
      color: "#7a3b2e",
      weight: 2,
      dashArray: "6 6",
      fillColor: "#b3241c",
      fillOpacity: 0.06,
    }).addTo(map);
    circleRef.current = circle;

    if (!landing) map.fitBounds(circle.getBounds(), { padding: [40, 40] });
  }, [origin.lat, origin.lon, radiusM, landing]);

  // Landing pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.remove();
    markerRef.current = null;
    if (!landing) return;

    const marker = L.marker([landing.lat, landing.lon], {
      icon: L.divIcon({
        className: "",
        html: '<div class="dartpin" aria-hidden="true"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      keyboard: false,
    }).addTo(map);
    markerRef.current = marker;

    map.flyTo([landing.lat, landing.lon], 11, { duration: 0.9 });
  }, [landing]);

  return (
    <div className={`wallmap${shake ? " wallmap--shake" : ""}`}>
      <div ref={containerRef} className="wallmap__canvas" />
      <div className="wallmap__grain" />
      <div className="wallmap__vignette" />
      <span className="wallmap__pin wallmap__pin--tl" />
      <span className="wallmap__pin wallmap__pin--tr" />
      <span className="wallmap__pin wallmap__pin--bl" />
      <span className="wallmap__pin wallmap__pin--br" />
    </div>
  );
}
