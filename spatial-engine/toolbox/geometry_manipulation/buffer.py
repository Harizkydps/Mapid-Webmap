import argparse
import json
import math
import sys

from pyproj import CRS, Transformer
from shapely import get_coordinates, wkt
from shapely.ops import transform

WGS84 = CRS.from_epsg(4326)
EARTH_RADIUS_M = 6_371_000


def _aeqd_distortion(projected_geom) -> tuple[float, float]:
    coords = get_coordinates(projected_geom)
    if len(coords) == 0:
        return 0.0, 0.0
    max_extent_m = float(((coords**2).sum(axis=1) ** 0.5).max())
    c = max_extent_m / EARTH_RADIUS_M
    distortion_pct = (c / math.sin(c) - 1) * 100 if c > 0 else 0.0
    return distortion_pct, distortion_pct * 10


def buffer_geometry(wkt_string: str, distance_m: float) -> dict:
    geom = wkt.loads(wkt_string)
    if geom.is_empty:
        raise ValueError("Input geometry is empty.")

    centroid = geom.centroid
    aeqd = CRS.from_proj4(
        f"+proj=aeqd +lat_0={centroid.y} +lon_0={centroid.x} "
        "+units=m +ellps=WGS84"
    )
    to_aeqd = Transformer.from_crs(WGS84, aeqd, always_xy=True).transform
    to_wgs84 = Transformer.from_crs(aeqd, WGS84, always_xy=True).transform

    projected = transform(to_aeqd, geom)
    buffered = projected.buffer(distance_m)
    result = transform(to_wgs84, buffered)

    distortion_pct, distortion_m_per_km = _aeqd_distortion(
        buffered if not buffered.is_empty else projected
    )

    return {
        "wkt": result.wkt,
        "distance_m": distance_m,
        "input_geometry_type": geom.geom_type,
        "output_geometry_type": result.geom_type,
        "accuracy": {
            "tangential_distortion_pct": round(distortion_pct, 2),
            "tangential_distortion_m_per_km": round(distortion_m_per_km, 2),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.geometry_manipulation.buffer",
        description=(
            "Buffer a WKT geometry by N meters and return the buffered "
            "geometry as WGS84 WKT."
        ),
    )
    parser.add_argument("geometry", help="Geometry as a WKT string.")
    parser.add_argument(
        "distance_m",
        type=float,
        help="Buffer distance in meters (negative shrinks polygons).",
    )
    args = parser.parse_args()

    try:
        result = buffer_geometry(args.geometry, args.distance_m)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
