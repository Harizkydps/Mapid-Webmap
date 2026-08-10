import { Map, NavigationControl, Popup, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { geojsonToWKT } from '@terraformer/wkt';
import * as turf from '@turf/turf';

import toponimiData from './data/revisi_toponimi_surakarta.geojson?url';
import admData from './data/adm_surakarta.geojson?url';
import landuseData from './data/revisi_gunlah.geojson?url';
import { addToponimiPopup } from './Popup/popup.js';

const map = new Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [110.8250, -7.5680],
    zoom: 13,
    customAttribution: '© Bappeda Kota Solo'
});

map.addControl(new NavigationControl(), "top-left");

const NAMA_KOLOM = 'JENIS';
const NAMA_KOLOM_LANDUSE = 'PENGGUNAAN';
let currentMarker = null; 
let isPenilaianActive = false; 

// Variabel penampung objek GeoJSON untuk analisis Turf.js
let loadedLanduse = null;
let loadedAdm = null;
let loadedToponimi = null;

map.on('load', async () => {
    const statusElem = document.getElementById('map-status');
    if (statusElem) {
        statusElem.className = 'badge bg-success p-2';
        statusElem.innerText = '✅ Memuat Data Spasial...';
    }

    try {
        // Ambil data GeoJSON secara asinkron agar bisa dibaca Turf.js
        [loadedLanduse, loadedAdm, loadedToponimi] = await Promise.all([
            fetch(landuseData).then(res => res.json()),
            fetch(admData).then(res => res.json()),
            fetch(toponimiData).then(res => res.json())
        ]);
        if (statusElem) statusElem.innerText = '✅ Peta Siap';
    } catch (err) {
        console.error("Gagal memuat data GeoJSON:", err);
        if (statusElem) statusElem.innerText = '❌ Gagal Memuat Data';
    }

    // ==========================================
    // 1. LAYER PENGGUNAAN LAHAN 
    // ==========================================
    map.addSource('landuse-source', { type: 'geojson', data: landuseData });
   map.addLayer({
    id: 'layer-landuse',
    type: 'fill',
    source: 'landuse-source',
    layout: { 'visibility': 'none' },
    paint: {
        'fill-color': [
            'match',
            ['get', NAMA_KOLOM_LANDUSE],
            'Danau', '#3366cc',
            'Industri', '#9b59b6',
            'Jalan', '#00bcd4',
            'Jalur Hijau', '#b5b838',
            'Kolam', '#ff69b4',
            'Lapangan Olahraga', '#9acd32',
            'Makam', '#9370db',
            'Median Jalan', '#40e0d0',
            'Pariwisata dan Hiburan', '#ff1493',
            'Perdagangan dan Jasa', '#2ecc71',
            'Pergudangan', '#bdb76b',
            'Perkantoran', '#4169e1',
            'Permukaan/Lapangan Diperkeras', '#7b68ee',
            'Permukiman', '#f39c12',
            'Pertahanan dan Keamanan', '#a0522d',
            'Rel', '#6495ed',
            'Sarana Kesehatan', '#daa520',
            'Sarana Olahraga', '#ff69b4',
            'Sarana Pendidikan', '#228b22',
            'Sarana Peribadatan', '#3cb371',
            'Sarana Sosial', '#ff4500',
            'Sarana Transportasi', '#483d8b',
            'Sarana Utilitas', '#000080',
            'Sawah', '#00ced1',
            'Semak Belukar', '#da70d6',
            'Sungai', '#ba55d3',
            'Taman', '#32cd32',
            'Tanah Kosong', '#d2691e',
            'Tanaman Campuran', '#b22222',
            'Tegalan/Ladang', '#7fff00',
            '#95a5a6' // Warna default untuk all other values
        ],
        'fill-opacity': 0.65,
        'fill-outline-color': '#ffffff'
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
    // 3. LAYER TOPONIMI FASILITAS 
    // ==========================================
    map.addSource('toponimi-source', { type: 'geojson', data: toponimiData });
    map.addLayer({
        id: 'layer-fasilitas',
        type: 'circle',
        source: 'toponimi-source',
        layout: { 'visibility': 'none' },
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
                '#0066cc'
            ]
        }
    });

    // ==========================================
    // 4. TOMBOL KONTROL & ANALISIS TURF.JS (DENGAN VALIDASI ZONASI)
    // ==========================================
    const btnTogglePenilaian = document.getElementById('btn-toggle-penilaian');
    if (btnTogglePenilaian) {
        btnTogglePenilaian.addEventListener('click', () => {
            isPenilaianActive = !isPenilaianActive;
            
            if (isPenilaianActive) {
                btnTogglePenilaian.className = 'btn btn-sm btn-danger w-100 fw-bold';
                btnTogglePenilaian.innerText = '🔴 Matikan Mode Penilaian';
                map.getCanvas().style.cursor = 'crosshair';
            } else {
                btnTogglePenilaian.className = 'btn btn-sm btn-outline-primary w-100 fw-bold';
                btnTogglePenilaian.innerText = '🟢 Aktifkan Mode Penilaian';
                map.getCanvas().style.cursor = '';
                
                if (currentMarker) {
                    currentMarker.remove();
                    currentMarker = null;
                }
            }
        });
    }

    map.on('click', (e) => {
        if (!isPenilaianActive) return; 

        const clickedLngLat = [e.lngLat.lng, e.lngLat.lat];
        const userPoint = turf.point(clickedLngLat);

        // A. Cek Berada di Penggunaan Lahan Mana & Validasi Zona Terlarang
        let infoLahan = "Lahan Lainnya";
        let isTerlarang = false;
        
        // Daftar penggunaan lahan yang TIDAK VALID/TERLARANG untuk hunian
        const areaTerlarang = ["Danau", "Sungai", "Makam", "Industri", "Pergudangan"];

        if (loadedLanduse && loadedLanduse.features) {
            const matchedFeature = loadedLanduse.features.find(f => turf.booleanPointInPolygon(userPoint, f));
            if (matchedFeature && matchedFeature.properties) {
                infoLahan = matchedFeature.properties[NAMA_KOLOM_LANDUSE] || "Tidak diketahui";
                
                if (areaTerlarang.includes(infoLahan)) {
                    isTerlarang = true;
                }
            }
        }

        // Terapkan warna marker berbeda jika area terlarang (Merah vs Biru)
        if (currentMarker) currentMarker.remove();
        currentMarker = new Marker({ color: isTerlarang ? '#dc3545' : '#003366' })
            .setLngLat(clickedLngLat)
            .addTo(map);

        // Jika jatuh di area terlarang, hentikan proses dan tampilkan popup peringatan
        if (isTerlarang) {
            new Popup({ offset: 25 })
                .setLngLat(clickedLngLat)
                .setHTML(`
                    <div style="font-size: 0.85rem; text-align: center; color: #dc3545; min-width: 210px;">
                        <h6 class="fw-bold mb-1">🚫 Lokasi Tidak Valid</h6>
                        <p class="mb-1">Titik berada di zona <b>${infoLahan}</b>.</p>
                        <small class="text-muted">Kawasan ini tidak diperbolehkan/tidak layak untuk peruntukan hunian.</small>
                    </div>
                `)
                .addTo(map);
            return; // Hentikan eksekusi, tidak lanjut hitung skor
        }

        // B. Cek Berada di Wilayah Administrasi Mana (Kelurahan/Kecamatan)
        let infoWilayah = "Kota Surakarta";
        if (loadedAdm && loadedAdm.features) {
            const matchedAdm = loadedAdm.features.find(f => turf.booleanPointInPolygon(userPoint, f));
            if (matchedAdm && matchedAdm.properties) {
                const kel = matchedAdm.properties.KELURAHAN || matchedAdm.properties.WADMKD || '';
                const kec = matchedAdm.properties.KECAMATAN || matchedAdm.properties.WADMKC || '';
                if (kel || kec) {
                    infoWilayah = `${kel ? 'Kel. ' + kel : ''}${kec ? ', Kec. ' + kec : ''}`;
                }
            }
        }

        // C. Hitung Jarak ke Fasilitas Terdekat
        let fasilitasHtml = "";
        let totalSkor = 0;
        let jumlahKategori = 0;
        const kategoriList = ['Kesehatan', 'Pendidikan', 'Perdagangan dan Jasa', 'Transportasi', 'Peribadatan'];

        if (loadedToponimi && loadedToponimi.features) {
            const features = loadedToponimi.features;

            kategoriList.forEach(kat => {
                const filtered = features.filter(f => f.properties[NAMA_KOLOM] === kat);
                if (filtered.length > 0) {
                    const targetCollection = turf.featureCollection(filtered);
                    const nearest = turf.nearestPoint(userPoint, targetCollection);
                    const jarakMeter = Math.round(turf.distance(userPoint, nearest, {units: 'meters'}));

                    fasilitasHtml += `<li><b>${kat}:</b> ${jarakMeter} meter</li>`;

                    if (jarakMeter <= 500) {
                        totalSkor += 25;
                        jumlahKategori++;
                    } else if (jarakMeter <= 1500) {
                        totalSkor += 15;
                        jumlahKategori++;
                    } else {
                        totalSkor += 5;
                        jumlahKategori++;
                    }
                } else {
                    fasilitasHtml += `<li><b>${kat}:</b> Tidak ada data</li>`;
                }
            });
        }

        // D. Hitung Skor Akhir (Skala 0 - 100)
        const skorAkhir = jumlahKategori > 0 ? Math.round((totalSkor / (jumlahKategori * 25)) * 100) : 0;
        let predikat = skorAkhir >= 75 ? 'Sangat Strategis (A)' : skorAkhir >= 50 ? 'Cukup Strategis (B)' : 'Kurang Strategis (C)';
        let badgeColor = skorAkhir >= 75 ? 'success' : skorAkhir >= 50 ? 'warning' : 'danger';

        // E. Render Popup Hasil Penilaian Valid
        const popupHTML = `
            <div style="font-size: 0.85rem; min-width: 220px; line-height: 1.4;">
                <h6 class="fw-bold text-primary mb-1">🏠 Penilaian Lokasi Hunian</h6>
                <p class="text-muted small mb-1"><b>Koordinat:</b> ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}</p>
                <p class="text-muted small mb-2"><b>Wilayah:</b> ${infoWilayah}</p>
                
                <hr class="my-1">
                <p class="mb-1"><b>🌱 Penggunaan Lahan:</b><br><span class="badge bg-secondary">${infoLahan}</span></p>
                
                <hr class="my-1">
                <p class="mb-1 fw-bold text-dark">📍 Jarak Fasilitas Terdekat:</p>
                <ul class="ps-3 mb-2" style="margin: 0; font-size: 0.8rem;">
                    ${fasilitasHtml}
                </ul>

                <hr class="my-1">
                <div class="text-center mt-2">
                    <span class="badge bg-${badgeColor} p-2 w-100" style="font-size: 0.8rem;">
                        Skor Aksesibilitas: <b>${skorAkhir} / 100</b><br>(${predikat})
                    </span>
                </div>
            </div>
        `;

        new Popup({ offset: 25 })
            .setLngLat(clickedLngLat)
            .setHTML(popupHTML)
            .addTo(map);
    });

    // ==========================================
    // 5. LOGIKA CHECKBOX & SUB-GRUP
    // ==========================================
    const checkAdm = document.getElementById('check-adm');
    if (checkAdm) {
        checkAdm.addEventListener('change', (e) => {
            const vis = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty('layer-adm-fill', 'visibility', vis);
            map.setLayoutProperty('layer-adm-line', 'visibility', vis);
        });
    }

    const checkLanduseParent = document.getElementById('check-landuse-parent');
    const subLanduseContainer = document.getElementById('sub-landuse');
    if (checkLanduseParent) {
        checkLanduseParent.addEventListener('change', (e) => {
            if (e.target.checked) {
                subLanduseContainer.style.display = 'block';
                map.setLayoutProperty('layer-landuse', 'visibility', 'visible');
            } else {
                subLanduseContainer.style.display = 'none';
                map.setLayoutProperty('layer-landuse', 'visibility', 'none');
            }
        });
    }

    const checkToponimiParent = document.getElementById('check-toponimi-parent');
    const subToponimiContainer = document.getElementById('sub-toponimi');
    if (checkToponimiParent) {
        checkToponimiParent.addEventListener('change', (e) => {
            if (e.target.checked) {
                subToponimiContainer.style.display = 'block';
                map.setLayoutProperty('layer-fasilitas', 'visibility', 'visible');
            } else {
                subToponimiContainer.style.display = 'none';
                map.setLayoutProperty('layer-fasilitas', 'visibility', 'none');
            }
        });
    }
});