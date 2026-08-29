(() => {
  'use strict';

  const ROUTE_TO_TAB = new Map([
    ['#/mapa', 'map-view'],
    ['#/metricas', 'dashboard-view'],
    ['#/informacion', 'info-view'],
    ['#/credencial', 'credencial-view']
  ]);

  const TAB_TO_ROUTE = new Map(
    Array.from(ROUTE_TO_TAB.entries(), ([route, tab]) => [tab, route])
  );

  let originalSwitchTab = null;
  let applyingRoute = false;
  let lastAppliedRoute = null;

  function normalizeRoute(hash = window.location.hash) {
    const route = String(hash || '').trim().toLowerCase();
    return ROUTE_TO_TAB.has(route) ? route : '#/mapa';
  }

  function routeUrl(route) {
    return `${window.location.pathname}${window.location.search}${route}`;
  }

  function applyRouteFromLocation({ replaceInvalid = false } = {}) {
    if (typeof originalSwitchTab !== 'function') return;

    const requested = String(window.location.hash || '').trim().toLowerCase();
    const route = normalizeRoute(requested);

    if (replaceInvalid && requested !== route) {
      window.history.replaceState({ movidaRoute: route }, '', routeUrl(route));
    }

    if (lastAppliedRoute === route) return;

    const tabId = ROUTE_TO_TAB.get(route);
    applyingRoute = true;
    try {
      originalSwitchTab(tabId);
      lastAppliedRoute = route;
    } finally {
      applyingRoute = false;
    }
  }

  function installRouter() {
    if (window.__movidaHashRouterInstalled) return;
    if (typeof window.switchTab !== 'function') {
      setTimeout(installRouter, 60);
      return;
    }

    window.__movidaHashRouterInstalled = true;
    originalSwitchTab = window.switchTab;

    window.switchTab = function routedSwitchTab(tabId, ...args) {
      const route = TAB_TO_ROUTE.get(tabId);

      if (!route || applyingRoute) {
        return originalSwitchTab.call(this, tabId, ...args);
      }

      if (window.location.hash !== route) {
        window.history.pushState({ movidaRoute: route }, '', routeUrl(route));
      }

      lastAppliedRoute = route;
      return originalSwitchTab.call(this, tabId, ...args);
    };

    window.addEventListener('popstate', () => {
      lastAppliedRoute = null;
      applyRouteFromLocation({ replaceInvalid: true });
    });

    window.addEventListener('hashchange', () => {
      const route = normalizeRoute();
      if (route === lastAppliedRoute) return;
      lastAppliedRoute = null;
      applyRouteFromLocation({ replaceInvalid: true });
    });

    applyRouteFromLocation({ replaceInvalid: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRouter, { once: true });
  } else {
    setTimeout(installRouter, 0);
  }
})();
