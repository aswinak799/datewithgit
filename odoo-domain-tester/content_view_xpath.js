// Odoo View & XPath Inspector
(function () {
  const PANEL_ID = "odoo-xpath-inspector";
  const STYLE_ID = "odoo-xpath-inspector-style";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${PANEL_ID} { position: fixed; right: 16px; bottom: 16px; width: 480px; max-height: 70vh; z-index: 2147483647; background:#0b1220; color:#e5e7eb; border:1px solid #1f2937; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.4); display:flex; flex-direction:column; overflow:hidden; }
#${PANEL_ID} .header { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:#0a0f1a; border-bottom:1px solid #1f2937; }
#${PANEL_ID} .title { font-weight:600; font-size:14px; }
#${PANEL_ID} .body { padding:10px; display:flex; flex-direction:column; gap:8px; overflow:auto; }
#${PANEL_ID} .row { display:flex; gap:8px; }
#${PANEL_ID} select, #${PANEL_ID} input, #${PANEL_ID} textarea { width:100%; background:#0f172a; color:#e5e7eb; border:1px solid #334155; border-radius:8px; padding:8px; font-size:12px; }
#${PANEL_ID} button { background:#10b981; color:#0b1220; border:none; border-radius:8px; padding:8px 10px; font-weight:700; cursor:pointer; }
#${PANEL_ID} .muted { color:#94a3b8; font-size:12px; }
#${PANEL_ID} .list { border:1px solid #1f2937; border-radius:8px; overflow:hidden; }
#${PANEL_ID} .item { display:flex; justify-content:space-between; gap:8px; padding:6px 8px; border-bottom:1px solid #1f2937; }
#${PANEL_ID} .item:last-child { border-bottom:none; }
#${PANEL_ID} .badge { background:#1f2937; padding:2px 6px; border-radius:6px; font-size:11px; }
.highlight-odoo-xpath { outline: 2px solid #10b981 !important; outline-offset: 2px !important; }
`;
    document.head.appendChild(style);
  }

  function isLikelyOdoo() {
    return (
      document.querySelector(".o_web_client, .o_webclient") ||
      /web/.test(location.pathname) ||
      (window.odoo && window.odoo.__DEBUG__ !== undefined)
    );
  }

  function buildPanel() {
    if (document.getElementById(PANEL_ID)) return;
    const panel = document.createElement('div');
    panel.id = PANEL_ID;

    const header = document.createElement('div');
    header.className = 'header';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'View & XPath Inspector';
    const actions = document.createElement('div');
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.background = '#ef4444';
    closeBtn.style.color = 'white';
    actions.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'body';

    const info = document.createElement('div');
    info.className = 'muted';
    info.textContent = 'Shows current view, inheritance chain, and XPath suggestions.';

    const modelRow = document.createElement('div');
    modelRow.className = 'row';
    const modelInput = document.createElement('input');
    modelInput.placeholder = 'Model (auto if page has one)';
    modelRow.appendChild(modelInput);

    const viewTypeRow = document.createElement('div');
    viewTypeRow.className = 'row';
    const viewTypeSelect = document.createElement('select');
    ['form','tree','kanban','search','calendar','graph','pivot'].forEach(t => {
      const o = document.createElement('option');
      o.value = t; o.textContent = t; viewTypeSelect.appendChild(o);
    });
    viewTypeRow.appendChild(viewTypeSelect);

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load View Chain';

    const chainWrap = document.createElement('div');
    chainWrap.className = 'list';

    const xpathInput = document.createElement('input');
    xpathInput.placeholder = "XPath to test (e.g., //field[@name='name'])";

    const testBtn = document.createElement('button');
    testBtn.textContent = 'Highlight XPath';

    const suggestionsWrap = document.createElement('div');
    suggestionsWrap.className = 'list';

    body.appendChild(info);
    body.appendChild(modelRow);
    body.appendChild(viewTypeRow);
    body.appendChild(loadBtn);
    body.appendChild(chainWrap);
    body.appendChild(xpathInput);
    body.appendChild(testBtn);
    body.appendChild(suggestionsWrap);

    panel.appendChild(header);
    panel.appendChild(body);
    document.body.appendChild(panel);

    closeBtn.addEventListener('click', () => panel.remove());

    function rpcPayload(model, method, args = [], kwargs = {}) {
      return { jsonrpc: '2.0', method: 'call', params: { model, method, args, kwargs }, id: Math.floor(Math.random()*1e9) };
    }
    async function rpc(path, payload) {
      const res = await fetch(location.origin + path, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error.data?.message || data.error.message);
      return data.result;
    }

    function detectModelFromUI() {
      // Heuristic: look for data-model attributes in odoo webclient
      const el = document.querySelector('[data-model], .o_form_view');
      const model = el?.getAttribute?.('data-model');
      return model || '';
    }

    async function loadViewArch(model, view_type) {
      // Resolve base view via fields_view_get, then build inheritance chain via ir.ui.view
      const base = await rpc('/web/dataset/call_kw', rpcPayload(model, 'fields_view_get', [], { view_type }));
      let baseId = null;
      if (Array.isArray(base?.view_id)) baseId = base.view_id[0];
      else if (typeof base?.view_id === 'number') baseId = base.view_id;

      // Read all active views for model/type
      const views = await rpc('/web/dataset/call_kw', {
        jsonrpc: '2.0', method: 'call', params: {
          model: 'ir.ui.view', method: 'search_read',
          args: [[['model', '=', model], ['type', '=', view_type], ['active', '=', true]]],
          kwargs: { fields: ['name','type','inherit_id','priority','key'] }
        }, id: Math.floor(Math.random()*1e9)
      });

      // Build chain from base outward
      if (!baseId) {
        const candidates = views.filter(v => !v.inherit_id || !v.inherit_id[0]);
        if (candidates.length > 0) {
          candidates.sort((a,b) => (a.priority||16) - (b.priority||16));
          baseId = candidates[0].id;
        }
      }
      const byId = new Map(views.map(v => [v.id, v]));
      const chainIds = [];
      const queue = [];
      if (baseId) queue.push(baseId);
      const seen = new Set();
      while (queue.length) {
        const id = queue.shift();
        if (seen.has(id)) continue;
        seen.add(id);
        if (id !== baseId) chainIds.push(id);
        for (const v of views) {
          const inh = v.inherit_id && v.inherit_id[0];
          if (inh === id) queue.push(v.id);
        }
      }

      // External IDs for module ownership
      const allIds = [baseId, ...chainIds].filter(Boolean);
      let xmlidMap = {};
      if (allIds.length) {
        xmlidMap = await rpc('/web/dataset/call_kw', {
          jsonrpc: '2.0', method: 'call', params: {
            model: 'ir.ui.view', method: 'get_external_id',
            args: [allIds], kwargs: {}
          }, id: Math.floor(Math.random()*1e9)
        });
      }

      const chain = chainIds.map(id => {
        const v = byId.get(id);
        const xmlid = xmlidMap?.[id] || '';
        const module = xmlid && xmlid.includes('.') ? xmlid.split('.')[0] : '';
        return { id: v.id, name: v.name, inherit_id: v.inherit_id, key: v.key, priority: v.priority, xmlid, module };
      });

      return { base, baseId, chain, baseXmlId: xmlidMap?.[baseId] || '' };
    }

    function renderChain(base, chain, baseXmlId) {
      chainWrap.innerHTML = '';
      const baseItem = document.createElement('div');
      baseItem.className = 'item';
      const baseXml = baseXmlId || '';
      const baseModule = baseXml && baseXml.includes('.') ? baseXml.split('.')[0] : '';
      baseItem.innerHTML = `<div><strong>Base View</strong> <span class="badge">${base?.name || ''}</span> <span class="badge">${base?.view_id || ''}</span> ${baseModule ? `<span class="badge">${baseModule}</span>`:''} ${baseXml ? `<span class="badge">${baseXml}</span>`:''}</div>
      <div>${baseXml ? `<button data-copy="${baseXml}">Copy XMLID</button>`:''}</div>`;
      chainWrap.appendChild(baseItem);
      chain.forEach(v => {
        const item = document.createElement('div');
        item.className = 'item';
        const inh = v.inherit_id?.[1] || '';
        const meta = [inh, v.key, v.priority != null ? `prio:${v.priority}`:''].filter(Boolean).map(x=>`<span class="badge">${x}</span>`).join(' ');
        const moduleBadge = v.module ? `<span class=\"badge\">${v.module}</span>` : '';
        const xmlidBadge = v.xmlid ? `<span class=\"badge\">${v.xmlid}</span>` : '';
        item.innerHTML = `<div>${v.name || 'Inherited'} ${moduleBadge} ${xmlidBadge} ${meta}</div>
          <div>${v.xmlid ? `<button data-copy="${v.xmlid}">Copy XMLID</button>`:''}</div>`;
        chainWrap.appendChild(item);
      });
      chainWrap.querySelectorAll('button[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.getAttribute('data-copy') || '';
          navigator.clipboard?.writeText(t);
        });
      });
    }

    function highlightByXPath(xpath) {
      // Only client-side XPath to DOM. Not XML of view. Useful to debug selectors in web client tree/form
      try {
        // remove previous highlights
        document.querySelectorAll('.highlight-odoo-xpath').forEach(e => e.classList.remove('highlight-odoo-xpath'));
        const xres = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < xres.snapshotLength; i++) {
          const node = xres.snapshotItem(i);
          if (node instanceof HTMLElement) node.classList.add('highlight-odoo-xpath');
        }
      } catch (e) {
        console.warn('XPath eval error', e);
      }
    }

    function suggestStableXPaths(baseArch) {
      // Very rough suggestions: fields and buttons by name/string attrs
      const xml = baseArch?.arch;
      if (!xml || typeof xml !== 'string') return [];
      const suggestions = [];
      const fieldRegex = /<field[^>]*name=["']([^"']+)["'][^>]*>/g; let m;
      while ((m = fieldRegex.exec(xml))) {
        const name = m[1];
        suggestions.push({ label: `field[@name='${name}']`, xpath: `//field[@name='${name}']` });
      }
      const buttonRegex = /<button[^>]*name=["']([^"']+)["'][^>]*>/g;
      while ((m = buttonRegex.exec(xml))) {
        const name = m[1];
        suggestions.push({ label: `button[@name='${name}']`, xpath: `//button[@name='${name}']` });
      }
      return suggestions.slice(0, 100);
    }

    async function onLoad() {
      const model = (modelInput.value || detectModelFromUI() || '').trim();
      if (!model) { alert('Model not found. Enter a model.'); return; }
      const view_type = viewTypeSelect.value || 'form';
      try {
        const { base, chain, baseXmlId } = await loadViewArch(model, view_type);
        renderChain(base, chain, baseXmlId);
        // Suggestions from base arch
        const sugg = suggestStableXPaths(base);
        suggestionsWrap.innerHTML = '';
        sugg.forEach(s => {
          const item = document.createElement('div');
          item.className = 'item';
          item.innerHTML = `<div>//${s.label}</div><div><button data-xpath="${s.xpath}">Copy</button></div>`;
          suggestionsWrap.appendChild(item);
        });
        suggestionsWrap.querySelectorAll('button[data-xpath]').forEach(btn => {
          btn.addEventListener('click', () => {
            const xp = btn.getAttribute('data-xpath') || '';
            navigator.clipboard?.writeText(xp);
          });
        });
      } catch (e) {
        chainWrap.innerHTML = `<div class="muted">Error: ${e.message}</div>`;
      }
    }

    loadBtn.addEventListener('click', onLoad);
    testBtn.addEventListener('click', () => highlightByXPath(xpathInput.value));
  }

  function hostAllowed(options) {
    const autoinject = options?.autoinject !== false;
    if (!autoinject) return false;
    const hosts = Array.isArray(options?.hosts) ? options.hosts : [];
    if (hosts.length === 0) return true;
    const origin = location.origin;
    const host = location.host;
    return hosts.some((entry) => {
      const h = String(entry).trim();
      if (!h) return false;
      try {
        if (/^https?:\/\//i.test(h)) {
          const u = new URL(h);
          return origin.startsWith(u.origin);
        }
      } catch {}
      const cleaned = h.replace(/^\*?\.?/, "");
      return host === cleaned || host.endsWith("." + cleaned);
    });
  }

  function boot() {
    if (!isLikelyOdoo()) return;
    try {
      chrome.storage.sync.get({ hosts: [], autoinject: true }, (opts) => {
        if (hostAllowed(opts)) {
          ensureStyles();
          buildPanel();
        }
      });
    } catch (e) {
      ensureStyles();
      buildPanel();
    }
  }

  boot();
})();