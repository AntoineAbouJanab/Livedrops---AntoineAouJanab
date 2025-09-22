# AI Capability Map — ShopLite

> Spine: ShopLite (≈10k SKUs, ≈20k sessions/day). p95 targets: Typeahead ≤300ms; Support assistant ≤1200ms.

| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | 
|---|---|---|---|---:|---:|---|:---:|
| Support assistant (FAQ + order status RAG) | “Answer my question / check my order.” | FAQ/Policies .md, Order-Status API by id | 2 | 1200 | $0.08–$0.12 | Hand-off to human; canned templates | 
| Semantic typeahead for search suggestions | “Help me find products faster.” | SKU titles, tags, categories; Redis cache | 2 | 300 | $0.006–$0.010 | Fallback to keyword prefix | 
| Return-reason classifier (free text → policy bucket) | “I want to return this item.” | Historical reasons (seed list), policy text | 3 | 250 | $0.003–$0.006 | Default to generic flow | 
| PDP Q&A (retrieve answers from specs/reviews) | “Is this compatible with X?” | Product specs, Q&A snippets | 3 | 900 | $0.05–$0.10 | Link to specs section | 
| Catalog enrichment (offline, nightly) | “Cleaner facets/filters.” | Titles, specs CSV | 4 | n/a (batch) | $— (batch budgeted) | No enrichment | 

**Why these two.** Support assistant and semantic typeahead are nearest-term needle-movers with low integration risk. Support assistant should reduce support contact rate (deflection) and improve CSAT for order-status and FAQ intents using existing sources of truth. Typeahead should improve search success and product discovery, lifting conversion and reducing pogo-sticking. Both can meet the stated p95 targets with lightweight retrieval, aggressive caching, and clear fallbacks to existing non-AI paths.
