"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useDartboard } from "./useDartboard";
import ThrowControls from "./ThrowControls";
import LandingCard from "./LandingCard";
import NearbyStrip from "./NearbyStrip";
import "./dartboard.css";

// Leaflet reads `window` at import time, so it can never be server-rendered.
const WallMap = dynamic(() => import("./WallMap"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "var(--color-paper)" }} />,
});

type Props = {
  embedded?: boolean;
};

/** How far ahead of the viewport the map starts loading. */
const PRELOAD_MARGIN = "300px 0px";

export default function Dartboard({ embedded = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  // On its own page the map is the point, so it loads immediately. Embedded on
  // the home page it sits five sections down, and loading Leaflet, its
  // stylesheet and a screen of tiles on first paint costs every visitor about
  // 160 KB plus a location prompt for something most of them never scroll to.
  const [active, setActive] = useState(!embedded);
  const board = useDartboard(active);

  useEffect(() => {
    if (active) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setActive(true);
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={rootRef}
      // A keyboard visitor can reach the controls before the observer fires.
      // Focus entering the board counts as arriving at it.
      onFocus={() => setActive(true)}
      className={`dartboard ${embedded ? "dartboard--embedded" : ""}`}
      id={embedded ? "dartboard-embedded" : "dartboard"}
    >
      {/* Floating Top Navigation Header */}
      <header className="dartboard__header">
        {!embedded ? (
          <Link href="/" className="dartboard__back-btn">
            ← Portfolio
          </Link>
        ) : (
          <div className="dartboard__header-title">
            <span>Pick a range, then throw.</span>
          </div>
        )}

        <div className="dartboard__header-actions">
          {embedded ? (
            <Link href="/dartboard" className="dartboard__fullscreen-btn">
              Open the full map ↗
            </Link>
          ) : (
            <div className="dartboard__header-title">
              <span>Pick a range, then throw.</span>
            </div>
          )}
        </div>
      </header>

      <div className="dartboard__stage">
        {board.origin ? (
          <WallMap
            origin={board.origin}
            radiusM={board.radiusM}
            landing={board.phase === "throwing" ? null : board.landing}
            shake={board.phase === "landed" || board.phase === "error"}
          />
        ) : (
          board.phase === "locating" && (
            <p className="dartboard__stage-note" role="status">
              Asking your browser where you are. Turn it down and you can search
              for a place instead.
            </p>
          )
        )}
        {board.phase === "throwing" && <div className="dart" aria-hidden="true" />}
      </div>

      <div className="dartboard__panel">
        <ThrowControls
          radiusM={board.radiusM}
          onRadiusChange={board.setRadiusM}
          onThrow={board.throwDart}
          disabled={!board.origin || board.phase === "throwing"}
          needsManualLocation={board.needsManualLocation}
          onOriginChange={board.setOrigin}
        />

        <div aria-live="polite">
          {board.landing && board.phase !== "throwing" && (
            <LandingCard
              result={board.result}
              landing={board.landing}
              error={board.error}
            />
          )}
          <div style={{ marginTop: 12 }}>
            <NearbyStrip nearby={board.nearby} />
          </div>
        </div>
      </div>
    </div>
  );
}
