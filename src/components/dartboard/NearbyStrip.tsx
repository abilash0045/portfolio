import type { Nearby } from "@/lib/overpass";

/**
 * Renders nothing when Overpass gave us nothing, which is often. The user was
 * never promised this, so its absence is not an error state.
 */
export default function NearbyStrip({ nearby }: { nearby: Nearby[] }) {
  if (nearby.length === 0) return null;

  return (
    <div>
      <p className="nearby__heading">While you&apos;re there</p>
      <ul className="nearby">
        {nearby.map((item) => (
          <li key={`${item.name}-${item.lat}`} className="nearby__item">
            {item.name}
            <span style={{ color: "#7d7267" }}> · {item.kind.replace(/_/g, " ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
