const tombolSembunyi = document.getElementById('btn-toggle-konten');
const tombolWarna = document.getElementById('btn-ubah-warna');

const kotakKartu = document.getElementById('konten-kartu');
const heading = document.getElementsByClassName('navbar')[0];
const footer = document.getElementsByClassName('footer')[0];

// Fungsi untuk mengubah warna latar belakang panel tugas

tombolSembunyi.addEventListener('click', function() {
    if (kotakKartu.style.display === 'none') {
        kotakKartu.style.display = 'flex'; // Munculkan lagi
        tombolSembunyi.innerText = 'Sembunyikan Kartu Informasi'; // Ganti teks tombol
    } else {
        kotakKartu.style.display = 'none'; // Sembunyikan/hilangkan
        tombolSembunyi.innerText = 'Tampilkan Kartu Informasi'; // Ganti teks tombol
    }
});

tombolWarna.addEventListener('click', function() {
 if (heading.style.backgroundColor === 'rgb(0, 51, 102)') {
        heading.style.backgroundColor = 'rgb(139, 11, 11)';
        footer.style.backgroundColor = 'rgb(139, 11, 11)';
        tombolWarna.innerText = 'Kembalikan'; // Ganti teks tombol
    } else {
        heading.style.backgroundColor = 'rgb(0, 51, 102)';
        footer.style.backgroundColor = 'rgb(0, 51, 102)';
        tombolWarna.innerText = 'Ubah Warna'; // Ganti teks tombol
    }
});

    const url = "https://geoserver.mapid.io/layers_new/get_layer?api_key=7b8019aa264248e89e3fd5b27253132f&layer_id=69ace1b8643f7636a769ce7c&project_id=69ab9fb96c69e6252868efaf";

document.getElementById("btnLoad").addEventListener("click", async function() {
  const status = document.getElementById("status");
  const hasil = document.getElementById("hasil");

  status.innerText = "⏳ Memuat data...";
  hasil.innerHTML = "";

  try {
    const response = await fetch(url);
    const data = await response.json();
    const lokasi = data.features;

    status.innerText = `✅ Berhasil memuat ${lokasi.length} lokasi`;

    // 1. Buat struktur tabel dan header terlebih dahulu
    const table = document.createElement("table");
    table.classList.add("data-table"); // Class untuk styling CSS
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Lokasi</th>
          <th>Wilayah (Kec/Kab)</th>
          <th>Tipe & Status</th>
          <th>Koordinat (Lat, Lng)</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const tbody = table.querySelector("tbody");

    // Filter yang punya NAMA, ambil 10 pertama
    const dataTerfilter = lokasi
      .filter(item => item.properties && item.properties.NAMA)
      .slice(0, 10);

    // 2. Masukkan data ke dalam baris tabel (row)
    dataTerfilter.forEach((item, index) => {
      const p = item.properties;
      const [lng, lat] = item.geometry.coordinates;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${p.NAMA}</strong></td>
        <td>📍 ${p.KECAMATAN || "-"}, ${p.KABKOT || "-"}</td>
        <td>🏢 ${p.TIPE_2 || "-"} <br> <small>Status: ${p.STATUS || "-"}</small></td>
        <td>🌐 ${lat.toFixed(5)}, ${lng.toFixed(5)}</td>
      `;
      tbody.appendChild(row);
    });

    // 3. Masukkan tabel yang sudah jadi ke dalam container #hasil
    hasil.appendChild(table);

  } catch (error) {
    status.innerHTML = `❌ Gagal memuat: ${error.message}`;
  }
});
