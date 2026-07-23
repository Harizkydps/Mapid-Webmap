# Toolbox Spatial in Python

Setiap *toolbox* dapat dijalankan dengan dua cara: **direct call** (CLI Python) atau **endpoint call** (HTTP POST melalui Flask). Untuk menggunakan endpoint, jalankan server dari *root* repository:

```bash
flask --app engine run --debug
```

Server akan berjalan di `http://127.0.0.1:5000`. Semua endpoint menggunakan metode `POST` dengan *body* berupa JSON.

## 1. Spatial Computation

### 1.1. Area
Mengukur luas dalam sebuah poligon menggunakan pengukuran geodesi menggunakan *ellipsoid* `WGS84`. Input geometri harus dalam format WKT dan menggunakan koordinat geografis.

Direct call:
```bash
python -m toolbox.spatial_computation.area \
  "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7), (110.4 -7.4, 110.6 -7.4, 110.6 -7.6, 110.4 -7.6, 110.4 -7.4))"
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/spatial_computation/area \
  -H "Content-Type: application/json" \
  -d '{"geometry": "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7), (110.4 -7.4, 110.6 -7.4, 110.6 -7.6, 110.4 -7.6, 110.4 -7.4))"}'
```

### 1.2. Distance
Mengukur jarak antara 2 geometri menggunakan pengukuran geodesi menggunakan *ellipsoid* `WGS84`. Input geometri harus dalam format WKT dan menggunakan koordinat geografis.

Direct call:
```bash
python -m toolbox.spatial_computation.distance \
    "POINT(110.3644 -7.7956)" \
    "POINT(106.8456 -6.2088)"
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/spatial_computation/distance \
  -H "Content-Type: application/json" \
  -d '{
    "geometry_1": "POINT(110.3644 -7.7956)",
    "geometry_2": "POINT(106.8456 -6.2088)"
  }'
```

### 1.3. Length
Mengukur panjang pada garis atau keliling pada poligon menggunakan pengukuran geodesi menggunakan *ellipsoid* `WGS84`. Input geometri harus dalam format WKT dan menggunakan koordinat geografis.

Direct call:
```bash
python -m toolbox.spatial_computation.length \
  "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7))"
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/spatial_computation/length \
  -H "Content-Type: application/json" \
  -d '{"geometry": "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7))"}'
```

## 2. Geometry Manipulation

### 2.1. Buffer
Membuat geometri penyangga menggunakan perhitungan proyeksi **Azimuthal Equidistant**. Catatan: perhitungan hanya akurat pada skala perkotaan, lihat tabel di bawah.

| Jarak dari centroid | Distorsi tangensial | Distorsi maksimum |
| ------------------- | ------------------- | ----------------- |
| 100 km              | ~0.0041%            | ~0.04 m per km.   |
| 500 km              | ~0.10%              | ~1 m per km       |
| 1,000 km            | ~0.41%              | ~4 m per km       |
| 2,000 km            | ~1.66%              | ~16 m per km      |
| 3,000 km            | ~3.79%              | ~38 m per km      |
| 5,000 km            | ~11.05%             | ~110 m per km     |


Direct call:
```bash
python -m toolbox.geometry_manipulation.buffer \
  "POINT(110.3644 -7.7956)" 1000
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/geometry_manipulation/buffer \
  -H "Content-Type: application/json" \
  -d '{"geometry": "POINT(110.3644 -7.7956)", "distance_m": 1000}'
```

### 2.2. Centroid
Membuat titik gravitasi pada sebuah input geometri. Input geometri harus dalam format WKT dan menggunakan koordinat geografis.

Direct call:
```bash
python -m toolbox.geometry_manipulation.centroid \
  "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7))"
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/geometry_manipulation/centroid \
  -H "Content-Type: application/json" \
  -d '{"geometry": "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7))"}'
```

### 2.3. Intersections
Membuat geometri baru di antara 2 input geometri yang mengalami titik persinggungan. Input geometri harus dalam format WKT dan menggunakan koordinat geografis.

Direct call:
```bash
python -m toolbox.geometry_manipulation.intersections \
  "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7))" \
  "POLYGON((110.5 -7.5, 112 -7.5, 112 -9, 110.5 -9, 110.5 -7.5))"
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/geometry_manipulation/intersections \
  -H "Content-Type: application/json" \
  -d '{
    "geometry_1": "POLYGON((110 -7, 111 -7, 111 -8, 110 -8, 110 -7))",
    "geometry_2": "POLYGON((110.5 -7.5, 112 -7.5, 112 -9, 110.5 -9, 110.5 -7.5))"
  }'
```

## 3. Network Analysis

### 3.1. Dijkstra
Mengukur jarak tempuh tercepat dari titik awal menuju titik akhir menggunakan jaringan garis. Input titik awal dan akhir harus dalam bentuk WKT point dan jaringan garis dapat berupa linestring maupun multilinestring.

Direct call:
```bash
python -m toolbox.network_analysis.dijkstra \
  "POINT(110 -7)" "POINT(111 -8)" "LINESTRING(110 -7, 111 -7, 111 -8)"
```

Endpoint call:
```bash
curl -X POST http://127.0.0.1:5000/network_analysis/dijkstra \
  -H "Content-Type: application/json" \
  -d '{
    "start": "POINT(110 -7)",
    "end": "POINT(111 -8)",
    "network": "LINESTRING(110 -7, 111 -7, 111 -8)"
  }'
```
