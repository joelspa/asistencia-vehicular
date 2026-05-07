/**
 * Generador de HTML para el mapa Leaflet con marcadores de talleres.
 * Se centraliza aquí porque es HTML estático que solo depende de parámetros.
 *
 * @param userLat - Latitud del usuario
 * @param userLng - Longitud del usuario
 * @param topPadding - Relleno superior (para respetar la muesca)
 * @param talleres - Arreglo de talleres con coordenadas
 * @returns HTML completo del mapa
 */
export function generateLeafletMapHtml(
    userLat: number,
    userLng: number,
    topPadding: number,
    talleres: Array<{ nombre: string; latitud: number; longitud: number }>
): string {
    const markers = talleres
        .map(
            (t) =>
                `L.marker([${t.latitud}, ${t.longitud}], {icon: tallerIcon}).addTo(map).bindPopup('<b>${t.nombre.replace(
                    /'/g,
                    "\\'"
                )}</b>');`
        )
        .join('\n');

    return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;}
#map{width:100%;height:100vh;}
.leaflet-top{top:${topPadding}px !important;}
</style>
</head><body><div id="map"></div>
<script>
var map = L.map('map').setView([${userLat}, ${userLng}], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OSM', maxZoom: 19
}).addTo(map);
var userIcon = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #FFF;box-shadow:0 0 8px rgba(59,130,246,0.5);"><\/div>',
  className: '', iconSize: [16, 16], iconAnchor: [8, 8]
});
L.marker([${userLat}, ${userLng}], {icon: userIcon}).addTo(map).bindPopup('<b>Tu ubicación</b>');
var tallerIcon = L.divIcon({
  html: '<div style="width:32px;height:32px;border-radius:8px;background:#0F2942;display:flex;align-items:center;justify-content:center;color:#FFF;font-size:16px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);">T<\/div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 32]
});
${markers}
</script></body></html>`;
}
