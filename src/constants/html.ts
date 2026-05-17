export function generateLeafletMapHtml(
    userLat: number,
    userLng: number,
    topPadding: number,
    talleres: Array<{ nombre: string; latitud: number; longitud: number; especialidad?: string }>,
    isDark = false
): string {
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

    // Cada marcador se crea Y se registra en _groups por categoría
    const markers = talleres.map((t, i) => {
        const esp = (t.especialidad || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const nombre = t.nombre.replace(/'/g, "\\'");
        return `var _c${i}=getTallerCategory('${esp}');var _m${i}=L.marker([${t.latitud},${t.longitud}],{icon:getTallerIcon('${esp}')}).addTo(map).bindPopup('<b>${nombre}</b>');if(!_groups[_c${i}])_groups[_c${i}]=[];_groups[_c${i}].push(_m${i});`;
    }).join('\n');

    return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;}
#map{width:100%;height:100vh;}
.leaflet-top{top:${topPadding}px!important;}
.leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.18);border:none;}
.leaflet-popup-content{font-family:-apple-system,sans-serif;font-size:13px;color:#0E1A2B;margin:10px 14px;}
.leaflet-popup-tip{background:#fff;}
@keyframes pulse{0%{transform:scale(0.5);opacity:1;}100%{transform:scale(2.5);opacity:0;}}
</style>
</head><body><div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,touchZoom:true,tap:false}).setView([${userLat},${userLng}],14);
L.tileLayer('${tileUrl}',{
  attribution:'&copy; OSM &copy; CARTO',
  subdomains:'abcd',
  maxZoom:19
}).addTo(map);

/* ── Registro de grupos por categoría ─────────────────────────── */
var _groups={};

/* ── Clasificador de categoría — debe mantenerse en sincronía con src/utils/categoryClassifier.ts ── */
function getTallerCategory(esp){
  var e=(esp||'').toLowerCase();
  if(e.indexOf('electr')!==-1)return 'electr';
  if(e.indexOf('llanta')!==-1||e.indexOf('neum')!==-1||e.indexOf('rueda')!==-1)return 'llanta';
  if(e.indexOf('freno')!==-1)return 'freno';
  if(e.indexOf('carrocer')!==-1||e.indexOf('pintur')!==-1||e.indexOf('chapa')!==-1)return 'pintura';
  if(e.indexOf('repuesto')!==-1||e.indexOf('pieza')!==-1||e.indexOf('acceso')!==-1||e.indexOf('autopart')!==-1)return 'repuesto';
  if(e.indexOf('grua')!==-1||e.indexOf('rescate')!==-1||e.indexOf('asistencia')!==-1)return 'grua';
  return 'general';
}

/* ── Ícono SVG por categoría ──────────────────────────────────── */
function getTallerIcon(esp){
  var e=(esp||'').toLowerCase();
  var color='#2563EB',svgPath;
  if(e.indexOf('electr')!==-1){
    color='#D97706';
    svgPath='<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/>';
  }else if(e.indexOf('llanta')!==-1||e.indexOf('neum')!==-1||e.indexOf('rueda')!==-1){
    color='#15803D';
    svgPath='<circle cx="12" cy="12" r="9" stroke="white" stroke-width="2.5" fill="none"/><circle cx="12" cy="12" r="3" stroke="white" stroke-width="2.5" fill="none"/>';
  }else if(e.indexOf('freno')!==-1){
    color='#DC2626';
    svgPath='<circle cx="12" cy="12" r="9" stroke="white" stroke-width="2.5" fill="none"/><rect x="9" y="9" width="6" height="6" rx="1" fill="white"/>';
  }else if(e.indexOf('carrocer')!==-1||e.indexOf('pintur')!==-1||e.indexOf('chapa')!==-1){
    color='#6D28D9';
    svgPath='<rect x="3" y="8" width="18" height="12" rx="2" stroke="white" stroke-width="2.5" fill="none"/><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="white" stroke-width="2.5" fill="none"/>';
  }else if(e.indexOf('repuesto')!==-1||e.indexOf('pieza')!==-1||e.indexOf('acceso')!==-1||e.indexOf('autopart')!==-1){
    color='#EA580C';
    svgPath='<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="white" stroke-width="2" fill="none"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" stroke-width="2" fill="none"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="white" stroke-width="2"/>';
  }else if(e.indexOf('grua')!==-1||e.indexOf('rescate')!==-1||e.indexOf('asistencia')!==-1){
    color='#0E7490';
    svgPath='<rect x="1" y="3" width="15" height="13" stroke="white" stroke-width="2" fill="none" rx="1"/><path d="M16 8l4 0 2 5-6 0" stroke="white" stroke-width="2" fill="none"/><circle cx="5.5" cy="18.5" r="2.5" stroke="white" stroke-width="2" fill="none"/><circle cx="18.5" cy="18.5" r="2.5" stroke="white" stroke-width="2" fill="none"/>';
  }else{
    svgPath='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  var shadow=color+'66';
  var h='<div style="display:flex;flex-direction:column;align-items:center;">'+
    '<div style="width:38px;height:38px;border-radius:12px;background:'+color+';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px '+shadow+';">'+
    '<svg width="20" height="20" viewBox="0 0 24 24">'+svgPath+'</svg>'+
    '</div>'+
    '<div style="width:6px;height:6px;border-radius:50%;background:'+color+';margin-top:2px;"></div>'+
    '</div>';
  return L.divIcon({html:h,className:'',iconSize:[38,50],iconAnchor:[19,50]});
}

/* ── Marcador de usuario ──────────────────────────────────────── */
var userIcon=L.divIcon({
  html:'<div style="position:relative;width:20px;height:20px;"><div style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(37,99,235,0.25);animation:pulse 2s ease-out infinite;"><\/div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#2563EB;border:2px solid #FFF;box-shadow:0 0 0 3px rgba(37,99,235,0.2);"><\/div><\/div>',
  className:'',iconSize:[20,20],iconAnchor:[10,10]
});
L.marker([${userLat},${userLng}],{icon:userIcon}).addTo(map).bindPopup('<b>Tu ubicacion</b>');

/* ── Marcadores de talleres (generados por TypeScript) ────────── */
${markers}

/* ── Filtro en tiempo real llamado desde React Native ─────────── */
window.filterMarkers=function(cat){
  Object.keys(_groups).forEach(function(group){
    _groups[group].forEach(function(marker){
      var show=(cat==='all'||group===cat);
      if(show&&!map.hasLayer(marker))marker.addTo(map);
      else if(!show&&map.hasLayer(marker))map.removeLayer(marker);
    });
  });
};

/* ── Colapsar panel al tocar el mapa ─────────────────────────── */
map.on('click',function(){
  if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('collapse');
});
<\/script></body></html>`;
}
