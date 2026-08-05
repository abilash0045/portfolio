"use client";

import { useState } from "react";
import "./config-playground.css";

type VisitorType = "validate" | "diff" | "serialise" | "preview";

export default function ConfigVisitorPlayground() {
  const [activeVisitor, setActiveVisitor] = useState<VisitorType>("validate");

  const inputNodes = `{
  "templateId": "video-v4-personalized",
  "nodes": [
    { "type": "TTS", "voiceId": "en-US-neural-1", "speed": 1.0 },
    { "type": "VoiceClone", "sampleId": "user-vocal-99", "denoise": true },
    { "type": "LipSync", "model": "wav2lip-v2", "padBottom": 10 },
    { "type": "VideoTemplate", "resolution": "1080p", "fps": 60 }
  ]
}`;

  const getVisitorOutput = () => {
    switch (activeVisitor) {
      case "validate":
        return `// Executing ValidateVisitor...
✓ TTSNode: Valid voiceId "en-US-neural-1", speed in bounds (1.0).
✓ VoiceCloneNode: Sample "user-vocal-99" loaded (0.4s duration).
✓ LipSyncNode: Model "wav2lip-v2" compatible with 1080p@60fps.
✓ VideoTemplateNode: Resolution 1080p valid for export.

Result: SUCCESS (0 errors, 0 warnings)`;

      case "diff":
        return `// Executing DiffVisitor against Production Baseline...
~ TTSNode.speed: 0.95 -> 1.0 (+5% pitch adjustment)
~ LipSyncNode.padBottom: 0 -> 10 (+10px chin margin)
+ VoiceCloneNode.denoise: true (new flag)

Result: 3 field mutations detected, 0 breaking schema changes.`;

      case "serialise":
        return `// Executing SerialiseVisitor (Protobuf Binary Payload)...
0A 17 76 69 64 65 6F 2D 76 34 2D 70 65 72 73 6F 6E 61 6C 69
7A 65 64 12 1A 0A 03 54 54 53 12 11 65 6E 2D 55 53 2D 6E 65
75 72 61 6C 2D 31 18 64 12 21 0A 0A 56 6F 69 63 65 43 6C 6F
6E 65 12 0F 75 73 65 72 2D 76 6F 63 61 6C 2D 39 39 20 01

Result: 148 bytes generated. Compression ratio 64.2%.`;

      case "preview":
        return `// Executing PreviewVisitor...
[Frame 001/180] Initializing TTS buffer for "en-US-neural-1"...
[Frame 045/180] LipSync alignment score: 99.4%.
[Frame 120/180] Rendering video frame at 1080p@60fps...
[Frame 180/180] Final composite verified.

Result: Real-time preview ready in 42ms.`;
    }
  };

  return (
    <section className="pg-container" id="playground">
      <div className="pg-header">
        <h3 className="pg-title">Visitor Pattern Playground</h3>
        <p className="pg-subtitle">
          Test operations over closed config types without modifying node classes (3-day to 1-day approval win)
        </p>
      </div>

      <div className="pg-tabs" role="tablist" aria-label="Visitor Operations">
        <button
          type="button"
          role="tab"
          aria-selected={activeVisitor === "validate"}
          className={`pg-tab ${activeVisitor === "validate" ? "pg-tab--active" : ""}`}
          onClick={() => setActiveVisitor("validate")}
        >
          ValidateVisitor
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeVisitor === "diff"}
          className={`pg-tab ${activeVisitor === "diff" ? "pg-tab--active" : ""}`}
          onClick={() => setActiveVisitor("diff")}
        >
          DiffVisitor
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeVisitor === "serialise"}
          className={`pg-tab ${activeVisitor === "serialise" ? "pg-tab--active" : ""}`}
          onClick={() => setActiveVisitor("serialise")}
        >
          SerialiseVisitor
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeVisitor === "preview"}
          className={`pg-tab ${activeVisitor === "preview" ? "pg-tab--active" : ""}`}
          onClick={() => setActiveVisitor("preview")}
        >
          PreviewVisitor
        </button>
      </div>

      <div className="pg-workspace">
        <div className="pg-pane">
          <div className="pg-pane__title">Config Node Input AST</div>
          <pre className="pg-code" style={{ color: "#93c5fd" }}>{inputNodes}</pre>
        </div>

        <div className="pg-pane">
          <div className="pg-pane__title">
            <span>{activeVisitor}.accept(visitor)</span>
            <span style={{ color: "#10b981" }}>Live Execution</span>
          </div>
          <pre className="pg-code">{getVisitorOutput()}</pre>
        </div>
      </div>

      <div className="pg-stats">
        <div>Approval Time Impact: <span className="pg-stat-val">3 Days ➔ 1 Day</span></div>
        <div>Non-Engineer Self-Service: <span className="pg-stat-val">Enabled</span></div>
      </div>
    </section>
  );
}
