# Odoo Domain Builder & Tester (Chrome Extension)

Build and test Odoo ORM domains directly on any Odoo page. Autocomplete fields, run `search_count` and preview records with `search_read`.

## Features
- Model autocomplete (reads from `ir.model`)
- Field autocomplete (reads from `fields_get`)
- Parse JSON or Python-like domain syntax
- Evaluate: `search_count` and preview with `search_read`
- Shows DB name and host badge
- Lightweight floating panel with collapse/close

## Install (Developer Mode)
1. Clone or copy this folder to your machine.
2. Open Chrome → `chrome://extensions`.
3. Enable "Developer mode" (top-right).
4. Click "Load unpacked" and select the `odoo-domain-tester` folder.
5. Open your Odoo site and the panel should appear automatically.

If it does not appear, check Options and/or that you are logged in to Odoo.

## Options
- Allowed hosts (whitelist). Leave empty to run on all hosts.
- Auto-inject on page load.

## Notes
- Calls Odoo JSON-RPC endpoints using current session cookies: `/web/session/get_session_info`, `/web/dataset/call_kw`.
- SQL translation is heuristic; Odoo does not expose SQL plans via RPC.
- Designed for Odoo 13–18. Some environments may restrict JSON-RPC endpoints.

## Privacy & Security
- No payloads are sent outside your browser. Data is kept in memory.
- Storage is used only for options (hosts, autoinject).

## Roadmap
- Field/operator suggestions by field type
- Saved snippets and sharing
- Domain formatter and linter
- Test as another user/company (where permitted)
- Error overlays for record rules/ACL failures