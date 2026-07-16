import { Map } from 'maplibre-gl';
import naturalEarthData from "./data/ne.geojson?url";
import areaData from "./data/adm_banten.geojson?url";
import flagImage from "./data/flag.png?url";

const map = new Map({
    container: 'map', 
    style: 'https://demotiles.maplibre.org/globe.json',
    center: [110.20971606819703, -7.493319607970615],
    zoom: 7
});

// const data = {
//   "type": "FeatureCollection",
//   "features": [
//     {
//       "type": "Feature",
//       "properties": {
//         "Name": "Rumah Ayang"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [
//           110.2096702,
//           -7.4931782
//         ]
//       }
//     }
//   ]
// }
map.on('load', () => {
// Layer Tipe Circle (Point)
map.addSource('kota',{
    type: 'geojson',
    data: naturalEarthData
});

map.addLayer({
    id: 'kota-layer',
    type: 'circle',
    source: 'kota',
    paint: {
        'circle-radius': 7,
        'circle-color': '#ff0000',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
    }
})

// Layer Tipe Fill (Polygon)
map.addSource('area',{
    type: 'geojson',
    data: areaData
});
map.addLayer({
    id: 'area-layer',
    type: 'fill',
    source: 'area',
    paint: {
        'fill-color': '#ffffff',
        'fill-outline-color': '#000000'
    }
});

// Layer Tipe Raster (Tile)
map.addSource('Flag',{
    type: 'image',
    url: flagImage,
    coordinates: [
    [-6.5, 57.5],  // 1. Kiri Atas
    [ 2.0, 57.5],  // 2. Kanan Atas
    [ 2.0, 50.0],  // 3. Kanan Bawah
    [-6.5, 50.0]   // 4. Kiri Bawah
]
});

map.addLayer({
    id: 'Flag-layer',
    type: 'raster',
    source: 'Flag',
})
});
