from flask import Flask, request

from toolbox.geometry_manipulation.buffer import buffer_geometry
from toolbox.geometry_manipulation.centroid import calculate_centroid
from toolbox.geometry_manipulation.intersections import intersect_geometries
from toolbox.network_analysis.dijkstra import shortest_path
from toolbox.spatial_computation.area import calculate_area
from toolbox.spatial_computation.distance import calculate_distance
from toolbox.spatial_computation.length import calculate_length
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/spatial_computation/area", methods=['POST'])
def area():
    body = request.get_json(silent=True) or {}
    geometry = body.get("geometry")
    if not geometry:
        return {"error": "Missing 'geometry' field in JSON body (WKT)."}, 400
    try:
        return calculate_area(geometry)
    except Exception as exc:
        return {"error": str(exc)}, 400

@app.route("/spatial_computation/distance", methods=['POST'])
def distance():
    body = request.get_json(silent=True) or {}
    geometry_1 = body.get("geometry_1")
    geometry_2 = body.get("geometry_2")
    if not geometry_1 or not geometry_2:
        return {"error": "Missing 'geometry_1' and/or 'geometry_2' field in JSON body (WKT)."}, 400
    try:
        return calculate_distance(geometry_1, geometry_2)
    except Exception as exc:
        return {"error": str(exc)}, 400

@app.route("/spatial_computation/length", methods=['POST'])
def length():
    body = request.get_json(silent=True) or {}
    geometry = body.get("geometry")
    if not geometry:
        return {"error": "Missing 'geometry' field in JSON body (WKT)."}, 400
    try:
        return calculate_length(geometry)
    except Exception as exc:
        return {"error": str(exc)}, 400

@app.route("/geometry_manipulation/buffer", methods=['POST'])
def buffer():
    body = request.get_json(silent=True) or {}
    geometry = body.get("geometry")
    distance_m = body.get("distance_m")
    if not geometry or distance_m is None:
        return {"error": "Missing 'geometry' (WKT) and/or 'distance_m' (number) field in JSON body."}, 400
    try:
        return buffer_geometry(geometry, float(distance_m))
    except Exception as exc:
        return {"error": str(exc)}, 400

@app.route("/geometry_manipulation/centroid", methods=['POST'])
def centroid():
    body = request.get_json(silent=True) or {}
    geometry = body.get("geometry")
    if not geometry:
        return {"error": "Missing 'geometry' field in JSON body (WKT)."}, 400
    try:
        return calculate_centroid(geometry)
    except Exception as exc:
        return {"error": str(exc)}, 400

@app.route("/geometry_manipulation/intersections", methods=['POST'])
def intersections():
    body = request.get_json(silent=True) or {}
    geometry_1 = body.get("geometry_1")
    geometry_2 = body.get("geometry_2")
    if not geometry_1 or not geometry_2:
        return {"error": "Missing 'geometry_1' and/or 'geometry_2' field in JSON body (WKT)."}, 400
    try:
        return intersect_geometries(geometry_1, geometry_2)
    except Exception as exc:
        return {"error": str(exc)}, 400

@app.route("/network_analysis/dijkstra", methods=['POST'])
def dijkstra():
    body = request.get_json(silent=True) or {}
    start = body.get("start")
    end = body.get("end")
    network = body.get("network")
    if not start or not end or not network:
        return {"error": "Missing 'start' (Point WKT), 'end' (Point WKT), and/or 'network' ((Multi)LineString WKT) field in JSON body."}, 400
    try:
        return shortest_path(start, end, network)
    except Exception as exc:
        return {"error": str(exc)}, 400
