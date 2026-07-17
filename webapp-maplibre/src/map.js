import { Map,AttributionControl } from 'maplibre-gl';
import {addKotaLayer, addAdmBanten,} from './layers/vector.js';
import {addFlagLayer} from './layers/raster.js';

const map = new Map({
    container: 'map', 
    style: 'https://demotiles.maplibre.org/globe.json',
    center: [110.20971606819703, -7.493319607970615],
    zoom: 7
});

map.addControl(new AttributionControl({
    compact: true,
    customAttribution: "Natural Earth Dataset, England"

}));
map.on('load', () => {

// Layer Tipe Circle (Point)
    addKotaLayer(map);
    addAdmBanten(map);
    addFlagLayer(map);
});
