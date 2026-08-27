(() => {
  'use strict';

  const DATA_URL = 'https://raw.githubusercontent.com/open-admin-data/venezuela-administrative-divisions/master/data/all-municipality.json';
  const CACHE_KEY = 'movida:geo:ve:municipios:20260628:v1';
  const CACHE_MIN = 330;

  let indiceMunicipios = new Map();
  let indicePorEstado = new Map();

  const normalizar = (valor) => String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

  const alias = new Map([
    ['bolivar|heres', 'bolivar|angosturadelorinoco'],
    ['bolivar|raulleoni', 'bolivar|bolivarianoangostura'],
    ['merida|arzobiposachacon', 'merida|arzobispochacon'],
    ['portuguesa|monsenordistefano', 'portuguesa|monsenorjosevicentedeund']
  ]);

  function distanciaLevenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      let diagonal = fila[0];
      fila[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const previo = fila[j];
        fila[j] = Math.min(
          fila[j] + 1,
          fila[j - 1] + 1,
          diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        diagonal = previo;
      }
    }
    return fila[b.length];
  }

  function construirIndices(registros) {
    indiceMunicipios = new Map();
    indicePorEstado = new Map();

    registros.forEach((registro) => {
      const estado = String(registro?.estado || '').trim();
      const municipio = String(registro?.municipio || '').trim();
      const lat = Number(registro?.lat);
      const lng = Number(registro?.lng);
      if (!estado || !municipio || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const estadoKey = normalizar(estado);
      const municipioKey = normalizar(municipio);
      const key = `${estadoKey}|${municipioKey}`;
      const coords = { lat, lng, estado, municipio };

      indiceMunicipios.set(key, coords);
      if (!indicePorEstado.has(estadoKey)) indicePorEstado.set(estadoKey, []);
      indicePorEstado.get(estadoKey).push({ municipioKey, coords });
    });
  }

  async function cargarCatalogo() {
    let compactos = null;

    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cache && Array.isArray(cache.data) && cache.data.length >= CACHE_MIN) {
        compactos = cache.data;
      }
    } catch (_) {}

    if (!compactos) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5500);
      try {
        const respuesta = await fetch(DATA_URL, {
          cache: 'force-cache',
          signal: controller.signal
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const catalogo = await respuesta.json();
        compactos = (Array.isArray(catalogo) ? catalogo : [])
          .map((registro) => ({
            estado: registro?.parent?.name?.local || '',
            municipio: registro?.name?.local || '',
            lat: Number(registro?.geo?.lat),
            lng: Number(registro?.geo?.lon)
          }))
          .filter((registro) =>
            registro.estado &&
            registro.municipio &&
            Number.isFinite(registro.lat) &&
            Number.isFinite(registro.lng)
          );

        if (compactos.length >= CACHE_MIN) {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              version: '2026-06-28',
              data: compactos
            }));
          } catch (_) {}
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    construirIndices(compactos || []);
    return indiceMunicipios.size;
  }

  function resolverMunicipio(estado, municipio) {
    const estadoKey = normalizar(estado);
    const municipioKey = normalizar(municipio);
    if (!estadoKey || !municipioKey) return null;

    const key = `${estadoKey}|${municipioKey}`;
    const aliasKey = alias.get(key) || key;
    if (indiceMunicipios.has(aliasKey)) return indiceMunicipios.get(aliasKey);

    const candidatos = indicePorEstado.get(estadoKey) || [];
    let mejor = null;
    let mejorPuntaje = 0;

    candidatos.forEach((candidato) => {
      const longitud = Math.max(municipioKey.length, candidato.municipioKey.length, 1);
      const distancia = distanciaLevenshtein(municipioKey, candidato.municipioKey);
      const puntaje = 1 - (distancia / longitud);
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejor = candidato.coords;
      }
    });

    return mejorPuntaje >= 0.88 ? mejor : null;
  }

  function instalarResolutor() {
    if (typeof coordenadasIntegrante !== 'function') return false;

    const original = coordenadasIntegrante;
    coordenadasIntegrante = function coordenadasIntegranteMunicipal(item) {
      const iso2 = String(item?.pais_iso2 || 'VE').trim().toUpperCase();
      if (iso2 !== 'VE') return original(item);

      const estado = String(item?.estado || '').trim();
      const municipio = String(item?.municipio || '').trim();

      const exactaCurada = typeof geodata !== 'undefined'
        ? geodata?.municipios?.[`${estado}_${municipio}`]
        : null;
      if (exactaCurada) return exactaCurada;

      const municipal = resolverMunicipio(estado, municipio);
      if (municipal) return municipal;

      return original(item);
    };

    return true;
  }

  function agregarAtribucion() {
    const panel = document.getElementById('map-legend-panel');
    if (!panel || panel.querySelector('[data-geo335-attribution]')) return;

    const nota = document.createElement('div');
    nota.dataset.geo335Attribution = 'true';
    nota.className = 'pt-1 mt-1 border-t border-slate-100 text-[8px] leading-snug text-slate-400';
    nota.innerHTML = '<i class="fa-solid fa-map-location-dot mr-1 text-movida-teal"></i>Venezuela: ubicación por municipio · coordenadas administrativas Open Admin Data (CC BY 4.0)';
    panel.appendChild(nota);
  }

  async function iniciar() {
    try {
      const cantidad = await cargarCatalogo();
      const instalado = instalarResolutor();
      agregarAtribucion();

      console.info(`[Movida SST] Georreferenciación municipal VE: ${cantidad} municipios cargados.`);

      if (instalado && typeof aplicarFiltrosGlobales === 'function') {
        setTimeout(() => {
          try {
            if (Array.isArray(globalData) && globalData.length) {
              aplicarFiltrosGlobales({ preservarVista: true });
            }
          } catch (error) {
            console.warn('No se pudo refrescar el mapa después de cargar municipios.', error);
          }
        }, 150);
      }
    } catch (error) {
      console.warn('[Movida SST] La georreferenciación municipal no pudo cargarse; se mantiene el respaldo por estado.', error);
    }
  }

  iniciar();
})();
