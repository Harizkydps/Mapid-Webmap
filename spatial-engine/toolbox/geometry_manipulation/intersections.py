import argparse
import json
import sys

from shapely import wkt


def intersect_geometries(wkt_a: str, wkt_b: str) -> dict:
    geom_a = wkt.loads(wkt_a)
    geom_b = wkt.loads(wkt_b)

    if geom_a.is_empty or geom_b.is_empty:
        raise ValueError("Input geometry is empty.")

    result = geom_a.intersection(geom_b)

    return {
        "wkt": result.wkt,
        "geometry_1_type": geom_a.geom_type,
        "geometry_2_type": geom_b.geom_type,
        "output_geometry_type": result.geom_type,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.geometry_manipulation.intersections",
        description=(
            "Compute the intersection of two WKT geometries and return it "
            "as WGS84 WKT."
        ),
    )
    parser.add_argument("geometry_1", help="First geometry as a WKT string.")
    parser.add_argument("geometry_2", help="Second geometry as a WKT string.")
    args = parser.parse_args()

    try:
        result = intersect_geometries(args.geometry_1, args.geometry_2)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
