(() => {
  'use strict';

  const CORPORATE_URL = 'https://presupuesto.movidasst.com/';

  function installCorporateButton() {
    if (document.getElementById('corporateHeaderBtn')) return true;

    const headers = Array.from(document.querySelectorAll('body > header, header'));
    const header = headers.find((node) => node.querySelector('h1')?.textContent?.includes('La Movida SST Plus'));
    if (!header) return false;

    const actions = header.querySelector(':scope > div:last-child');
    if (!actions) return false;

    const link = document.createElement('a');
    link.id = 'corporateHeaderBtn';
    link.href = CORPORATE_URL;
    link.setAttribute('aria-label', 'Capacitación corporativa SST para empresas');
    link.title = 'Capacitación corporativa SST para empresas';
    link.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Empresas</span>
    `;

    link.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'gap:5px',
      'min-height:36px',
      'padding:7px 10px',
      'border-radius:12px',
      'background:linear-gradient(135deg,#00205b,#007b85)',
      'color:#fff',
      'font-family:Outfit,Arial,sans-serif',
      'font-size:11px',
      'font-weight:900',
      'line-height:1',
      'text-decoration:none',
      'white-space:nowrap',
      'box-shadow:0 7px 18px rgba(0,32,91,.20)',
      'border:1px solid rgba(255,255,255,.18)',
      'flex:0 0 auto'
    ].join(';');

    const svg = link.querySelector('svg');
    if (svg) {
      svg.style.width = '15px';
      svg.style.height = '15px';
      svg.style.flex = '0 0 auto';
    }

    const loading = actions.querySelector('#loading-indicator');
    if (loading) actions.insertBefore(link, loading);
    else actions.prepend(link);

    const style = document.createElement('style');
    style.id = 'corporateHeaderBtnStyles';
    style.textContent = `
      #corporateHeaderBtn { transition: transform .18s ease, box-shadow .18s ease, filter .18s ease; }
      #corporateHeaderBtn:active { transform: scale(.96); }
      @media (hover:hover) {
        #corporateHeaderBtn:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,32,91,.24); filter: brightness(1.04); }
      }
      @media (max-width: 380px) {
        #corporateHeaderBtn { padding: 7px 8px !important; font-size: 10px !important; gap: 4px !important; }
        #corporateHeaderBtn svg { width: 13px !important; height: 13px !important; }
      }
    `;
    document.head.appendChild(style);
    return true;
  }

  function boot() {
    if (installCorporateButton()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (installCorporateButton() || attempts >= 30) clearInterval(timer);
    }, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
