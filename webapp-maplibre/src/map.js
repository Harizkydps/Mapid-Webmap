import { Map, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import toponimiData from './data/revisi_toponimi_surakarta.geojson?url';
import admData from './data/adm_surakarta.geojson?url';
import landuseData from './data/revisi_gunlah.geojson?url';
import { addToponimiPopup } from './Popup/popup.js';

const map = new Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [110.8250, -7.5680],
    zoom: 13
});

map.addControl(new NavigationControl(), "top-left");

const NAMA_KOLOM = 'JENIS';

map.on('load', () => {
    const statusElem = document.getElementById('map-status');
    if (statusElem) {
        statusElem.className = 'badge bg-success p-2';
        statusElem.innerText = '✅ Peta Siap';
    }
// ==========================================
    // 1. LAYER PENGGUNAAN LAHAN (LANDUSE) - POLIGON
    // ==========================================
    map.addSource('landuse-source', { type: 'geojson', data: landuseData });

    map.addLayer({
        id: 'layer-landuse',
        type: 'fill',
        source: 'landuse-source',
        paint: {
            'fill-color': '#ff0000',      // Uji coba pakai warna MERAH TERANG dulu biar pasti kelihatan!
            'fill-opacity': 0.7,          // Transparan 70%
            'fill-outline-color': '#000000' // Garis hitam tebal
        }
    });
    // ==========================================
    // 2. LAYER BATAS ADMINISTRASI
    // ==========================================
    map.addSource('adm-source', { type: 'geojson', data: admData });

    map.addLayer({
        id: 'layer-adm-fill',
        type: 'fill',
        source: 'adm-source',
        paint: { 'fill-color': '#ff9800', 'fill-opacity': 0.08 }
    });

    map.addLayer({
        id: 'layer-adm-line',
        type: 'line',
        source: 'adm-source',
        paint: {
            'line-color': '#e65100',
            'line-width': 2,
            'line-dasharray': [2, 2]
        }
    });

    // ==========================================
    // 3. LAYER TOPONIMI FASILITAS - TITIK/CIRCLE
    // ==========================================
    map.addSource('toponimi-source', { type: 'geojson', data: toponimiData });

    map.addLayer({
        id: 'layer-fasilitas',
        type: 'circle',
        source: 'toponimi-source',
        paint: {
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
                'match',
                ['get', NAMA_KOLOM],
                'Kesehatan', '#e53935',
                'Pendidikan', '#1e88e5',
                'Perdagangan dan Jasa', '#fb8c00',
                'Peribadatan', '#8e24aa',
                'Olahraga', '#43a047',
                'Pariwisata', '#00acc1',
                'Keamanan', '#3949ab',
                'Transportasi', '#5d4037',
                'RTH', '#7cb342',
                'Makam', '#546e7a',
                '#0066cc'
            ]
        }
    });

    // Filter Awal Saat Peta Pertama Dibuka
    updateFasilitasFilter();

    // Event Hover & Click Pop-up Fasilitas
    map.on('mouseenter', 'layer-fasilitas', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'layer-fasilitas', () => { map.getCanvas().style.cursor = ''; });
    map.on('click', 'layer-fasilitas', (e) => { addToponimiPopup(map, e); });

    // ==========================================
    // 4. LOGIKA FILTER CHECKBOX & ADMINISTRASI
    // ==========================================
    function updateFasilitasFilter() {
        const checkedBoxes = document.querySelectorAll('.check-kategori:checked');
        const selectedCategories = Array.from(checkedBoxes).map(cb => cb.value);

        if (selectedCategories.length === 0) {
            map.setFilter('layer-fasilitas', ['==', ['get', NAMA_KOLOM], 'NONE']);
        } else {
            map.setFilter('layer-fasilitas', ['in', ['get', NAMA_KOLOM], ['literal', selectedCategories]]);
        }
    }

    document.querySelectorAll('.check-kategori').forEach(cb => {
        cb.addEventListener('change', updateFasilitasFilter);
    });

    // Filter Batas ADM Toggle
    const checkAdm = document.getElementById('check-adm');
    if (checkAdm) {
        checkAdm.addEventListener('change', (e) => {
            const vis = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty('layer-adm-fill', 'visibility', vis);
            map.setLayoutProperty('layer-adm-line', 'visibility', vis);
        });
    }
});