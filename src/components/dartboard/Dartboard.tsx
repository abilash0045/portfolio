"use client";

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
  loading: () => <div style={{ width: "100%", height: "100%", background: "#e8e0cf" }} />,
});

export default function Dartboard() {
  const board = useDartboard();

  return (
    <main className="dartboard">
      {/* Floating Top Navigation Header */}
      <header className="dartboard__header">
        <Link href="/" className="dartboard__back-btn">
          ← Portfolio
        </Link>
        <div className="dartboard__header-title">
          <span>🎯 Interactive Dartboard Map</span>
        </div>
      </header>

      <div className="dartboard__stage">
        {board.origin && (
          <WallMap
            origin={board.origin}
            radiusM={board.radiusM}
            landing={board.phase === "throwing" ? null : board.landing}
            shake={board.phase === "landed" || board.phase === "error"}
          />
        )}
        {board.phase === "throwing" && <div className="dart" aria-hidden="true" />}
      </div>

      <div className="dartboard__panel">
        <ThrowControls
          radiusM={board.radiusM}
          onRadiusChange={board.setRadiusM}
          onThrow={board.throwDart}
          disabled={board.phase === "locating" || board.phase === "throwing"}
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
    </main>
  );
}
