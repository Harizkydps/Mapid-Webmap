import argparse
import json
import sys

from pyproj import Geod
from shapely import wkt

GEOD = Geod(ellps="WGS84")
LINE_TYPES = {"LineString", "MultiLineString"}
POLYGON_TYPES = {"Polygon", "MultiPolygon"}


def calculate_length(wkt_string: str) -> dict:
    geom = wkt.loads(wkt_string)

    if geom.geom_type in LINE_TYPES:
        return {
            "length_m": GEOD.geometry_length(geom),
            "unit": "meters",
            "geometry_type": geom.geom_type,
        }

    if geom.geom_type not in POLYGON_TYPES:
        raise ValueError(
            "Expected (Multi)LineString or (Multi)Polygon, "
            f"got {geom.geom_type}."
        )

    polygons = geom.geoms if geom.geom_type == "MultiPolygon" else [geom]
    inner_ring_length_m = sum(
        GEOD.geometry_length(ring) for p in polygons for ring in p.interiors
    )

    return {
        "length_m": GEOD.geometry_length(geom.boundary),
        "inner_ring_length_m": inner_ring_length_m,
        "unit": "meters",
        "geometry_type": geom.geom_type,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.spatial_computation.length",
        description=(
            "Geodesic length (WGS84) of a (Multi)LineString, or perimeter of "
            "a (Multi)Polygon (including holes), in meters."
        ),
    )
    parser.add_argument(
        "geometry",
        help="(Multi)LineString or (Multi)Polygon as a WKT string.",
    )
    args = parser.parse_args()

    try:
        result = calculate_length(args.geometry)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
