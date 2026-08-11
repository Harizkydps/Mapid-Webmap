export function initToponimiLayer(map, toponimiDataUrl, kolomJenis) {
    map.addSource('toponimi-source', { type: 'geojson', data: toponimiDataUrl });
    
    map.addLayer({
        id: 'layer-fasilitas',
        type: 'circle',
        source: 'toponimi-source',
        layout: { 'visibility': 'none' },
        paint: {
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
                'match',
                ['get', kolomJenis],
                'Kesehatan', '#e53935',
                'Pendidikan', '#1e88e5',
                'Perdagangan dan Jasa', '#fb8c00',
                'Peribadatan', '#8e24aa',
                'Olahraga', '#43a047',
                'Pariwisata dan Hiburan', '#00acc1',
                'Pertahanan dan Keamanan', '#3949ab',
                'Transportasi', '#5d4037',
                'RTH', '#7cb342',
                'Makam', '#546e7a',
                '#0066cc'
            ]
        }
    });

    const checkToponimiParent = document.getElementById('check-toponimi-parent');
    const subToponimiContainer = document.getElementById('sub-toponimi');
    if (checkToponimiParent) {
        checkToponimiParent.addEventListener('change', (e) => {
            if (e.target.checked) {
                subToponimiContainer.style.display = 'block';
                map.setLayoutProperty('layer-fasilitas', 'visibility', 'visible');
            } else {
                subToponimiContainer.style.display = 'none';
                map.setLayoutProperty('layer-fasilitas', 'visibility', 'none');
            }
        });
    }

    const toponimiCheckboxes = document.querySelectorAll('.check-kategori');
    toponimiCheckboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            const activeValues = Array.from(toponimiCheckboxes)
                .filter(i => i.checked)
                .map(i => i.value);

            if (activeValues.length === 0) {
                map.setFilter('layer-fasilitas', ['==', kolomJenis, '']);
            } else {
                map.setFilter('layer-fasilitas', ['in', kolomJenis, ...activeValues]);
            }
        });
    });
}