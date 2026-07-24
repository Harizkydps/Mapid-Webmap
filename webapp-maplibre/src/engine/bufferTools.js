import { geojsonToWKT, wktToGeoJSON } from "@terraformer/wkt";
import { addBufferLayer } from "../layers/vector";

export async function storeBufferGeometry(map, event) {
    // Mengambil geometri titik dari feature kota yang diklik
    const geometry = event.features[0].geometry;
    const wkt = geojsonToWKT(geometry);

    await computeBuffer(map, wkt);
}

async function computeBuffer(map, wkt) {
    const response = await fetch("http://127.0.0.1:5000/geometry_manipulation/buffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            geometry: wkt,
            distance_m: 1000000 // Jarak buffer dalam meter
        })
    });

    const result = await response.json();
    const data = wktToGeoJSON(result.wkt);

    // Kirim GeoJSON hasil buffer ke map
    addBufferLayer(map, data);

    return data;
}