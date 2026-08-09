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
    // 1. LAYER PENGGUNAAN LAHAN (LANDUSE) - Awalnya Disembunyikan
    // ==========================================
    map.addSource('landuse-source', { type: 'geojson', data: landuseData });
    const NAMA_KOLOM_LANDUSE = 'PENGGUNAAN';

    map.addLayer({
        id: 'layer-landuse',
        type: 'fill',
        source: 'landuse-source',
        layout: { 'visibility': 'none' }, // Default mati
        paint: {
            'fill-color': [
                'match',
                ['get', NAMA_KOLOM_LANDUSE],
                'Pertahanan dan Keamanan', '#3949ab',
                'Permukiman', '#f39c12',
                'Sawah', '#2ecc71',
                'Perdagangan dan Jasa', '#e74c3c',
                'RTH', '#27ae60',
                'Industri', '#8e44ad',
                '#95a5a6'
            ],
            'fill-opacity': 0.65,
            'fill-outline-color': '#ffffff'
        }
    });

    // ==========================================
    // 2. LAYER BATAS ADMINISTRASI - Awalnya Aktif
    // ==========================================
    map.addSource('adm-source', { type: 'geojson', data: admData });

    map.addLayer({
        id: 'layer-adm-fill',
        type: 'fill',
        source: 'adm-source',
        layout: { 'visibility': 'visible' },
        paint: { 'fill-color': '#ff9800', 'fill-opacity': 0.08 }
    });

    map.addLayer({
        id: 'layer-adm-line',
        type: 'line',
        source: 'adm-source',
        layout: { 'visibility': 'visible' },
        paint: {
            'line-color': '#e65100',
            'line-width': 2,
            'line-dasharray': [2, 2]
        }
    });

    // ==========================================
    // 3. LAYER TOPONIMI FASILITAS - Awalnya Disembunyikan
    // ==========================================
    map.addSource('toponimi-source', { type: 'geojson', data: toponimiData });

    map.addLayer({
        id: 'layer-fasilitas',
        type: 'circle',
        source: 'toponimi-source',
        layout: { 'visibility': 'none' }, // Default mati
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
                'Pariwisata dan Hiburan', '#00acc1',
                'Pertahanan dan Keamanan', '#3949ab',
                'Transportasi', '#5d4037',
                'RTH', '#7cb342',
                'Makam', '#546e7a',
                '#0066cc'
            ]
        }
    });

    // Event Hover & Click Pop-up Fasilitas
    map.on('mouseenter', 'layer-fasilitas', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'layer-fasilitas', () => { map.getCanvas().style.cursor = ''; });
    map.on('click', 'layer-fasilitas', (e) => { addToponimiPopup(map, e); });

    // ==========================================
    // 4. LOGIKA INTERAKSI CHECKBOX & SUB-GRUP
    // ==========================================

    // A. Toggle Batas Administrasi
    const checkAdm = document.getElementById('check-adm');
    if (checkAdm) {
        checkAdm.addEventListener('change', (e) => {
            const vis = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty('layer-adm-fill', 'visibility', vis);
            map.setLayoutProperty('layer-adm-line', 'visibility', vis);
        });
    }

    // B. Toggle Penggunaan Lahan
    const checkLanduse = document.getElementById('check-landuse');
    if (checkLanduse) {
        checkLanduse.addEventListener('change', (e) => {
            const vis = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty('layer-landuse', 'visibility', vis);
        });
    }

    // C. Toggle Parent Toponimi & Munculkan Sub-Grup
    const checkToponimiParent = document.getElementById('check-toponimi-parent');
    const subToponimiContainer = document.getElementById('sub-toponimi');

    if (checkToponimiParent) {
        checkToponimiParent.addEventListener('change', (e) => {
            if (e.target.checked) {
                subToponimiContainer.style.display = 'block'; // Munculkan sub-kategori
                map.setLayoutProperty('layer-fasilitas', 'visibility', 'visible');
                updateFasilitasFilter();
            } else {
                subToponimiContainer.style.display = 'none'; // Sembunyikan sub-kategori
                map.setLayoutProperty('layer-fasilitas', 'visibility', 'none');
            }
        });
    }

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
});