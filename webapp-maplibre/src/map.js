import { Map,AttributionControl,FullscreenControl,GlobeControl,LogoControl} from 'maplibre-gl';
import {addKotaLayer, addAdmBanten,} from './layers/vector.js';
import {addFlagLayer} from './layers/raster.js';
import flagImage from "./data/flag.png?url";
import {addKotaPopup} from './Popup/popup.js';

export class englandflagControl{
    onAdd(map){
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl';
        this._container.innerHTML = `
            <img
                src="${flagImage}"
                alt="Logo"
                style="width: 70px"
            >
        `
        return this._container;
    }
    onRemove() {
        this._container.remove();
        this._map = undefined;
    }
}

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

map.addControl(new FullscreenControl());
map.addControl(new GlobeControl());
map.addControl(new LogoControl({
    compact: false,
}));
map.addControl(new englandflagControl(),"top-left");

map.on('load', () => {

// Layer Tipe Circle (Point)
    addKotaLayer(map);
    addAdmBanten(map);
    addFlagLayer(map);

map.on("click", "kota-layer", function(event) {
        addKotaPopup(map, event);
    });

});

// map.on("click","kota-layer",function(event){
//     addKotaPopup(map,event)
// });
