import { Popup, Marker } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { calculateAccessibilityScore } from '../engine/scoring.js';
import { calculatePolygonArea } from '../engine/areaTools.js';

let currentMarker = null;
let isPenilaianActive = false;

// Fungsi untuk mengecek status mode penilaian dari luar
export function getPenilaianStatus() {
    return isPenilaianActive;
}

export function initPenilaianClick(map, loadedLanduse, loadedAdm, loadedToponimi, namaKolom, kolomLanduse) {
    const btnToggle = document.getElementById('btn-toggle-penilaian');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            isPenilaianActive = !isPenilaianActive;
            btnToggle.className = isPenilaianActive ? 'btn btn-sm btn-danger w-100 fw-bold' : 'btn btn-sm btn-outline-primary w-100 fw-bold';
            btnToggle.innerText = isPenilaianActive ? '🔴 Matikan Mode Penilaian' : '🟢 Aktifkan Mode Penilaian';
            map.getCanvas().style.cursor = isPenilaianActive ? 'crosshair' : '';
            if (!isPenilaianActive && currentMarker) {
                currentMarker.remove();
                currentMarker = null;
            }
        });
    }

    // ==========================================
    // 1. EVENT KLIK UNTUK MODE PENILAIAN HUNIAN
    // ==========================================
    map.on('click', (e) => {
        if (!isPenilaianActive) return; // Jika mode penilaian mati, abaikan event ini

        const clickedLngLat = [e.lngLat.lng, e.lngLat.lat];
        const userPoint = turf.point(clickedLngLat);

        let isInsideSolo = false;
        if (loadedAdm?.features) {
            isInsideSolo = loadedAdm.features.some(f => turf.booleanPointInPolygon(userPoint, f));
        }

        if (currentMarker) currentMarker.remove();
        currentMarker = new Marker({ color: isInsideSolo ? '#003366' : '#dc3545' })
            .setLngLat(clickedLngLat)
            .addTo(map);

        if (!isInsideSolo) {
            new Popup({ offset: 25 }).setLngLat(clickedLngLat).setHTML(`
                <div style="font-size: 0.85rem; text-align: center; min-width: 210px; padding: 6px;">
                    <div style="font-size: 1.5rem; margin-bottom: 4px;">📍❌</div>
                    <h6 class="fw-bold text-danger mb-1">Diluar Wilayah Solo</h6>
                    <p class="text-secondary small mb-0" style="font-size: 0.75rem;">Titik koordinat berada di luar batas administrasi Kota Surakarta.</p>
                </div>
            `).addTo(map);
            return;
        }

        let infoLahan = "Lahan Lainnya";
        let isTerlarang = false;
        const areaTerlarang = ["Danau", "Sungai", "Makam", "Industri", "Pergudangan", "Rel", "Pertahanan dan Keamanan", "Sarana Transportasi", "Jalan", "Median Jalan", "Permukaan/Lapangan Diperkeras"];

        if (loadedLanduse?.features) {
            const matched = loadedLanduse.features.find(f => turf.booleanPointInPolygon(userPoint, f));
            if (matched?.properties) {
                infoLahan = matched.properties[kolomLanduse] || "Tidak diketahui";
                if (areaTerlarang.includes(infoLahan)) isTerlarang = true;
            }
        }

        if (isTerlarang) {
            new Popup({ offset: 25 }).setLngLat(clickedLngLat).setHTML(`
                <div style="font-size: 0.85rem; text-align: center; min-width: 210px; padding: 6px;">
                    <div style="font-size: 1.5rem; margin-bottom: 4px;">🚫</div>
                    <h6 class="fw-bold text-danger mb-1">Lokasi Tidak Valid</h6>
                    <p class="mb-1 text-muted small">Berada di zona:</p>
                    <div class="badge bg-danger p-2 w-100 mb-2 text-wrap">${infoLahan}</div>
                    <p class="text-secondary small mb-0" style="font-size: 0.75rem;">Kawasan ini tidak diizinkan atau tidak layak untuk peruntukan hunian.</p>
                </div>
            `).addTo(map);
            return;
        }

        let infoWilayah = "Kota Surakarta";
        if (loadedAdm?.features) {
            const matchedAdm = loadedAdm.features.find(f => turf.booleanPointInPolygon(userPoint, f));
            if (matchedAdm?.properties) {
                const kel = matchedAdm.properties.KELURAHAN || matchedAdm.properties.WADMKD || '';
                const kec = matchedAdm.properties.KECAMATAN || matchedAdm.properties.WADMKC || '';
                if (kel || kec) infoWilayah = `${kel ? 'Kel. ' + kel : ''}${kec ? ', Kec. ' + kec : ''}`;
            }
        }

        const scoreResult = calculateAccessibilityScore(userPoint, loadedToponimi, namaKolom);

        new Popup({ offset: 25 })
            .setLngLat(clickedLngLat)
            .setHTML(`
                <div style="font-size: 0.82rem; min-width: 240px; max-width: 280px; line-height: 1.4; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <div class="d-flex align-items-center gap-2 border-bottom pb-2 mb-2">
                        <div style="background-color: #e6f0fa; color: #003366; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">🏠</div>
                        <div style="overflow: hidden;">
                            <h6 class="fw-bold text-dark mb-0 text-truncate" style="font-size: 0.9rem;">Penilaian Hunian</h6>
                            <span class="text-muted d-block text-truncate" style="font-size: 0.73rem;">📍 ${infoWilayah}</span>
                        </div>
                    </div>
                    <div class="mb-2 p-2 rounded bg-light border border-light-subtle">
                        <div class="text-muted text-uppercase fw-semibold" style="font-size: 0.68rem; letter-spacing: 0.5px;">Penggunaan Lahan</div>
                        <div class="fw-bold text-primary mt-1 text-wrap" style="font-size: 0.83rem;">🌱 ${infoLahan}</div>
                    </div>
                    <div class="mb-2">
                        <div class="fw-bold text-dark mb-1" style="font-size: 0.78rem;">📍 Jarak Fasilitas Terdekat:</div>
                        <ul class="ps-3 mb-0 text-secondary" style="font-size: 0.77rem;">${scoreResult.fasilitasHtml}</ul>
                    </div>
                    <div class="mt-2 pt-2 border-top text-center">
                        <div class="badge bg-${scoreResult.badgeColor} p-2 w-100 text-wrap shadow-sm" style="font-size: 0.78rem;">
                            <span style="font-size: 0.7rem; opacity: 0.9; text-transform: uppercase; display: block;">Skor Aksesibilitas</span>
                            <strong style="font-size: 0.95rem;">${scoreResult.skorAkhir} / 100</strong>
                            <div style="font-size: 0.73rem; mt-1;">(${scoreResult.predikat})</div>
                        </div>
                    </div>
                </div>
            `)
            .addTo(map);
    });

    // ==========================================
    // 2. EVENT KLIK UNTUK EKSPLORASI LAYER PENGGUNAAN LAHAN (GUNLAH)
    // ==========================================
    map.on('click', 'layer-landuse', (e) => {
        if (isPenilaianActive) return; // Jangan bentrok dengan mode penilaian
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties;
        const kategoriLahan = props[kolomLanduse] || "Tidak diketahui";
        const luasLahan = calculatePolygonArea(feature);

        new Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="font-size: 0.82rem; min-width: 210px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <h6 class="fw-bold text-primary mb-1">🌱 Informasi Penggunaan Lahan</h6>
                    <hr class="my-1">
                    <p class="mb-1"><b>Kategori:</b> ${kategoriLahan}</p>
                    <p class="mb-1"><b>Luas Area:</b> ${luasLahan}</p>
                    <small class="text-muted">Wilayah Kota Surakarta</small>
                </div>
            `)
            .addTo(map);
    });

   // ==========================================
    // 3. EVENT KLIK UNTUK EKSPLORASI LAYER TOPONIMI (FASILITAS)
    // ==========================================
    map.on('click', 'layer-fasilitas', (e) => {
        if (isPenilaianActive) return;
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties;
        
        // Menyesuaikan dengan properti asli dari GeoJSON Anda
        const namaTempat = props.NAMA_OBJEK || props.NAMMAP || props.NAMLOK || "Fasilitas Umum";
        const jenisTempat = props[namaKolom] || props.JENIS_UTAM || "Fasilitas";
        const koordinat = `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}`;
        
        // Mengambil foto langsung dari properti FOTO1 GeoJSON Anda
        const fotoUrl = props.FOTO1 || props.FOTO2 || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop&q=60";

        new Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="font-size: 0.82rem; min-width: 230px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <div style="width: 100%; height: 120px; border-radius: 6px; overflow: hidden; margin-bottom: 8px; background-color: #f1f5f9;">
                        <img src="${fotoUrl}" alt="Foto ${namaTempat}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop&q=60'">
                    </div>
                    <h6 class="fw-bold text-dark mb-1">${namaTempat}</h6>
                    <span class="badge bg-primary text-white mb-2" style="font-size: 0.7rem;">${jenisTempat}</span>
                    <p class="mb-1 text-muted" style="font-size: 0.75rem;"><b>Koordinat:</b> ${koordinat}</p>
                    <p class="mb-0 text-secondary" style="font-size: 0.75rem;">📍 Surakarta, Jawa Tengah</p>
                </div>
            `)
            .addTo(map);
    });

    // Mengubah kursor jadi pointer saat diarahkan ke layer jika mode penilaian mati
    map.on('mouseenter', 'layer-landuse', () => { if (!isPenilaianActive) map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'layer-landuse', () => { if (!isPenilaianActive) map.getCanvas().style.cursor = ''; });
    
    map.on('mouseenter', 'layer-fasilitas', () => { if (!isPenilaianActive) map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'layer-fasilitas', () => { if (!isPenilaianActive) map.getCanvas().style.cursor = ''; });
}