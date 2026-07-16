import { Map } from 'maplibre-gl';
import naturalEarthData from "./data/ne.geojson?url";
import areaData from "./data/adm_banten.geojson?url";

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
});
