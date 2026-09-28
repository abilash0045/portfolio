import { monthLabel, type Period } from "@/content/resume";

/** "May 2023 to now", with each month in a <time> a machine can read too. */
export default function When({ start, end }: Period) {
  return (
    <>
      <time dateTime={start}>{monthLabel(start)}</time> to{" "}
      {end ? <time dateTime={end}>{monthLabel(end)}</time> : "now"}
    </>
  );
}
