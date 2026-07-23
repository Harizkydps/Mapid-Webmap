import argparse
import json
import sys

from pyproj import Geod
from shapely import MultiPolygon, wkt
from shapely.geometry.polygon import orient

GEOD = Geod(ellps="WGS84")
SQUARE_METERS_PER_HECTARE = 10_000


def calculate_area(wkt_string: str) -> dict:
    geom = wkt.loads(wkt_string)
    if geom.geom_type == "Polygon":
        oriented = orient(geom, sign=1.0)
    elif geom.geom_type == "MultiPolygon":
        oriented = MultiPolygon([orient(p, sign=1.0) for p in geom.geoms])
    else:
        raise ValueError(
            f"Expected Polygon or MultiPolygon, got {geom.geom_type}."
        )

    area_m2, _ = GEOD.geometry_area_perimeter(oriented)
    area_m2 = abs(area_m2)

    return {
        "area_ha": area_m2 / SQUARE_METERS_PER_HECTARE,
        "unit": "hectares",
        "geometry_type": geom.geom_type,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.spatial_computation.area",
        description="Geodesic area (WGS84) of a (Multi)Polygon WKT, in hectares.",
    )
    parser.add_argument("geometry", help="(Multi)Polygon as a WKT string.")
    args = parser.parse_args()

    try:
        result = calculate_area(args.geometry)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
