from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: se esperaba 1 coincidencia y se encontraron {count}')
    text = text.replace(old, new, 1)


# Marcador de versión.
replace_once(
    '<!-- MOVIDA SST: municipios validados por estado · catálogo 335 · 2026-08-07 -->',
    '<!-- MAPA SST: OpenFreeMap + MapLibre · identidad La Movida · 2026-08-26 -->\n'
    '    <!-- MOVIDA SST: municipios validados por estado · catálogo 335 · 2026-08-07 -->',
    'comentario de versión',
)

# MapLibre CSS para renderizar OpenFreeMap dentro de Leaflet.
replace_once(
    '    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css">',
    '    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css">\n'
    '    <link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet">',
    'CSS MapLibre',
)

# Identidad visual SST: base clara y discreta + clusters con paleta oficial.
css_anchor = """        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background-color: rgba(0, 123, 133, 0.3) !important; }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background-color: rgba(0, 32, 91, 0.9) !important; color: white !important; font-family: 'Outfit', sans-serif; font-weight: bold; }"""
css_replacement = """        /* MAPA SST · OpenFreeMap · identidad La Movida */
        #map-container { background: #eaf2f4 !important; }
        #map-container .maplibregl-canvas {
            filter: saturate(.82) contrast(.985) brightness(1.035);
        }
        #map-container::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 250;
            pointer-events: none;
            background:
                radial-gradient(circle at 12% 12%, rgba(0,124,131,.055), transparent 30%),
                radial-gradient(circle at 88% 84%, rgba(23,134,75,.045), transparent 32%);
            mix-blend-mode: multiply;
        }
        #map-container .maplibregl-ctrl-attrib,
        #map-container .maplibregl-ctrl-attrib a {
            font-family: 'Outfit', sans-serif !important;
            font-size: 9px !important;
            color: #52697a !important;
        }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
            background: rgba(0,124,131,.20) !important;
            border: 2px solid rgba(244,180,0,.72) !important;
            box-shadow: 0 6px 18px rgba(8,47,91,.22) !important;
        }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
            background: linear-gradient(145deg, #082f5b 0%, #007c83 100%) !important;
            color: #fff !important;
            font-family: 'Outfit', sans-serif;
            font-weight: 900;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.16);
        }"""
replace_once(css_anchor, css_replacement, 'estilo de clústeres')

# Scripts MapLibre + puente para Leaflet.
replace_once(
    '    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin="" defer></script>',
    '    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin="" defer></script>\n'
    '    <script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js" defer></script>\n'
    '    <script src="https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js" defer></script>',
    'scripts MapLibre',
)

# Validar que el puente esté listo antes de inicializar.
replace_once(
    "            if (typeof L.markerClusterGroup !== 'function') {\n"
    "                throw new Error('El complemento Leaflet MarkerCluster no se cargó.');\n"
    "            }",
    "            if (typeof L.markerClusterGroup !== 'function') {\n"
    "                throw new Error('El complemento Leaflet MarkerCluster no se cargó.');\n"
    "            }\n"
    "            if (typeof L.maplibreGL !== 'function') {\n"
    "                throw new Error('OpenFreeMap / MapLibre no se cargó.');\n"
    "            }",
    'validación MapLibre',
)

# Mapa principal: CARTO Voyager -> OpenFreeMap Positron.
old_main = """            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);"""
new_main = """            // OpenFreeMap vectorial: sin API key. Positron mantiene el fondo limpio
            // para que los profesionales, clústeres y estados SST sean protagonistas.
            L.maplibreGL({
                style: 'https://tiles.openfreemap.org/styles/positron'
            }).addTo(map);"""
replace_once(old_main, new_main, 'CARTO principal')

# Mapa de verificación: elimina la segunda dependencia de CARTO.
replace_once(
    "                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(valMapInstance);",
    "                    L.maplibreGL({ style: 'https://tiles.openfreemap.org/styles/positron' }).addTo(valMapInstance);",
    'CARTO validador',
)

# Espera de librerías al arrancar.
replace_once(
    "                    () => Boolean(window.L && typeof window.L.map === 'function' && typeof window.L.markerClusterGroup === 'function'),",
    "                    () => Boolean(window.L && typeof window.L.map === 'function' && typeof window.L.markerClusterGroup === 'function' && typeof window.L.maplibreGL === 'function'),",
    'espera de MapLibre',
)

# Detalles visuales con identidad La Movida.
replace_once(
    "                spiderLegPolylineOptions: { weight: 2, color: '#64748b', opacity: 0.58 }",
    "                spiderLegPolylineOptions: { weight: 2.2, color: '#007c83', opacity: 0.68 }",
    'spider legs',
)
replace_once(
    "                    fillColor: '#ffb600',",
    "                    fillColor: '#f4b400',",
    'ubicación actual',
)
replace_once(
    "                    heatmapLayer = L.heatLayer(heatPoints, {radius: 35, blur: 25, maxZoom: 8, gradient: {0.4: 'green', 0.65: 'yellow', 1: 'red'}}).addTo(map);",
    "                    heatmapLayer = L.heatLayer(heatPoints, {radius: 35, blur: 25, maxZoom: 8, gradient: {0.18: '#082f5b', 0.42: '#007c83', 0.68: '#17864b', 1: '#f4b400'}}).addTo(map);",
    'heatmap SST',
)
replace_once(
    '<p class="font-black text-movida-navy uppercase tracking-wider mb-2">Leyenda</p>',
    '<p class="font-black text-movida-navy uppercase tracking-wider mb-2"><i class="fa-solid fa-shield-halved text-movida-teal mr-1"></i> Mapa SST</p>',
    'leyenda SST',
)

# Comprobaciones de seguridad antes de escribir.
if 'basemaps.cartocdn.com' in text:
    raise SystemExit('Todavía queda una referencia a CARTO después de la migración.')
if text.count('tiles.openfreemap.org/styles/positron') != 2:
    raise SystemExit('OpenFreeMap no quedó configurado exactamente en los dos mapas esperados.')
if 'leaflet-maplibre-gl' not in text:
    raise SystemExit('Falta el puente MapLibre/Leaflet.')

path.write_text(text, encoding='utf-8')
print('Migración OpenFreeMap aplicada y validada correctamente.')
