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

// Helper untuk mendeteksi Kelurahan dan Kecamatan berdasarkan koordinat klik
function getAdminRegion(point, loadedAdm) {
    if (!loadedAdm?.features) return "Kota Surakarta";
    const matchedAdm = loadedAdm.features.find(f => turf.booleanPointInPolygon(point, f));
    if (matchedAdm?.properties) {
        const kel = matchedAdm.properties.KELURAHAN || matchedAdm.properties.WADMKD || '';
        const kec = matchedAdm.properties.KECAMATAN || matchedAdm.properties.WADMKC || '';
        if (kel || kec) {
            return `${kel ? 'Kel. ' + kel : ''}${kec ? ', Kec. ' + kec : ''}`;
        }
    }
    return "Kota Surakarta";
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
    // 1. EVENT KLIK UTAMA PADA PETA (MODE PENILAIAN)
    // ==========================================
    map.on('click', (e) => {
        if (!isPenilaianActive) return;

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
                <div style="font-size: 0.85rem; text-align: center; min-width: 210px; padding: 6px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <div style="font-size: 1.5rem; margin-bottom: 4px;">📍❌</div>
                    <h6 style="font-weight: bold; color: #dc3545; margin-bottom: 4px;">Diluar Wilayah Solo</h6>
                    <p style="color: #6c757d; font-size: 0.75rem; margin: 0;">Titik koordinat berada di luar batas administrasi Kota Surakarta.</p>
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
                <div style="font-size: 0.85rem; text-align: center; width: 220px; box-sizing: border-box; padding: 6px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    <div style="font-size: 1.5rem; margin-bottom: 4px;">🚫</div>
                    <h6 style="font-weight: bold; color: #dc3545; margin-bottom: 4px;">Lokasi Tidak Valid</h6>
                    <p style="color: #64748b; font-size: 0.75rem; margin-bottom: 4px;">Berada di zona:</p>
                    <div style="background-color: #dc3545; color: #fff; padding: 4px 6px; border-radius: 4px; margin-bottom: 6px; font-size: 0.78rem; word-break: break-word;">${infoLahan}</div>
                    <p style="color: #64748b; font-size: 0.7rem; margin: 0;">Kawasan ini tidak diizinkan untuk peruntukan hunian.</p>
                </div>
            `).addTo(map);
            return;
        }

        const infoWilayah = getAdminRegion(userPoint, loadedAdm);
        const scoreResult = calculateAccessibilityScore(userPoint, loadedToponimi, namaKolom);

        new Popup({ offset: 25 })
            .setLngLat(clickedLngLat)
            .setHTML(`
                <div style="font-size: 0.8rem; width: 230px; box-sizing: border-box; line-height: 1.3; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; padding: 2px;">
                    <div style="display: flex; align-items: flex-start; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
                        <div style="background-color: #e6f0fa; color: #003366; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; margin-top: 2px;">🏠</div>
                        <div style="width: 100%;">
                            <div style="font-weight: bold; color: #1e293b; font-size: 0.85rem; line-height: 1.2;">Penilaian Hunian</div>
                            <div style="color: #64748b; font-size: 0.7rem; word-break: break-word; line-height: 1.2; margin-top: 2px;">📍 ${infoWilayah}</div>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; box-sizing: border-box;">
                        <div style="color: #64748b; font-size: 0.65rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 2px;">Penggunaan Lahan</div>
                        <div style="color: #2563eb; font-weight: bold; font-size: 0.8rem; word-break: break-word;">🌱 ${infoLahan}</div>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: bold; color: #1e293b; font-size: 0.75rem; margin-bottom: 3px;">📍 Jarak Fasilitas Terdekat:</div>
                        <ul style="padding-left: 15px; margin: 0; color: #475569; font-size: 0.73rem;">${scoreResult.fasilitasHtml}</ul>
                    </div>
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; text-align: center; box-sizing: border-box;">
                        <div style="background-color: ${scoreResult.badgeColor === 'success' ? '#16a34a' : scoreResult.badgeColor === 'primary' ? '#2563eb' : scoreResult.badgeColor === 'warning' ? '#ca8a04' : '#dc2626'}; color: #fff; border-radius: 6px; padding: 6px; width: 100%; box-sizing: border-box;">
                            <span style="font-size: 0.65rem; text-transform: uppercase; display: block; opacity: 0.9; font-weight: 600;">Skor Aksesibilitas</span>
                            <strong style="font-size: 0.9rem; display: block; margin: 1px 0;">${scoreResult.skorAkhir} / 100</strong>
                            <div style="font-size: 0.7rem; font-weight: 500;">(${scoreResult.predikat})</div>
                        </div>
                    </div>
                </div>
            `)
            .addTo(map);
    });

    // ==========================================
    // 2. EVENT KLIK EKSPLORASI LAYER PENGGUNAAN LAHAN (GUNLAH)
    // ==========================================
    map.on('click', 'layer-landuse', (e) => {
        if (isPenilaianActive) return;
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties;
        const kategoriLahan = props[kolomLanduse] || "Tidak diketahui";
        const luasLahan = calculatePolygonArea(feature);
        
        const clickPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);
        const infoWilayah = getAdminRegion(clickPoint, loadedAdm);

        new Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="font-size: 0.8rem; width: 220px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 2px;">
                    <h6 style="font-weight: bold; color: #003366; font-size: 0.85rem; margin-bottom: 4px;">🌱 Informasi Penggunaan Lahan</h6>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;">
                    <p style="margin: 0 0 4px 0; font-size: 0.75rem;"><b>Kategori:</b> ${kategoriLahan}</p>
                    <p style="margin: 0 0 4px 0; font-size: 0.75rem;"><b>Luas Area:</b> ${luasLahan}</p>
                    <p style="margin: 0; color: #64748b; font-size: 0.7rem; word-break: break-word;">📍 ${infoWilayah}</p>
                </div>
            `)
            .addTo(map);
    });

    // ==========================================
    // 3. EVENT KLIK EKSPLORASI LAYER TOPONIMI (FASILITAS)
    // ==========================================
    map.on('click', 'layer-fasilitas', (e) => {
        if (isPenilaianActive) return;
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties;
        
        const namaTempat = props.NAMA_OBJEK || props.NAMMAP || props.NAMLOK || "Fasilitas Umum";
        const jenisTempat = props[namaKolom] || props.JENIS_UTAM || "Fasilitas";
        const namaJalan = props.NAMSPE || props.NAMGAZ || "Jl. Kota Surakarta";
        
        const clickPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);
        const infoWilayah = getAdminRegion(clickPoint, loadedAdm);
        
        const koordinat = `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}`;
        const fotoUrl = props.FOTO1 || props.FOTO2 || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop&q=60";

        new Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="font-size: 0.8rem; width: 230px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 2px;">
                    <div style="width: 100%; height: 110px; border-radius: 6px; overflow: hidden; margin-bottom: 6px; background-color: #f1f5f9;">
                        <img src="${fotoUrl}" alt="Foto ${namaTempat}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop&q=60'">
                    </div>
                    <h6 style="font-weight: bold; color: #1e293b; font-size: 0.85rem; margin-bottom: 4px;">${namaTempat}</h6>
                    <div style="background-color: #2563eb; color: #fff; display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.68rem; margin-bottom: 6px;">${jenisTempat}</div>
                    <p style="margin: 0 0 3px 0; color: #334155; font-size: 0.73rem;">🛣️ <b>Jalan:</b> ${namaJalan}</p>
                    <p style="margin: 0 0 3px 0; color: #64748b; font-size: 0.72rem;">📍 ${infoWilayah}</p>
                    <p style="margin: 0; color: #94a3b8; font-size: 0.68rem;"><b>Koordinat:</b> ${koordinat}</p>
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