import argparse
import heapq
import json
import sys
from collections import defaultdict

from pyproj import Geod
from shapely import LineString, Point, wkt
from shapely.ops import nearest_points

GEOD = Geod(ellps="WGS84")


def _geodesic_distance(a: tuple, b: tuple) -> float:
    _, _, dist = GEOD.inv(a[0], a[1], b[0], b[1])
    return dist


def _network_lines(network):
    if network.geom_type == "LineString":
        return [network]
    if network.geom_type == "MultiLineString":
        return list(network.geoms)
    raise ValueError(
        f"Network must be (Multi)LineString, got {network.geom_type}."
    )


def _build_graph(network) -> dict:
    graph: dict = defaultdict(dict)
    for line in _network_lines(network):
        coords = list(line.coords)
        for a, b in zip(coords[:-1], coords[1:]):
            a, b = tuple(a), tuple(b)
            d = _geodesic_distance(a, b)
            graph[a][b] = d
            graph[b][a] = d
    return graph


def _attach_point_to_graph(graph: dict, point_xy: tuple, network) -> None:
    point_geom = Point(point_xy)
    closest = None
    min_dist = float("inf")

    for line in _network_lines(network):
        coords = list(line.coords)
        for a, b in zip(coords[:-1], coords[1:]):
            d = LineString([a, b]).distance(point_geom)
            if d < min_dist:
                min_dist = d
                closest = (tuple(a), tuple(b))

    if closest is None:
        raise ValueError("Network has no segments.")

    a, b = closest
    da = _geodesic_distance(a, point_xy)
    db = _geodesic_distance(b, point_xy)
    graph[point_xy][a] = da
    graph[a][point_xy] = da
    graph[point_xy][b] = db
    graph[b][point_xy] = db


def _dijkstra(graph: dict, start: tuple, end: tuple):
    dist = {start: 0.0}
    prev: dict = {}
    heap = [(0.0, start)]
    visited: set = set()

    while heap:
        d, u = heapq.heappop(heap)
        if u in visited:
            continue
        visited.add(u)
        if u == end:
            break
        for v, w in graph[u].items():
            if v in visited:
                continue
            nd = d + w
            if v not in dist or nd < dist[v]:
                dist[v] = nd
                prev[v] = u
                heapq.heappush(heap, (nd, v))

    if end not in dist:
        return None, None

    path = [end]
    while path[-1] != start:
        path.append(prev[path[-1]])
    path.reverse()
    return dist[end], path


def shortest_path(start_wkt: str, end_wkt: str, network_wkt: str) -> dict:
    start = wkt.loads(start_wkt)
    end = wkt.loads(end_wkt)
    network = wkt.loads(network_wkt)

    if start.geom_type != "Point":
        raise ValueError(f"Start must be a Point, got {start.geom_type}.")
    if end.geom_type != "Point":
        raise ValueError(f"End must be a Point, got {end.geom_type}.")

    graph = _build_graph(network)

    start_on_net = nearest_points(network, start)[0]
    end_on_net = nearest_points(network, end)[0]
    start_xy = (start_on_net.x, start_on_net.y)
    end_xy = (end_on_net.x, end_on_net.y)

    _attach_point_to_graph(graph, start_xy, network)
    if end_xy != start_xy:
        _attach_point_to_graph(graph, end_xy, network)

    _, path = _dijkstra(graph, start_xy, end_xy)

    if path is None:
        raise ValueError(
            "No path found between start and end on the network "
            "(disconnected components)."
        )

    path_geom = Point(path[0]) if len(path) == 1 else LineString(path)

    return {
        "wkt": path_geom.wkt,
        "snapped_start_wkt": Point(start_xy).wkt,
        "snapped_end_wkt": Point(end_xy).wkt,
        "output_geometry_type": path_geom.geom_type,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m toolbox.network_analysis.dijkstra",
        description=(
            "Shortest path between two Points along a (Multi)LineString "
            "network using Dijkstra's algorithm. Start/end are snapped to "
            "the nearest point on the network."
        ),
    )
    parser.add_argument("start", help="Start point as a WKT string.")
    parser.add_argument("end", help="End point as a WKT string.")
    parser.add_argument(
        "network",
        help="Network as a WKT (Multi)LineString.",
    )
    args = parser.parse_args()

    try:
        result = shortest_path(args.start, args.end, args.network)
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stderr)
        sys.stderr.write("\n")
        sys.exit(1)

    json.dump(result, sys.stdout)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
