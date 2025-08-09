# Odoo Tools: Domain Tester + View/XPath Inspector

Two developer tools injected on Odoo pages:
- Domain Builder & Tester: build/test ORM domains live
- View & XPath Inspector: inspect views, inheritance chain, and craft stable XPath selectors

## Features

### Domain Builder & Tester
- Model autocomplete (reads from `ir.model`)
- Field autocomplete (reads from `fields_get`)
- Parse JSON or Python-like domain syntax
- Evaluate: `search_count` and preview with `search_read`
- Shows DB name and host badge

### View & XPath Inspector
- Detect model from current page (heuristic) or enter manually
- Fetch base view arch for a type (`form`, `tree`, `kanban`, ...)
- Show base view meta; placeholder for inheritance chain (future: resolved chain)
- XPath tester to highlight matching elements in the UI
- Quick suggestions for stable XPath by `field[@name]` and `button[@name]`

## Install (Developer Mode)
1. Open Chrome → `chrome://extensions`.
2. Enable "Developer mode" (top-right).
3. Click "Load unpacked" and select the `odoo-domain-tester` folder.
4. Open your Odoo site; panels appear automatically if host is allowed and you are logged in.

## Options
- Allowed hosts (whitelist). Leave empty to run on all hosts.
- Auto-inject on page load.

## Notes
- Uses Odoo JSON-RPC endpoints with current session cookies.
- View chain resolution for inherited views is basic in this MVP; future versions will use `ir.ui.view` introspection.
- SQL hints in Domain Tester are heuristic; Odoo doesn't expose SQL plans.

## Roadmap
- Resolve inheritance chain using `ir.ui.view` and show module ownership
- Suggest resilient XPaths based on multiple attributes and positions
- Copy-ready XPath snippets for Studio and XML inherits
- Domain formatter/linter and saved snippets