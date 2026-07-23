import { geojsonToWKT } from "@terraformer/wkt";

export function storeAreaGeometry(event) {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const geometry = feature.geometry;
    const wkt = geojsonToWKT(geometry);
    
    // Jalankan fungsi async untuk hitung luas
    computeArea(wkt);
}

async function computeArea(wkt) {
    try {
        // 1. Ambil elemen 'luas' di popup
        const output = document.getElementById("luas");
        if (output) {
            output.textContent = "Menghitung luas...";
        }

        // 2. Request ke Backend Python (Flask/FastAPI)
        const response = await fetch("http://127.0.0.1:5000/spatial_computation/area", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ geometry: wkt })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const result = await response.json();

        // 3. Tampilkan hasil perhitungan di dalam popup
        // Menggunakan setTimeout / requestAnimationFrame kecil agar dipastikan elemen HTML sudah dirender total
        requestAnimationFrame(() => {
            const targetElement = document.getElementById("luas");
            if (targetElement) {
                // Format angka dengan bahasa Indonesia (misal: 12.345,67 ha)
                const areaFormatted = result.area_ha.toLocaleString("id-ID", {
                    maximumFractionDigits: 2
                });
                
                targetElement.innerHTML = `<strong>Luas Area:</strong> ${areaFormatted} ${result.unit || 'ha'}`;
            }
        });

        return result;
    } catch (error) {
        console.error("Gagal menghitung luas:", error);
        const output = document.getElementById("luas");
        if (output) {
            output.textContent = "Gagal memuat luas area";
        }
    }
}