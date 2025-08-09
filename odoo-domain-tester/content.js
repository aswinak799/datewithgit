// Minimal content script for Odoo Domain Builder & Tester

(function () {
  const STYLE_ID = "odoo-domain-tester-style";
  const PANEL_ID = "odoo-domain-tester-panel";

  function ensureStylesInjected() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${PANEL_ID} {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 420px;
  max-height: 70vh;
  background: #111827;
  color: #e5e7eb;
  border: 1px solid #374151;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  border-radius: 10px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#${PANEL_ID} .odt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: #0b1220;
  border-bottom: 1px solid #1f2937;
}
#${PANEL_ID} .odt-title { font-weight: 600; font-size: 14px; }
#${PANEL_ID} .odt-controls { display:flex; gap:6px; align-items:center; }
#${PANEL_ID} .odt-body { padding: 10px; display:flex; flex-direction:column; gap:8px; overflow:auto; }
#${PANEL_ID} select, #${PANEL_ID} input, #${PANEL_ID} textarea { width: 100%; background:#0f172a; color:#e5e7eb; border:1px solid #334155; border-radius:8px; padding:8px; font-size: 12px; }
#${PANEL_ID} button { background:#2563eb; color:white; border:none; border-radius:8px; padding:8px 10px; font-weight:600; cursor:pointer; }
#${PANEL_ID} button:disabled { opacity:0.5; cursor:not-allowed; }
#${PANEL_ID} .row { display:flex; gap:8px; }
#${PANEL_ID} .row > * { flex: 1; }
#${PANEL_ID} .muted { color:#94a3b8; font-size:12px; }
#${PANEL_ID} .result { background:#0b1220; border:1px solid #1f2937; border-radius:8px; padding:8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; }
#${PANEL_ID} .badge { background:#1f2937; padding:2px 6px; border-radius:6px; font-size:11px; }
#${PANEL_ID} .odt-footer { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-top:1px solid #1f2937; background:#0b1220; }
#${PANEL_ID} .link { color:#93c5fd; text-decoration:underline; cursor:pointer; }
#${PANEL_ID}.collapsed { height: 38px; width: 240px; }
`;
    document.head.appendChild(style);
  }

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const panel = document.createElement("div");
    panel.id = PANEL_ID;

    const header = document.createElement("div");
    header.className = "odt-header";
    const title = document.createElement("div");
    title.className = "odt-title";
    title.textContent = "Odoo Domain Tester";

    const controls = document.createElement("div");
    controls.className = "odt-controls";

    const collapseBtn = document.createElement("button");
    collapseBtn.textContent = "–";
    collapseBtn.title = "Collapse";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.title = "Close";

    controls.appendChild(collapseBtn);
    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);

    const body = document.createElement("div");
    body.className = "odt-body";

    // Model input with autocomplete
    const modelRow = document.createElement("div");
    modelRow.className = "row";
    const modelInput = document.createElement("input");
    modelInput.placeholder = "Model (e.g., res.partner)";
    modelInput.setAttribute("list", "odt-models");
    const modelDatalist = document.createElement("datalist");
    modelDatalist.id = "odt-models";
    modelRow.appendChild(modelInput);
    body.appendChild(modelRow);
    body.appendChild(modelDatalist);

    // Domain textarea
    const domainArea = document.createElement("textarea");
    domainArea.placeholder = "Domain in JSON or Odoo syntax. Example: [[\"is_company\", \"=\", true], [\"name\", \"ilike\", \"odoo\"]] or [('is_company','=',True)]";
    domainArea.rows = 5;
    body.appendChild(domainArea);

    // Row: limit + preview button
    const runRow = document.createElement("div");
    runRow.className = "row";
    const limitInput = document.createElement("input");
    limitInput.placeholder = "Limit (preview)";
    limitInput.type = "number";
    limitInput.value = "10";
    const runBtn = document.createElement("button");
    runBtn.textContent = "Evaluate";
    runRow.appendChild(limitInput);
    runRow.appendChild(runBtn);
    body.appendChild(runRow);

    // Badges
    const infoRow = document.createElement("div");
    infoRow.className = "row";
    const envBadge = document.createElement("div");
    envBadge.className = "badge";
    envBadge.textContent = location.host;
    const dbBadge = document.createElement("div");
    dbBadge.className = "badge";
    dbBadge.textContent = "db: ?";
    infoRow.appendChild(envBadge);
    infoRow.appendChild(dbBadge);
    body.appendChild(infoRow);

    // Results
    const countEl = document.createElement("div");
    countEl.className = "muted";
    countEl.textContent = "Count: –";
    const sqlHintEl = document.createElement("div");
    sqlHintEl.className = "muted";
    sqlHintEl.textContent = "SQL: –";
    const resultEl = document.createElement("pre");
    resultEl.className = "result";
    resultEl.textContent = "";

    body.appendChild(countEl);
    body.appendChild(sqlHintEl);
    body.appendChild(resultEl);

    const footer = document.createElement("div");
    footer.className = "odt-footer";
    const helper = document.createElement("div");
    helper.className = "muted";
    helper.textContent = "Tab: autocomplete fields, Shift+Enter: multiline, Ctrl+Enter: run";
    const toggleLink = document.createElement("div");
    toggleLink.className = "link";
    toggleLink.textContent = "Insert field…";
    footer.appendChild(helper);
    footer.appendChild(toggleLink);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);
    document.body.appendChild(panel);

    // Behavior
    collapseBtn.addEventListener("click", () => {
      panel.classList.toggle("collapsed");
    });
    closeBtn.addEventListener("click", () => panel.remove());

    function stringify(obj) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return String(obj);
      }
    }

    function parseDomain(text) {
      // Try JSON first
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) return json;
      } catch {}
      // Try Python-ish domain -> convert to JSON-ish
      try {
        // very loose conversion for common cases
        let t = text.trim();
        if (!t) return [];
        // Replace True/False/None
        t = t.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null");
        // Replace single quotes with double (careful but pragmatic)
        t = t.replace(/'/g, '"');
        // Ensure outer brackets
        if (!t.startsWith("[") && t.startsWith("(")) {
          t = "[" + t.slice(1, -1) + "]";
        }
        const json = JSON.parse(t);
        return json;
      } catch (e) {
        throw new Error("Unable to parse domain. Use JSON or [('field','op',value)].");
      }
    }

    function buildRPCPayload(model, method, args = [], kwargs = {}) {
      // Compatible with legacy web client call_kw
      return {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model,
          method,
          args,
          kwargs
        },
        id: Math.floor(Math.random() * 1e9)
      };
    }

    function guessOdooBase() {
      // Try detect from script tags or default to current origin
      return location.origin;
    }

    async function rpcCall(path, payload) {
      const url = guessOdooBase() + path;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error.data?.message || data.error.message || "RPC Error");
      return data.result;
    }

    async function fetchDbName() {
      try {
        const result = await rpcCall("/web/session/get_session_info", { jsonrpc: "2.0", method: "call", params: {}, id: 1 });
        return result?.db || "?";
      } catch {
        return "?";
      }
    }

    async function listModels() {
      try {
        const res = await rpcCall("/web/dataset/call_kw", buildRPCPayload("ir.model", "search_read", [[], ["model", "name"]], { limit: 5000 }));
        return res?.map(r => r.model).sort() || [];
      } catch (e) {
        return [];
      }
    }

    async function listFields(model) {
      try {
        const res = await rpcCall("/web/dataset/call_kw", buildRPCPayload(model, "fields_get", [], { attributes: ["string", "type", "relation", "store"] }));
        return res || {};
      } catch (e) {
        return {};
      }
    }

    function provideFieldAutocomplete(fields) {
      const names = Object.keys(fields || {}).sort();
      const uniqueWords = new Set(names);
      // Add operators and structure hints
      ["=", "!=", ">", ">=", "<", "<=", "in", "not in", "ilike", "like", "child_of"].forEach(op => uniqueWords.add(op));
      return Array.from(uniqueWords);
    }

    function insertAtCursor(textarea, snippet) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = textarea.value.slice(0, start);
      const after = textarea.value.slice(end);
      textarea.value = before + snippet + after;
      const pos = start + snippet.length;
      textarea.selectionStart = textarea.selectionEnd = pos;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function attachAutocomplete(textarea, candidatesProvider) {
      let listEl = null;
      let items = [];
      let index = -1;

      function close() {
        listEl?.remove();
        listEl = null; index = -1; items = [];
      }

      function open(x, y, width) {
        close();
        listEl = document.createElement("div");
        listEl.style.position = "fixed";
        listEl.style.left = x + "px";
        listEl.style.top = y + "px";
        listEl.style.width = width + "px";
        listEl.style.maxHeight = "240px";
        listEl.style.overflow = "auto";
        listEl.style.background = "#0b1220";
        listEl.style.border = "1px solid #1f2937";
        listEl.style.borderRadius = "8px";
        listEl.style.zIndex = 2147483647;
        document.body.appendChild(listEl);
      }

      function render() {
        if (!listEl) return;
        listEl.innerHTML = "";
        items.forEach((text, i) => {
          const item = document.createElement("div");
          item.textContent = text;
          item.style.padding = "6px 8px";
          item.style.cursor = "pointer";
          item.style.background = i === index ? "#111827" : "transparent";
          item.addEventListener("mouseenter", () => { index = i; render(); });
          item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            pick(i);
          });
          listEl.appendChild(item);
        });
      }

      function pick(i) {
        const choice = items[i];
        if (!choice) return;
        insertAtCursor(textarea, choice);
        close();
      }

      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const rect = textarea.getBoundingClientRect();
          const sel = textarea.selectionStart;
          const lineStart = textarea.value.lastIndexOf("\n", sel - 1) + 1;
          const prefix = textarea.value.slice(lineStart, sel).trim();
          const all = candidatesProvider();
          items = all.filter(w => w.startsWith(prefix) && w !== prefix).slice(0, 50);
          if (items.length === 0) return;
          if (!listEl) open(rect.left, rect.bottom, rect.width);
          index = 0;
          render();
        } else if (listEl && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          e.preventDefault();
          if (e.key === "ArrowDown") index = Math.min(items.length - 1, index + 1);
          else index = Math.max(0, index - 1);
          render();
        } else if (listEl && (e.key === "Enter")) {
          e.preventDefault();
          pick(index);
        } else if (e.key === "Escape") {
          close();
        } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          runBtn.click();
        }
      });

      textarea.addEventListener("blur", () => setTimeout(close, 150));
    }

    // Initialize
    (async () => {
      ensureStylesInjected();
      dbBadge.textContent = "db: " + (await fetchDbName());

      // Populate models
      const models = await listModels();
      modelDatalist.innerHTML = models.map(m => `<option value="${m}"></option>`).join("");

      let cachedFields = {};

      modelInput.addEventListener("change", async () => {
        const model = modelInput.value.trim();
        if (!model) return;
        const fields = await listFields(model);
        cachedFields = fields;
      });

      attachAutocomplete(domainArea, () => provideFieldAutocomplete(cachedFields));

      runBtn.addEventListener("click", async () => {
        const model = modelInput.value.trim();
        if (!model) {
          alert("Enter a model name");
          return;
        }
        let domain;
        try {
          domain = parseDomain(domainArea.value);
        } catch (e) {
          countEl.textContent = "Count: –";
          sqlHintEl.textContent = e.message;
          resultEl.textContent = "";
          return;
        }
        runBtn.disabled = true;
        countEl.textContent = "Counting…";
        sqlHintEl.textContent = "";
        resultEl.textContent = "";
        try {
          const limit = Math.max(0, parseInt(limitInput.value || "0", 10) || 0);
          const count = await rpcCall("/web/dataset/call_kw", buildRPCPayload(model, "search_count", [domain]));
          countEl.textContent = `Count: ${count}`;

          // Preview
          const records = await rpcCall("/web/dataset/call_kw", buildRPCPayload(model, "search_read", [domain, ["display_name"].concat(Object.keys(cachedFields).slice(0, 5))], { limit }));
          resultEl.textContent = stringify(records);

          // SQL hint - Odoo doesn't expose direct SQL, but we can hint simple cases
          sqlHintEl.textContent = `SQL hint: WHERE ${JSON.stringify(domain)}`;
        } catch (e) {
          countEl.textContent = "Count: error";
          sqlHintEl.textContent = e.message;
        } finally {
          runBtn.disabled = false;
        }
      });

      toggleLink.addEventListener("click", () => {
        const f = Object.keys(cachedFields);
        if (f.length === 0) return;
        insertAtCursor(domainArea, `['${f[0]}', '=', ]`);
      });
    })();
  }

  // Only inject on Odoo-like pages (heuristic)
  function isLikelyOdoo() {
    return (
      document.querySelector(".o_web_client, .o_webclient") ||
      /web/.test(location.pathname) ||
      (window.odoo && window.odoo.__DEBUG__ !== undefined)
    );
  }

  function hostAllowedByOptions(options) {
    const autoinject = options?.autoinject !== false;
    if (!autoinject) return false;
    const hosts = Array.isArray(options?.hosts) ? options.hosts : [];
    if (hosts.length === 0) return true; // no restriction
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
      // fallback: hostname suffix match
      const cleaned = h.replace(/^\*?\.?/, "");
      return host === cleaned || host.endsWith("." + cleaned);
    });
  }

  function boot() {
    if (!isLikelyOdoo()) return;
    try {
      chrome.storage.sync.get({ hosts: [], autoinject: true }, (opts) => {
        if (hostAllowedByOptions(opts)) {
          ensureStylesInjected();
          createPanel();
        }
      });
    } catch (e) {
      // If storage not available (very old/locked down), fallback to default
      ensureStylesInjected();
      createPanel();
    }
  }

  boot();
})();