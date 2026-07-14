// Tiny hash router: '#/quiz?table=3' → route '/quiz' + URLSearchParams.

const routes = new Map();

export function register(path, renderFn) {
  routes.set(path, renderFn);
}

export function navigate(path) {
  if (location.hash === `#${path}`) {
    // Same-hash navigation fires no hashchange; re-render explicitly
    // (used by the little/big home hop, which changes state, not route).
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  location.hash = `#${path}`;
}

export function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = hash.split('?');
  return { path, params: new URLSearchParams(query) };
}

export function startRouter(rootEl, ctx, guard) {
  const render = async () => {
    let { path, params } = currentRoute();
    const redirect = guard ? guard(path) : null;
    if (redirect && redirect !== path) {
      navigate(redirect);
      return;
    }
    const fn = routes.get(path) ?? routes.get('/home');
    rootEl.innerHTML = '';
    await fn(rootEl, params, ctx);
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', render);
  return render();
}
