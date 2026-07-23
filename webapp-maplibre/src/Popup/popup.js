import { Popup } from "maplibre-gl";

export function addKotaPopup(map, event) {
  // Ambil koordinat klik dari event
  const coordinate = event.lngLat;
  
  // Ambil data properti jika layer kamu punya attribute (opsional)
  const properties = event.features[0]?.properties;
  const namaKota = properties.NAME
  
  // Tampilkan Popup
  return new Popup()
    .setLngLat(coordinate)
    .setHTML(`
      <div style="padding: 4px;">
        <h4 style="margin: 0 0 4px 0;">${namaKota}</h4>
        <small>Lng: ${coordinate.lng.toFixed(2)}, Lat: ${coordinate.lat.toFixed(2)}</small>
      </div>
    `)
    .addTo(map);
}