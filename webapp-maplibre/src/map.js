import { Map, NavigationControl, FullscreenControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Impor data GeoJSON
import toponimiData from './data/revisi_toponimi_surakarta.geojson?url';
import admData from './data/adm_surakarta.geojson?url';
import landuseData from './data/revisi_gunlah.geojson?url';

// Impor modul lapisan peta & interaksi
import { initAdmLayer } from './engine/adm.js';
import { initLanduseLayer } from './engine/landuse.js';
import { initToponimiLayer } from './engine/toponimi.js';
import { initPenilaianClick } from './Popup/popup.js';

const map = new Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [110.8250, -7.5680],
    zoom: 13,
    attributionControl: true,
    customAttribution: 'Sumber Data: © Bappeda Kota Solo'
});

// Tambahkan Navigation Control dan Fullscreen Control di pojok kiri atas
map.addControl(new NavigationControl(), "top-left");

map.addControl(
    new FullscreenControl({ 
        container: document.querySelector('.map-container-wrapper') 
    }), 
    "top-left"
);

const NAMA_KOLOM = 'JENIS';
const NAMA_KOLOM_LANDUSE = 'PENGGUNAAN';

let loadedLanduse = null;
let loadedAdm = null;
let loadedToponimi = null;

map.on('load', async () => {
    const statusElem = document.getElementById('map-status');
    if (statusElem) statusElem.innerText = '✅ Memuat Data Spasial...';

    try {
        // Ambil data mentah untuk analisis Turf.js
        [loadedLanduse, loadedAdm, loadedToponimi] = await Promise.all([
            fetch(landuseData).then(res => res.json()),
            fetch(admData).then(res => res.json()),
            fetch(toponimiData).then(res => res.json())
        ]);

        if (statusElem) {
            statusElem.className = 'badge bg-success p-2';
            statusElem.innerText = '✅ Peta & Layer Siap';
        }
    } catch (err) {
        console.error("Gagal memuat GeoJSON:", err);
        if (statusElem) statusElem.innerText = '❌ Gagal Memuat Data';
    }

    // Panggil fungsi modular lapisan peta
    initAdmLayer(map, admData);
    initLanduseLayer(map, landuseData, NAMA_KOLOM_LANDUSE);
    initToponimiLayer(map, toponimiData, NAMA_KOLOM);

    // Aktifkan event klik penilaian setelah data siap
    initPenilaianClick(map, loadedLanduse, loadedAdm, loadedToponimi, NAMA_KOLOM, NAMA_KOLOM_LANDUSE);
});