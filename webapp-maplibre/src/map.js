import { Map } from 'maplibre-gl';
import {addKotaLayer, addAdmBanten,} from './layers/vector.js';
import {addFlagLayer} from './layers/raster.js';

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
    addFlagLayer(map);
});
