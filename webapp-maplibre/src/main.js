// src/main.js - Interactive Calculator dengan Tampilan Elegant & Rapi

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Script Beranda WebGIS Hunian Solo Aktif!");

    // Inisialisasi Kalkulator Aksesibilitas
    initAccessibilityCalculator();
});

/**
 * Fungsi untuk membuat dan menangani Kalkulator Aksesibilitas Hunian
 */
function initAccessibilityCalculator() {
    const mainContainer = document.querySelector("main.container");
    if (!mainContainer) return;

    // 1. Buat elemen section kalkulator
    const calcSection = document.createElement("section");
    calcSection.className = "my-4 p-4 rounded-3 shadow-sm bg-white border";
    calcSection.innerHTML = `
        <div class="text-center mb-3">
            <h3 class="h5 fw-bold mb-1" style="color: #003366;">🧮 Simulasi Kebutuhan Hunian</h3>
            <p class="text-muted small mb-0">Pilih prioritas fasilitas Anda untuk melihat rekomendasi lokasi hunian di Solo Raya.</p>
        </div>

        <div class="row g-3 justify-content-center">
            <div class="col-md-5">
                <label for="calc-transport" class="form-label small fw-semibold text-dark mb-1">
                    🚌 Akses Transportasi (Stasiun / Halte BST)
                </label>
                <select id="calc-transport" class="form-select form-select-sm">
                    <option value="3" selected>Sangat Penting (&lt; 1 km dari stasiun/halte)</option>
                    <option value="2">Sedang (1 - 3 km dari stasiun/halte)</option>
                    <option value="1">Cukup / Tidak Terlalu Penting (&gt; 3 km)</option>
                </select>
            </div>
            <div class="col-md-5">
                <label for="calc-fasilitas" class="form-label small fw-semibold text-dark mb-1">
                    🏥 Akses Fasilitas Publik (RS / Pasar / Mall)
                </label>
                <select id="calc-fasilitas" class="form-select form-select-sm">
                    <option value="3" selected>Sangat Penting (&lt; 1 km dari RS/Pasar)</option>
                    <option value="2">Sedang (1 - 3 km dari RS/Pasar)</option>
                    <option value="1">Cukup / Tidak Terlalu Penting (&gt; 3 km)</option>
                </select>
            </div>
        </div>

        <div class="text-center mt-3">
            <button id="btn-hitung-skor" class="btn btn-primary btn-sm px-4 fw-semibold shadow-sm">
                ✨ Hitung Rekomendasi Lokasi
            </button>
        </div>

        <div id="calc-result" class="mt-3 p-3 rounded-3 text-center d-none"></div>
    `;

    // Sisipkan kalkulator di atas banner CTA
    const ctaSection = document.querySelector(".cta-banner");
    if (ctaSection) {
        mainContainer.insertBefore(calcSection, ctaSection);
    } else {
        mainContainer.appendChild(calcSection);
    }

    // 2. Logic Perhitungan saat Tombol Diklik
    const btnHitung = document.getElementById("btn-hitung-skor");
    btnHitung.addEventListener("click", () => {
        const valTrans = parseInt(document.getElementById("calc-transport").value);
        const valFas = parseInt(document.getElementById("calc-fasilitas").value);
        const totalSkor = valTrans + valFas;

        const resultDiv = document.getElementById("calc-result");
        
        // Reset class styling hasil
        resultDiv.className = "mt-3 p-3 rounded-3 text-center small";

        if (totalSkor >= 5) {
            // Aksesibilitas Tinggi (Pusat Kota / Surakarta)
            resultDiv.classList.add("bg-success-subtle", "text-success-emphasis", "border", "border-success-subtle");
            resultDiv.innerHTML = `
                <h6 class="fw-bold mb-1">🎯 Rekomendasi: <strong>Kawasan Aksesibilitas Tinggi (Pusat Kota Solo)</strong></h6>
                <p class="mb-2 text-muted small">Sangat cocok di area strategis seperti <strong>Banjarsari, Jebres, atau Laweyan</strong> yang dekat dengan stasiun kereta dan fasilitas umum.</p>
                <a href="map.html" class="btn btn-sm btn-success fw-semibold px-3">🗺️ Buka Peta Hunian Solo</a>
            `;
        } else if (totalSkor >= 3) {
            // Aksesibilitas Sedang
            resultDiv.classList.add("bg-info-subtle", "text-info-emphasis", "border", "border-info-subtle");
            resultDiv.innerHTML = `
                <h6 class="fw-bold mb-1">🏡 Rekomendasi: <strong>Kawasan Penyangga (Sub-Urban Solo)</strong></h6>
                <p class="mb-2 text-muted small">Cocok di area sekitar <strong>Kartasura, Solo Baru, atau Palur</strong> dengan akses transportasi terjangkau dan suasana lebih tenang.</p>
                <a href="map.html" class="btn btn-sm btn-info text-white fw-semibold px-3">🗺️ Buka Peta & Lihat Titik Lokasi</a>
            `;
        } else {
            // Aksesibilitas Rendah / Pinggiran
            resultDiv.classList.add("bg-warning-subtle", "text-warning-emphasis", "border", "border-warning-subtle");
            resultDiv.innerHTML = `
                <h6 class="fw-bold mb-1">🌿 Rekomendasi: <strong>Kawasan Pinggiran / Perumahan Asri</strong></h6>
                <p class="mb-2 text-muted small">Cocok untuk hunian tenang di kawasan <strong>Karanganyar atau Sukoharjo</strong> dengan kisaran harga kompetitif.</p>
                <a href="map.html" class="btn btn-sm btn-warning text-dark fw-semibold px-3">🗺️ Eksplorasi Peta Hunian</a>
            `;
        }

        // Tampilkan elemen hasil
        resultDiv.classList.remove("d-none");
        resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
}