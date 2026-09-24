"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL } from "@/lib/site";

type CopyResult = "idle" | "copied" | "failed";

/** For screen readers, which do not reliably announce a button relabelling. */
const ANNOUNCEMENT: Record<CopyResult, string> = {
  idle: "",
  copied: `Copied ${EMAIL}.`,
  failed: `Your browser didn't let the page copy. The address is ${EMAIL}.`,
};

type Props = {
  className: string;
  /** Where the address is printed relative to this button, for the fallback. */
  addressIs: "above" | "below";
};

/**
 * Copies the address and says so only when it happened. It used to say
 * "Copied" unconditionally: the clipboard is missing outside a secure context
 * and refuses when permission is denied, and in both cases the button reported
 * a copy that never happened.
 */
export default function CopyEmail({ className, addressIs }: Props) {
  const [copy, setCopy] = useState<CopyResult>("idle");
  const resetRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetRef.current), []);

  const copyEmail = async () => {
    let result: CopyResult;
    try {
      await navigator.clipboard.writeText(EMAIL);
      result = "copied";
    } catch {
      result = "failed";
    }
    setCopy(result);
    window.clearTimeout(resetRef.current);
    resetRef.current = window.setTimeout(
      () => setCopy("idle"),
      result === "copied" ? 2500 : 6000,
    );
  };

  const label: Record<CopyResult, string> = {
    idle: "Copy email",
    copied: "Copied",
    failed: `Couldn't copy. It's ${addressIs}.`,
  };

  return (
    <>
      <button type="button" className={className} onClick={() => void copyEmail()}>
        {label[copy]}
      </button>
      <span className="visually-hidden" role="status">
        {ANNOUNCEMENT[copy]}
      </span>
    </>
  );
}
