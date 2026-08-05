"use client";

import { useState } from "react";
import "./pipeline-simulator.css";

export default function PipelineSimulator() {
  const [storageMode, setStorageMode] = useState<"efs" | "ephemeral">("ephemeral");
  const [cacheMode, setCacheMode] = useState<"none" | "redis">("redis");

  const reliability = storageMode === "ephemeral" ? 98 : 60;
  const costReduction = cacheMode === "redis" ? 40 : 0;
  const cacheHitRate = cacheMode === "redis" ? 80 : 0;

  return (
    <section className="sim-container" id="architecture">
      <div className="sim-container__header">
        <div>
          <h3 className="sim-container__title">The storage decision, side by side</h3>
          <p className="sim-container__subtitle">
            Toggle between what the pipeline did before and after. The numbers are the real ones from the change, not a simulation.
          </p>
        </div>

        <div className="sim-controls">
          <div className="sim-btn-group" aria-label="Storage Mode Toggle">
            <button
              type="button"
              className={`sim-btn ${storageMode === "efs" ? "sim-btn--active" : ""}`}
              onClick={() => setStorageMode("efs")}
            >
              Shared EFS (Legacy)
            </button>
            <button
              type="button"
              className={`sim-btn ${storageMode === "ephemeral" ? "sim-btn--active-green" : ""}`}
              onClick={() => setStorageMode("ephemeral")}
            >
              Ephemeral Disk (Current)
            </button>
          </div>

          <div className="sim-btn-group" aria-label="Caching Mode Toggle">
            <button
              type="button"
              className={`sim-btn ${cacheMode === "none" ? "sim-btn--active" : ""}`}
              onClick={() => setCacheMode("none")}
            >
              No Cache
            </button>
            <button
              type="button"
              className={`sim-btn ${cacheMode === "redis" ? "sim-btn--active-green" : ""}`}
              onClick={() => setCacheMode("redis")}
            >
              Redis Segment Cache
            </button>
          </div>
        </div>
      </div>

      <div className="sim-grid">
        {/* Animated Visual Pipeline Flow */}
        <div className="sim-flow">
          <div className="sim-nodes">
            <div className="sim-node">
              <div className="sim-node__title">Kafka / PubSub</div>
              <div className="sim-node__detail">Render Queue</div>
            </div>

            <div className={`sim-node ${storageMode === "efs" ? "sim-node--error" : "sim-node--success"}`}>
              <div className="sim-node__title">Render Worker</div>
              <div className="sim-node__detail">
                {storageMode === "efs" ? "EFS Concurrent Lock" : "Pod Ephemeral Disk"}
              </div>
            </div>

            <div className={`sim-node ${cacheMode === "redis" ? "sim-node--cached" : ""}`}>
              <div className="sim-node__title">Segment Cache</div>
              <div className="sim-node__detail">
                {cacheMode === "redis" ? "Redis (80% Hit Rate)" : "Bypassed"}
              </div>
            </div>

            <div className="sim-node">
              <div className="sim-node__title">Output Delivery</div>
              <div className="sim-node__detail">25k Renders/Day</div>
            </div>
          </div>

          <div className="sim-explain">
            {storageMode === "efs" ? (
              <span className="sim-explain__bad">
                <strong>Shared EFS:</strong> Concurrent reads/writes cause MOV atom corruption mid-render. 40% of renders fail un-reproducibly.
              </span>
            ) : (
              <span className="sim-explain__good">
                <strong>Pod-local disk:</strong> Renders complete on pod-local disk before publishing. MOV atom corruption eliminated (98% reliability).
              </span>
            )}
          </div>
        </div>

        
        <div className="sim-metrics">
          <div className="sim-card">
            <div className="sim-card__label">Render Reliability</div>
            <div className="sim-card__value">
              <span>{reliability}%</span>
              <span className={`sim-badge ${reliability === 98 ? "sim-badge--success" : "sim-badge--danger"}`}>
                {reliability === 98 ? "Production Target" : "40% Failures"}
              </span>
            </div>
            <div className="sim-bar-bg">
              <div
                className="sim-bar-fill"
                style={{
                  width: `${reliability}%`,
                  backgroundColor: reliability === 98 ? "var(--color-ink)" : "var(--color-accent)",
                }}
              />
            </div>
          </div>

          <div className="sim-card">
            <div className="sim-card__label">Cloud Spend Reduction</div>
            <div className="sim-card__value">
              <span>~{costReduction}%</span>
              <span className={`sim-badge ${costReduction > 0 ? "sim-badge--info" : "sim-badge--danger"}`}>
                {cacheMode === "redis" ? `${cacheHitRate}% Cache Hits` : "Uncached Spend"}
              </span>
            </div>
            <div className="sim-bar-bg">
              <div
                className="sim-bar-fill"
                style={{
                  width: `${costReduction}%`,
                  backgroundColor: costReduction > 0 ? "var(--color-ink)" : "var(--color-accent)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
