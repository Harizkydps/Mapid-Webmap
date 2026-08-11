export function initLanduseLayer(map, landuseDataUrl, kolomLanduse) {
    map.addSource('landuse-source', { type: 'geojson', data: landuseDataUrl });
    
    map.addLayer({
        id: 'layer-landuse',
        type: 'fill',
        source: 'landuse-source',
        layout: { 'visibility': 'none' },
        paint: {
            'fill-color': [
                'match',
                ['get', kolomLanduse],
                'Danau', '#3366cc',
                'Industri', '#9b59b6',
                'Jalan', '#00bcd4',
                'Jalur Hijau', '#b5b838',
                'Kolam', '#ff69b4',
                'Lapangan Olahraga', '#9acd32',
                'Makam', '#9370db',
                'Median Jalan', '#40e0d0',
                'Pariwisata dan Hiburan', '#ff1493',
                'Perdagangan dan Jasa', '#2ecc71',
                'Pergudangan', '#bdb76b',
                'Perkantoran', '#4169e1',
                'Permukaan/Lapangan Diperkeras', '#7b68ee',
                'Permukiman', '#f39c12',
                'Pertahanan dan Keamanan', '#a0522d',
                'Rel', '#6495ed',
                'Sarana Kesehatan', '#daa520',
                'Sarana Olahraga', '#ff69b4',
                'Sarana Pendidikan', '#228b22',
                'Sarana Peribadatan', '#3cb371',
                'Sarana Sosial', '#ff4500',
                'Sarana Transportasi', '#483d8b',
                'Sarana Utilitas', '#000080',
                'Sawah', '#00ced1',
                'Semak Belukar', '#da70d6',
                'Sungai', '#ba55d3',
                'Taman', '#32cd32',
                'Tanah Kosong', '#d2691e',
                'Tanaman Campuran', '#b22222',
                'Tegalan/Ladang', '#7fff00',
                '#95a5a6'
            ],
            'fill-opacity': 0.65,
            'fill-outline-color': '#ffffff'
        }
    });

    // Kontrol Parent Checkbox
    const checkLanduseParent = document.getElementById('check-landuse-parent');
    const subLanduseContainer = document.getElementById('sub-landuse');
    if (checkLanduseParent) {
        checkLanduseParent.addEventListener('change', (e) => {
            if (e.target.checked) {
                subLanduseContainer.style.display = 'block';
                map.setLayoutProperty('layer-landuse', 'visibility', 'visible');
            } else {
                subLanduseContainer.style.display = 'none';
                map.setLayoutProperty('layer-landuse', 'visibility', 'none');
            }
        });
    }

    // Filter Sub-Kategori Checkbox
    const landuseCheckboxes = document.querySelectorAll('.check-landuse-kategori');
    landuseCheckboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            const activeValues = Array.from(landuseCheckboxes)
                .filter(i => i.checked)
                .map(i => i.value);

            if (activeValues.length === 0) {
                map.setFilter('layer-landuse', ['==', kolomLanduse, '']);
            } else {
                map.setFilter('layer-landuse', ['in', kolomLanduse, ...activeValues]);
            }
        });
    });
}