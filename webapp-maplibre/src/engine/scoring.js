import * as turf from '@turf/turf';

/**
 * Fungsi untuk menghitung skor aksesibilitas hunian berdasarkan jarak fasilitas terdekat
 * @param {Array} userPoint - Titik koordinat [lng, lat] yang diklik user (format Turf point)
 * @param {Object} loadedToponimi - Data GeoJSON fasilitas toponimi
 * @param {String} namaKolom - Nama kolom kategori pada GeoJSON (misal: 'JENIS')
 * @returns {Object} - Mengembalikan skor akhir, predikat, warna badge, dan rincian HTML
 */
export function calculateAccessibilityScore(userPoint, loadedToponimi, namaKolom) {
    let fasilitasHtml = "";
    let totalSkor = 0;
    
    // Daftar kategori fasilitas yang dihitung bobotnya
    const kategoriList = ['Kesehatan', 'Pendidikan', 'Perdagangan dan Jasa', 'Transportasi', 'Peribadatan'];

    if (loadedToponimi && loadedToponimi.features) {
        const features = loadedToponimi.features;

        kategoriList.forEach(kat => {
            const filtered = features.filter(f => f.properties[namaKolom] === kat);
            if (filtered.length > 0) {
                const targetCollection = turf.featureCollection(filtered);
                const nearest = turf.nearestPoint(userPoint, targetCollection);
                const jarakMeter = Math.round(turf.distance(userPoint, nearest, { units: 'meters' }));

                fasilitasHtml += `<li><b>${kat}:</b> ${jarakMeter} meter</li>`;

                // ==========================================
                // RUMUS / BOBOT SKOR BERDASARKAN JARAK (METER)
                // ==========================================
                if (jarakMeter <= 300) {
                    totalSkor += 20; // Sangat dekat (Maksimal 20 poin per fasilitas)
                } else if (jarakMeter <= 800) {
                    totalSkor += 12; // Menengah
                } else if (jarakMeter <= 2000) {
                    totalSkor += 5;  // Jauh
                } else {
                    totalSkor += 0;  // Tidak ada akses
                }
            } else {
                fasilitasHtml += `<li><b>${kat}:</b> Tidak terdeteksi</li>`;
            }
        });
    }

    // Skor maksimal adalah 5 kategori x 20 poin = 100
    const skorAkhir = totalSkor; 
    
    // Klasifikasi / Predikat Kelayakan
    let predikat, badgeColor;
    if (skorAkhir >= 80) {
        predikat = 'Sangat Strategis (A)';
        badgeColor = 'success';
    } else if (skorAkhir >= 60) {
        predikat = 'Strategis (B)';
        badgeColor = 'primary';
    } else if (skorAkhir >= 40) {
        predikat = 'Cukup Strategis (C)';
        badgeColor = 'warning';
    } else {
        predikat = 'Kurang Strategis (D)';
        badgeColor = 'danger';
    }

    return {
        skorAkhir,
        predikat,
        badgeColor,
        fasilitasHtml
    };
}