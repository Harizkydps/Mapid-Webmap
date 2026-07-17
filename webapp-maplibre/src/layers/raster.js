import flagImage from "../data/flag.png?url";

export function addFlagLayer(map){
// Layer Tipe Raster (Tile)
map.addSource('Flag',{
    type: 'image',
    url: flagImage,
    coordinates: [
    [-6.5, 57.5],  // 1. Kiri Atas
    [ 2.0, 57.5],  // 2. Kanan Atas
    [ 2.0, 50.0],  // 3. Kanan Bawah
    [-6.5, 50.0]   // 4. Kiri Bawah
]
});

map.addLayer({
    id: 'Flag-layer',
    type: 'raster',
    source: 'Flag',
})
}