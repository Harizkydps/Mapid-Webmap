export function initToponimiLayer(map, toponimiDataUrl, kolomJenis) {
    // 1. Tambahkan Source dengan opsi cluster
    map.addSource('toponimi-source', { 
        type: 'geojson', 
        data: toponimiDataUrl,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50 
    });
    
    // 2. Layer: Lingkaran Klaster
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'toponimi-source',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 50, '#f28cb1'],
            'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25]
        }
    });

    // 3. Layer: Teks Angka di Klaster
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'toponimi-source',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // 4. Layer: Fasilitas Asli (Hanya muncul jika tidak di-cluster)
    map.addLayer({
        id: 'layer-fasilitas',
        type: 'circle',
        source: 'toponimi-source',
        filter: ['!', ['has', 'point_count']],
        layout: { 'visibility': 'none' },
        paint: {
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-color': [
                'match', ['get', kolomJenis],
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

    // Event Klik untuk Zoom pada Klaster
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('toponimi-source').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
        });
    });

    // Pengaturan visibility toggle parent
    const checkToponimiParent = document.getElementById('check-toponimi-parent');
    const subToponimiContainer = document.getElementById('sub-toponimi');
    if (checkToponimiParent) {
        checkToponimiParent.addEventListener('change', (e) => {
            const isVisible = e.target.checked ? 'visible' : 'none';
            subToponimiContainer.style.display = e.target.checked ? 'block' : 'none';
            map.setLayoutProperty('layer-fasilitas', 'visibility', isVisible);
            map.setLayoutProperty('clusters', 'visibility', isVisible);
            map.setLayoutProperty('cluster-count', 'visibility', isVisible);
        });
    }

    // Filter kategori (Terapkan pada 'layer-fasilitas')
    const toponimiCheckboxes = document.querySelectorAll('.check-kategori');
    toponimiCheckboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            const activeValues = Array.from(toponimiCheckboxes).filter(i => i.checked).map(i => i.value);
            const filter = activeValues.length === 0 ? ['==', kolomJenis, ''] : ['in', kolomJenis, ...activeValues];
            map.setFilter('layer-fasilitas', filter);
        });
    });
}