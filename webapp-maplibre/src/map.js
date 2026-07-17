import { Map } from 'maplibre-gl';
import {addKotaLayer, addAdmBanten} from './layers/vector.js';
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
    addKotaLayer(map);
    addAdmBanten(map);

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
