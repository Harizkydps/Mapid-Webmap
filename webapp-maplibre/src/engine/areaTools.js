import { geojsonToWKT } from "@terraformer/wkt";

export function storeAreaGeometry(event) {
   const geometry = event.features[0].geometry
   console.log (geojsonToWKT(geometry))
}

async function computeArea (){
    const response = await fetch ("http://127.0.0.1:5000/spatial_computation/area",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({geometry})
    })
}