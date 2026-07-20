import { Popup } from "maplibre-gl";

export function addKotaPopup(map, event) {
    // 1. Buat popup baru di dalam fungsi (P besar)
    // 2. Gunakan event.lngLat (L besar)
    return new Popup()
        .setLngLat(event.lngLat) 
        .setHTML("<h5>Hello World</h5>")
        .addTo(map);
}