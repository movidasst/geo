(() => {
  'use strict';

  const BADGES = [
    ['negociacion', 'Negociación SST', 'Acuerdos que protegen', 'negociacion.svg'],
    ['comunicacion_asertiva', 'Comunicación asertiva', 'Claridad con respeto', 'comunicacion-asertiva.svg'],
    ['liderazgo_preventivo', 'Liderazgo preventivo', 'Moviliza la prevención', 'liderazgo-preventivo.svg'],
    ['influencia_estrategica', 'Influencia estratégica', 'Conecta decisiones', 'influencia-estrategica.svg'],
    ['pensamiento_critico', 'Pensamiento crítico', 'Evidencia antes de actuar', 'pensamiento-critico.svg'],
    ['gestion_emocional', 'Gestión emocional', 'Equilibrio bajo presión', 'gestion-emocional.svg']
  ];

  function fechaLogro(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' }).format(date);
  }

  function render(item) {
    const profile = document.querySelector('#profile-sheet-content .participant-profile');
    if (!profile) return;
    profile.querySelector('[data-competency-badges]')?.remove();

    const earned = new Map(
      (Array.isArray(item?.insignias_competencias) ? item.insignias_competencias : [])
        .map(badge => [String(badge?.codigo || ''), badge])
    );
    const count = earned.size;
    const cards = BADGES.map(([code, title, phrase, file]) => {
      const badge = earned.get(code);
      const unlocked = Boolean(badge);
      const date = fechaLogro(badge?.obtenida_at);
      return `
        <article class="competency-badge-card ${unlocked ? 'is-earned' : 'is-locked'}" title="${unlocked ? `${title}: insignia obtenida` : `${title}: completa la ruta para desbloquearla`}">
          <div class="competency-badge-art">
            <img src="./assets/badges/${file}?v=20260920-sin-texto-v3" alt="Insignia ${title}" loading="lazy">
            ${unlocked ? '<span class="competency-badge-check" aria-label="Obtenida"><i class="fa-solid fa-check"></i></span>' : '<span class="competency-badge-lock" aria-label="Pendiente"><i class="fa-solid fa-lock"></i></span>'}
          </div>
          <h4>${title}</h4>
          <p>${unlocked ? phrase : 'Ruta pendiente'}</p>
          ${date ? `<time>${date}</time>` : ''}
        </article>`;
    }).join('');

    const section = document.createElement('section');
    section.dataset.competencyBadges = 'true';
    section.className = 'competency-badges-panel';
    section.innerHTML = `
      <div class="competency-badges-heading">
        <div><span>Desarrolla SST</span><h3>Insignias de competencias</h3></div>
        <strong>${count}/6</strong>
      </div>
      <p class="competency-badges-note">Cada insignia acredita que completó la ruta: Evalúa + Aprende + Practica + Mejora.</p>
      <div class="competency-badges-grid">${cards}</div>`;

    const activityPanel = Array.from(profile.children).find(el => el.textContent?.includes('Actividad en La Movida SST'));
    if (activityPanel) activityPanel.insertAdjacentElement('afterend', section);
    else profile.appendChild(section);
  }

  function install() {
    if (window.__movidaCompetencyBadgesInstalled || typeof window.abrirPerfil !== 'function') {
      if (!window.__movidaCompetencyBadgesInstalled) setTimeout(install, 80);
      return;
    }
    window.__movidaCompetencyBadgesInstalled = true;
    const original = window.abrirPerfil;
    window.abrirPerfil = function abrirPerfilConInsignias(itemStr, ...args) {
      const result = original.call(this, itemStr, ...args);
      try { render(JSON.parse(decodeURIComponent(itemStr))); }
      catch (error) { console.warn('[Movida SST] No se pudieron mostrar las insignias.', error); }
      return result;
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    #profile-sheet{overflow:hidden!important}
    #profile-sheet-content{flex:1 1 auto;min-height:0;overflow-y:auto!important;overflow-x:hidden;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding-bottom:calc(env(safe-area-inset-bottom) + 28px);scrollbar-gutter:stable}
    #profile-sheet-content .participant-profile{min-height:min-content}
    .competency-badges-panel{margin:0 0 20px;padding:16px;border:1px solid rgba(0,123,133,.18);border-radius:20px;background:linear-gradient(145deg,#f7ffff 0%,#fff 52%,#fff9e8 100%);box-shadow:0 10px 28px rgba(0,32,91,.07)}
    .competency-badges-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.competency-badges-heading span{display:block;font-size:9px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#007b85}.competency-badges-heading h3{margin:2px 0 0;font-size:15px;line-height:1.2;font-weight:900;color:#00205b}.competency-badges-heading strong{display:grid;place-items:center;min-width:46px;height:30px;border-radius:999px;background:#00205b;color:#fff;font-size:12px;box-shadow:0 5px 14px rgba(0,32,91,.2)}
    .competency-badges-note{margin:8px 0 13px;font-size:10px!important;line-height:1.45;color:#607486!important}.competency-badges-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.competency-badge-card{position:relative;min-width:0;padding:10px 7px 11px;text-align:center;border-radius:15px;border:1px solid #dce9eb;background:rgba(255,255,255,.9);transition:transform .2s ease,box-shadow .2s ease}.competency-badge-card.is-earned{border-color:rgba(0,123,133,.26);box-shadow:0 6px 16px rgba(0,123,133,.1)}.competency-badge-card.is-earned:active{transform:scale(.97)}
    .competency-badge-art{position:relative;width:76px;height:88px;margin:0 auto 6px}.competency-badge-art img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 5px 5px rgba(0,32,91,.18))}.competency-badge-card.is-locked .competency-badge-art img{filter:grayscale(1);opacity:.2}.competency-badge-check,.competency-badge-lock{position:absolute;right:-3px;bottom:1px;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:9px}.competency-badge-check{color:#fff;background:#70ad47;border:2px solid #fff;box-shadow:0 3px 8px rgba(50,100,30,.3)}.competency-badge-lock{color:#81909b;background:#edf2f4;border:2px solid #fff}
    .competency-badge-card h4{margin:0;font-size:10px;line-height:1.25;font-weight:900;color:#00205b;min-height:25px}.competency-badge-card p{margin:4px 0 0!important;font-size:8.5px!important;line-height:1.25!important;color:#667b89!important}.competency-badge-card time{display:block;margin-top:4px;font-size:7.5px;font-weight:800;text-transform:uppercase;color:#007b85}.competency-badge-card.is-locked h4{color:#71818c}
    @media(min-width:640px){.competency-badges-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.competency-badge-art{width:72px;height:84px}}
  `;
  document.head.appendChild(style);
  install();
})();
