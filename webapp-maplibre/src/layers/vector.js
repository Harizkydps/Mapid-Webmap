import naturalEarthData from "../data/ne.geojson?url";
import areaData from "../data/adm_banten.geojson?url";

export function addKotaLayer (map){
// Layer Tipe Circle (Point)
    map.addSource('kota',{
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
    })
    }

export function addAdmBanten(map){
    // Layer Tipe Fill (Polygon)
    map.addSource('area',{
        type: 'geojson',
        data: areaData
    });
    map.addLayer({
        id: 'area-layer',
        type: 'fill',
        source: 'area',
        paint: {
            'fill-color': '#ffffff',
            'fill-outline-color': '#000000'
        }
    });

}