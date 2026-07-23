import argparse
import json
import sys

from pyproj import Geod
from shapely import wkt
from shapely.ops import nearest_points

GEOD = Geod(ellps="WGS84")


def calculate_distance(wkt_a: str, wkt_b: str) -> dict:
    geom_a = wkt.loads(wkt_a)
    geom_b = wkt.loads(wkt_b)

    point_a, point_b = nearest_points(geom_a, geom_b)
    _, _, distance = GEOD.inv(point_a.x, point_a.y, point_b.x, point_b.y)

    return {
        "distance_m": distance,
        "unit": "meters",
        "nearest_point_1": {"lon": point_a.x, "lat": point_a.y},
        "nearest_point_2": {"lon": point_b.x, "lat": point_b.y},
        "geometry_1_type": geom_a.geom_type,
        "geometry_2_type": geom_b.geom_type,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.spatial_computation.distance",
        description="Geodesic distance (WGS84) between two WKT geometries.",
    )
    parser.add_argument("geometry_1", help="First geometry as a WKT string.")
    parser.add_argument("geometry_2", help="Second geometry as a WKT string.")
    args = parser.parse_args()

    try:
        result = calculate_distance(args.geometry_1, args.geometry_2)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
