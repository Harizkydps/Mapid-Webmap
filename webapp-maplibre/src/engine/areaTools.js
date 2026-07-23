import { geojsonToWKT } from "@terraformer/wkt";

export function storeAreaGeometry(event) {
   const geometry = event.features[0].geometry
   const wkt = geojsonToWKT(geometry)
   computeArea(wkt).then((value) => {
    console.log (value)
   })
}

async function computeArea (wkt){
    const response = await fetch ("http://127.0.0.1:5000/spatial_computation/area",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({geometry:wkt})
    })
    const result = await response.json()

    return result
}