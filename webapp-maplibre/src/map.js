import { Map } from 'maplibre-gl';
import naturalEarthData from "./data/ne.geojson?url";

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
    data: "https://geoserver.mapid.io/layers_new/get_layer?api_key=f0e11141f5da4f159ffc532e8f835443&layer_id=6a2f54bfd56af8dd1e4dced0&project_id=6a2c169ca4b35352db758290"
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
});
