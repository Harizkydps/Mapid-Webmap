import { geojsonToWKT } from "@terraformer/wkt"
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000";

export function storeAreaGeometry(event) {
    const geometry = event.features[0].geometry
    const wkt = geojsonToWKT(geometry)

    computeArea(wkt)
}

export async function computeArea(wkt){
    const response = await fetch(`${API_BASE}/spatial_computation/area`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ geometry: wkt })
    })

    const result = await response.json()

        const output = document.getElementById("luas");
    output.textContent = `${result.area_ha.toLocaleString("ID-id")} ${result.unit}`

    return result
}