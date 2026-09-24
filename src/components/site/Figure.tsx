import { Fragment } from "react";

/**
 * A figure like "60% → 98%" with the arrow drawn in the accent. The arrow is
 * hidden from screen readers and replaced by "to", which is what it means;
 * read aloud it came out as "rightwards arrow".
 */
export default function Figure({ value }: { value: string }) {
  return (
    <>
      {value.split("→").map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <>
              <span className="figure-arrow" aria-hidden="true">
                →
              </span>
              <span className="visually-hidden">to</span>
            </>
          )}
          {part}
        </Fragment>
      ))}
    </>
  );
}
