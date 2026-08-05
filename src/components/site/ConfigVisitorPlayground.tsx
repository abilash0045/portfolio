"use client";

import { useState } from "react";
import "./config-playground.css";

type VisitorType = "validate" | "diff" | "serialise" | "preview";

export default function ConfigVisitorPlayground() {
  const [activeVisitor, setActiveVisitor] = useState<VisitorType>("validate");

  // An illustration of the pattern, not a transcript of a production system.
  // The node types are the real shape of the problem; the values are
  // deliberately generic. Publishing a real template id, model name or sample
  // id would either leak an employer's internals or invent them, and both are
  // the same mistake wearing different clothes.
  const inputNodes = `{
  "template": "example-template",
  "nodes": [
    { "type": "TTS",           "voice": "voice-a", "speed": 1.0 },
    { "type": "VoiceClone",    "sample": "sample-a", "denoise": true },
    { "type": "LipSync",       "model": "model-a", "padBottom": 10 },
    { "type": "VideoTemplate", "resolution": "1080p", "fps": 60 }
  ]
}`;

  const getVisitorOutput = () => {
    switch (activeVisitor) {
      case "validate":
        return `ValidateVisitor

Walks every node and checks its own constraints. Each node type
accepts the visitor and hands over the fields it owns.

  TTSNode            speed within the allowed range
  VoiceCloneNode     sample present and readable
  LipSyncNode        model compatible with the target resolution
  VideoTemplateNode  resolution valid for export

Adding a new check means writing one visitor, not editing four
node classes.`;

      case "diff":
        return `DiffVisitor

Same traversal, different operation. Compares this config against
a baseline and reports what moved.

  ~ TTSNode.speed            changed
  ~ LipSyncNode.padBottom    changed
  + VoiceCloneNode.denoise   added

The node classes did not change to support this. That is the whole
argument for the pattern.`;

      case "serialise":
        return `SerialiseVisitor

Turns the tree into a wire format. Each node contributes its own
encoding; the visitor owns the framing and the ordering.

  template   -> length-prefixed string
  nodes[]    -> repeated message, one per node type
  scalars    -> varint

A new wire format is a new visitor. The tree stays where it is.`;

      case "preview":
        return `PreviewVisitor

The reason the playground exists. Renders the config against a
sample so a solution engineer can see the result before anyone
commits it.

  resolve assets -> compose -> render sample frames

This is what took the config approval cycle from three days to one:
the person tuning the config stopped needing an engineer to see
what it did.`;
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
          <pre className="pg-code pg-code--input">{inputNodes}</pre>
        </div>

        <div className="pg-pane">
          <div className="pg-pane__title">
            <span>{activeVisitor}.accept(visitor)</span>
            <span className="pg-pane__note">Illustration, not a live system</span>
          </div>
          <pre className="pg-code">{getVisitorOutput()}</pre>
        </div>
      </div>

      <div className="pg-stats">
        <div>Approval Time Impact: <span className="pg-stat-val">3 days to 1 day</span></div>
        <div>Non-Engineer Self-Service: <span className="pg-stat-val">Enabled</span></div>
      </div>
    </section>
  );
}
