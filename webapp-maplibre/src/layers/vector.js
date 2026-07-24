import naturalEarthData from "../data/ne.geojson?url";
import areaData from "../data/adm_banten.geojson?url";

export function addKotaLayer(map) {
    // Layer Tipe Circle (Point)
    map.addSource('kota', {
        type: 'geojson',
        data: naturalEarthData
    });
    map.addLayer({
        id: 'kota-layer',
        type: 'circle',
        source: 'kota',
        paint: {
            'circle-radius': 7,
            'circle-color': '#ff0000',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });
}

export function addAdmBanten(map) {
    // Layer Tipe Fill (Polygon)
    map.addSource('area', {
        type: 'geojson',
        data: areaData
    });
    map.addLayer({
        id: 'area-layer',
        type: 'fill',
        source: 'area',
        paint: {
            'fill-color': '#ffffff',
            'fill-opacity': 0.4,
            'fill-outline-color': '#000000'
        }
    });
}

export function addBufferLayer(map, data) {
    // Cek apakah source 'buffer' sudah ada
    const existingSource = map.getSource('buffer');

    if (existingSource) {
        // Jika sudah ada, perbarui datanya dengan buffer titik kota baru
        existingSource.setData(data);
    } else {
        // Jika belum ada, buat source dan layer baru
        map.addSource('buffer', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            id: 'area-buffer',
            type: 'fill',
            source: 'buffer',
            paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.3, // Dibuat semi-transparan
                'fill-outline-color': '#000000'
            }
        });
    }
}