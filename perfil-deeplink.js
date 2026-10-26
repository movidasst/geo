/* Enlace de perfil público desde Ranking SST.
 * Complemento de lectura: no cambia datos, mapa, filtros ni credenciales. */
(() => {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  const target = String(params.get('perfil') || '').trim();
  if (!target || target.length > 180) return;

  const requestedPhoto = String(params.get('foto') || '').trim();
  if (requestedPhoto && !/^[A-Za-z0-9_-]{10,160}$/.test(requestedPhoto)) return;

  const normal = value => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim().toLocaleLowerCase('es');

  const driveId = raw => {
    try {
      const url = new URL(String(raw || ''));
      if (!['drive.google.com','docs.google.com','lh3.googleusercontent.com'].includes(url.hostname)) return '';
      if (url.hostname === 'lh3.googleusercontent.com') {
        return url.pathname.match(/^\/d\/([A-Za-z0-9_-]+)/)?.[1] || '';
      }
      return url.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
        url.searchParams.get('id') || '';
    } catch { return ''; }
  };

  let finished = false;
  function openRequestedProfile() {
    if (finished) return true;
    // Esperar a que el Directorio haya cargado los perfiles y haya preparado su mapa.
    if (typeof globalData === 'undefined' || !Array.isArray(globalData) || !globalData.length ||
        typeof abrirPerfil !== 'function' || typeof map === 'undefined' || !map ||
        typeof map.setView !== 'function' || !document.getElementById('profile-sheet')) return false;
    finished = true;

    const matches = globalData.filter(person => normal(person._nombre_completo) === normal(target));
    const matched = requestedPhoto
      ? matches.filter(person => driveId(person.foto_url || person.foto) === requestedPhoto)
      : matches;
    const selected = matched.length === 1 ? matched[0] : matches.length === 1 ? matches[0] : null;
    if (selected) {
      try {
        if (typeof switchTab === 'function') switchTab('map-view');
        abrirPerfil(encodeURIComponent(JSON.stringify(selected)));
      } catch (error) {
        console.warn('No se pudo abrir el perfil enlazado:', error);
      }
      return true;
    }

    // Ante coincidencias ambiguas, ofrecer la búsqueda sin mostrar un perfil ajeno.
    const search = document.getElementById('filtro-nombre');
    if (search) {
      if (typeof switchTab === 'function') switchTab('map-view');
      search.value = target;
      if (typeof buscarNombreLive === 'function') buscarNombreLive(target);
    }
    return true;
  }

  let attempts = 0;
  const handle = window.setInterval(() => {
    attempts += 1;
    if (openRequestedProfile() || attempts >= 180) window.clearInterval(handle);
  }, 200);
  openRequestedProfile();
})();
