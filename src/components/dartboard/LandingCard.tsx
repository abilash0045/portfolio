import type { Landing } from "@/lib/nominatim";
import type { LatLon } from "@/lib/geo/sample";

type Props = {
  result: Landing | null;
  landing: LatLon;
  error: string | null;
};

const coords = (p: LatLon): string => `${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`;

export default function LandingCard({ result, landing, error }: Props) {
  if (error) {
    return (
      <div className="card">
        <p className="card__name">{coords(landing)}</p>
        <p className="card__area">{error}</p>
        <p className="card__meta">Throw again, or try the same spot in a moment.</p>
      </div>
    );
  }

  if (!result) return null;

  if (result.kind === "nowhere") {
    return (
      <div className="card">
        <p className="card__name">Nothing named here</p>
        <p className="card__area">
          The map has no record of this spot. Most likely open water, possibly
          just unmapped ground.
        </p>
        <p className="card__meta">{coords(landing)}</p>
      </div>
    );
  }

  const where = [result.area, result.country].filter(Boolean).join(", ");

  return (
    <div className="card">
      <p className="card__name">{result.name}</p>
      {where && <p className="card__area">{where}</p>}
      <p className="card__meta">
        {result.category.replace(/_/g, " ")} · {coords(landing)}
      </p>
    </div>
  );
}
