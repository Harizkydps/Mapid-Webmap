import { Map, AttributionControl, FullscreenControl, GlobeControl, LogoControl } from 'maplibre-gl';
import { addKotaLayer, addAdmBanten } from './layers/vector.js';
import { addFlagLayer } from './layers/raster.js';
import flagImage from "./data/flag.png?url";
import { addKotaPopup } from './Popup/popup.js';

export class englandflagControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl';
        this._container.innerHTML = `
            <img
                src="${flagImage}"
                alt="Logo"
                style="width: 70px"
            >
        `;
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
    center: [110.20971606819703, -7.493319607970615], // Magelang / Jateng area
    zoom: 7
});

map.addControl(new AttributionControl({
    compact: true,
    customAttribution: "Natural Earth Dataset, England"
}));

map.addControl(new FullscreenControl());
map.addControl(new GlobeControl());
map.addControl(new LogoControl({ compact: false }));
map.addControl(new englandflagControl(), "top-left");

map.on('load', () => {
    // Tambahkan Layer
    addKotaLayer(map);
    addAdmBanten(map);
    addFlagLayer(map);

    // Event saat feature/titik di 'kota-layer' diklik
    map.on("click", "kota-layer", (event) => {
        addKotaPopup(map, event);
    });

    // Ubah kursor jadi pointer saat hover di atas 'kota-layer'
    map.on('mouseenter', 'kota-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Kembalikan kursor ke normal saat keluar dari 'kota-layer'
    map.on('mouseleave', 'kota-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});