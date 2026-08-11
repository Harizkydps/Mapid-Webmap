import * as turf from '@turf/turf';

/**
 * Fungsi untuk menghitung luas poligon GeoJSON menggunakan Turf.js
 * @param {Object} polygonFeature - Fitur poligon GeoJSON
 * @returns {String} - Luas format teks (m2 atau hektar)
 */
export function calculatePolygonArea(polygonFeature) {
    try {
        const areaM2 = turf.area(polygonFeature);
        if (areaM2 >= 10000) {
            const areaHa = (areaM2 / 10000).toFixed(2);
            return `${areaHa} Hektar (${Math.round(areaM2).toLocaleString('id-ID')} m²)`;
        }
        return `${Math.round(areaM2).toLocaleString('id-ID')} m²`;
    } catch (err) {
        console.error("Gagal menghitung luas:", err);
        return "Tidak dapat dihitung";
    }
}