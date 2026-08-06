"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import "./config-playground.css";

type VisitorType = "validate" | "diff" | "serialise" | "preview";

const VISITORS: { id: VisitorType; label: string }[] = [
  { id: "validate", label: "ValidateVisitor" },
  { id: "diff", label: "DiffVisitor" },
  { id: "serialise", label: "SerialiseVisitor" },
  { id: "preview", label: "PreviewVisitor" },
];

const PANEL_ID = "pg-visitor-output";
const tabId = (visitor: VisitorType) => `pg-tab-${visitor}`;

export default function ConfigVisitorPlayground() {
  const [activeVisitor, setActiveVisitor] = useState<VisitorType>("validate");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedLabel =
    VISITORS.find((visitor) => visitor.id === activeVisitor)?.label ?? "";

  // The keyboard half of the tab role. Arrow keys move between tabs and
  // selection follows focus; Tab itself leaves the group, which is why only
  // the selected tab is in the tab order. Up and Down are deliberately not
  // handled: this list is horizontal, and swallowing them would take page
  // scrolling away from anyone standing on a tab.
  function moveSelection(event: KeyboardEvent<HTMLButtonElement>) {
    const current = VISITORS.findIndex((visitor) => visitor.id === activeVisitor);
    let next = current;

    switch (event.key) {
      case "ArrowRight":
        next = (current + 1) % VISITORS.length;
        break;
      case "ArrowLeft":
        next = (current - 1 + VISITORS.length) % VISITORS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = VISITORS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveVisitor(VISITORS[next].id);
    tabRefs.current[next]?.focus();
  }

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

      <div className="pg-tabs" role="tablist" aria-label="Visitor operations">
        {VISITORS.map((visitor, index) => {
          const selected = visitor.id === activeVisitor;
          return (
            <button
              key={visitor.id}
              type="button"
              role="tab"
              id={tabId(visitor.id)}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              aria-selected={selected}
              aria-controls={PANEL_ID}
              tabIndex={selected ? 0 : -1}
              className="pg-tab"
              onClick={() => setActiveVisitor(visitor.id)}
              onKeyDown={moveSelection}
            >
              {visitor.label}
            </button>
          );
        })}
      </div>

      <div className="pg-workspace">
        <div className="pg-pane">
          <div className="pg-pane__title">Config Node Input AST</div>
          <pre className="pg-code pg-code--input">{inputNodes}</pre>
        </div>

        {/* One panel serving four tabs, so it is labelled by whichever tab is
            selected. tabIndex 0 because it holds no focusable content of its
            own and a keyboard visitor still has to be able to reach the text
            the tabs just changed. */}
        <div
          className="pg-pane"
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={tabId(activeVisitor)}
          tabIndex={0}
        >
          <div className="pg-pane__title">
            {/* node.accept(visitor), the way round the pattern actually goes.
                This used to render "validate.accept(visitor)". */}
            <span>config.accept({selectedLabel})</span>
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
