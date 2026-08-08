import { Map, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Import data GeoJSON
import toponimiData from './data/revisi_toponimi_surakarta.geojson?url';

// IMPORT FUNGSI POPUP DARI FILE LAIN
import { addToponimiPopup, addADMPopup } from './Popup/popup.js';

const map = new Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [110.8250, -7.5680],
    zoom: 13
});

map.addControl(new NavigationControl(), "top-left");

map.on('load', () => {
    map.addSource('toponimi-source', {
        type: 'geojson',
        data: toponimiData
    });

    map.addLayer({
        id: 'toponimi-layer',
        type: 'circle',
        source: 'toponimi-source',
        paint: {
            'circle-radius': 7,
            'circle-color': '#e74c3c',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff'
        }
    });

    map.on('mouseenter', 'toponimi-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'toponimi-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    // PANGGIL FUNGSI POPUP-NYA DI SINI (SANGAT RINGKAS!)
    map.on('click', 'toponimi-layer', (e) => {
        addToponimiPopup(map, e);
    });
});