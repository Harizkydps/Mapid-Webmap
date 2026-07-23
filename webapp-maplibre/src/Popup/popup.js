import { Popup } from "maplibre-gl";
import { storeAreaGeometry } from "../engine/areaTools.js";

// Popup untuk Layer Kota (Point)
export function addKotaPopup(map, event) {
  const coordinate = event.lngLat;
  const properties = event.features[0]?.properties;
  const namaKota = properties?.NAME || properties?.name || "Detail Kota";

  return new Popup()
    .setLngLat(coordinate)
    .setHTML(`
      <div style="padding: 4px; font-family: sans-serif;">
        <h4 style="margin: 0 0 4px 0;">${namaKota}</h4>
        <small style="color: #666;">Lng: ${coordinate.lng.toFixed(4)}, Lat: ${coordinate.lat.toFixed(4)}</small>
      </div>
    `)
    .addTo(map);
}

// Popup untuk Layer Administrasi / Area (Polygon)
export function addADMPopup(map, event) {
  const coordinate = event.lngLat;
  const properties = event.features[0]?.properties;
  const namaWilayah = properties?.WADMKK || properties?.NAMOBJ || properties?.NAME || "Wilayah Administrasi";

  // 1. Buat dan tampilkan Popup dengan KOORDINAT & tempat penampungan LUAS (<div id="luas">)
  const popup = new Popup()
    .setLngLat(coordinate)
    .setHTML(`
      <div style="padding: 6px; font-family: sans-serif; min-width: 160px;">
        <h4 style="margin: 0 0 6px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
          ${namaWilayah}
        </h4>
        <div style="font-size: 12px; color: #555; margin-bottom: 6px;">
          <strong>Koordinat:</strong><br/>
          <span>Lat: ${coordinate.lat.toFixed(5)}, Lng: ${coordinate.lng.toFixed(5)}</span>
        </div>
        <div style="font-size: 12px; color: #333;">
          <strong>Luas Area:</strong><br/>
          <span id="luas" style="color: #0066cc;"><em>Menghitung...</em></span>
        </div>
      </div>
    `)
    .addTo(map);

  // 2. Panggil kalkulasi backend untuk mengisi <span id="luas"> di atas
  storeAreaGeometry(event);

  return popup;
}