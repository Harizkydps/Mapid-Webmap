import argparse
import json
import sys

from shapely import wkt


def calculate_centroid(wkt_string: str) -> dict:
    geom = wkt.loads(wkt_string)
    if geom.is_empty:
        raise ValueError("Input geometry is empty.")

    centroid = geom.centroid

    return {
        "wkt": centroid.wkt,
        "input_geometry_type": geom.geom_type,
        "output_geometry_type": centroid.geom_type,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.geometry_manipulation.centroid",
        description=(
            "Compute the centroid of a WKT geometry and return it as a "
            "WGS84 Point WKT."
        ),
    )
    parser.add_argument("geometry", help="Geometry as a WKT string.")
    args = parser.parse_args()

    try:
        result = calculate_centroid(args.geometry)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
