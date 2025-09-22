# AI Touchpoint Specs

## 1) Support assistant (FAQ + order status via RAG)

**Problem statement.** Users ask policy/FAQ questions and “where is my order?” in chat. Today, many simple queries reach human agents. We will ground answers strictly in the Policies/FAQ markdown and, when the user provides an order id/email, call the existing `order-status` API to return status, ETA, and next steps—reducing support contact rate while improving response time and consistency.

**Happy path (p95).**
1. User opens chat and asks a question (or “where is my order 1234…”).
2. Client sends message to /support/assist with session id and (optional) order id/email.
3. Backend runs intent + entity detection (simple rules + lightweight model).
4. If order intent and id present → call `GET /order-status/:id` (existing).
5. Retrieve top K FAQ/policy chunks (BM25 or embeddings) scoped to allowed collections.
6. Compose minimal grounded context (answerable snippets + order status JSON).
7. Generate answer with citations and clear next action (refund link, track link, etc.).
8. Cache response key on (normalized question, policy hash, order status ETag) for 24h.
9. Return answer; client renders with “Was this helpful?” and “Contact support” CTA.
10. Record analytics event (deflection, confidence, latency).

**Grounding & guardrails.**
- **Source of truth:** `docs/policies.md`, `docs/faq.md`, `order-status` API response.
- **Retrieval scope:** Only those files/collections; no open web.
- **Max context:** ≤800 tokens of snippets + ≤200 tokens of order JSON.
- **Refuse outside scope:** If not covered, reply with “I don’t have that info” and escalate option.

**Human-in-the-loop.**
- **Escalation triggers:** model confidence <0.5; detection of policy gaps; toxic/PII content; 2+ user rephrases without resolution.
- **UI surface:** “Contact support” button prefilled with conversation transcript.
- **Reviewer & SLA:** Tier-1 reviews flagged conversations within 4 business hours; weekly sampling 2% for QA.

**Latency budget (p95 ≤1200ms).**
- Intent/routing: 40ms
- Order-status API call: 300ms (timeouts 600ms; if timeout → fallback path)
- Retrieval (index + rank): 250ms
- Context assembly: 60ms
- Generation (Llama 3.1 8B Instruct, 200-250 token out): 400ms
- Post-processing (citations, templates): 60ms
- Network & overhead: 80ms  
**Total:** ~1,190ms  
**Cache strategy:** 30% hit expected (FAQ repeats); cache at edge by (normalized question + policy hash). Miss cost only.

**Error & fallback behavior.**
- Order API 4xx/5xx/timeout → return “We couldn’t fetch order status right now” + link to tracking email and offer hand-off.
- Retrieval empty → apologize + escalate.
- Generation failure → serve top policy snippet verbatim with link.

**PII handling.**
- Only the necessary fields (order id, last-4 of email/phone) leave the app.
- Redact raw email/phone in prompts; mask to `u***@d***.com`, `***-***-1234`.
- Logs store hashes for ids; no raw PII in application logs; secure vault for transient tokens.

**Success metrics.**
- **Product:** Deflection rate = (# solved without human) / (# conversations).  
- **Product:** First-response time p95 (ms).  
- **Business:** Support contact rate = (# human-handled tickets) / (# sessions).

**Feasibility note.** We have FAQs/Policies markdown and the `order-status` API today. Use a local retriever (BM25 or embeddings index) and an 8B instruct model via OpenRouter. Next prototype: build an offline indexer for policies, wire a thin /assist endpoint, and test with 20–50 golden questions.

---

## 2) Semantic typeahead for search suggestions

**Problem statement.** Users often type partial or colloquial terms that keyword prefix match misses (“coffe mug” vs “coffee cup”). We will produce semantic suggestions that map to categories/SKUs quickly, improving search success and product discovery.

**Happy path (p95).**
1. User types ≥2 characters in the search box (client debounced at 80ms).
2. Client calls `/search/suggest?q=...&sid=...`.
3. Backend normalizes/typo-corrects query.
4. Fetch top N candidates from Redis memory index (prefix + popularity).
5. (Miss/ambiguous) Run lightweight semantic rerank of 50–100 candidates.
6. Blend with business rules (in-stock, promoted categories).
7. Cache result by (q trigram, locale, index version) for 10 minutes.
8. Return 5–8 suggestions with destination URLs.
9. Log click/impression for offline CTR training.
10. If LLM unavailable → fallback to pure prefix suggestions.

**Grounding & guardrails.**
- **Source of truth:** Catalog titles, categories/tags (daily snapshot).
- **Retrieval scope:** Only our catalog index; no generative hallucinations allowed.
- **Max context:** ≤120 tokens input; ≤20 tokens output.
- **Refuse outside scope:** If non-shopping intent detected, show “Open help” chip instead of making things up.

**Human-in-the-loop.**
- Not required in real time. Merchandising admins review low-CTR queries weekly and pin suggestions if needed.

**Latency budget (p95 ≤300ms).**
- Frontend debounce: 80ms
- Redis candidate fetch: 50ms
- Semantic rerank (8B model or distilled cross-encoder): 120ms
- Blend/format: 25ms
- Network & overhead: 25ms  
**Total:** ~300ms  
**Cache strategy:** 70% hit expected on short, popular prefixes; CDN/edge cache on (q trigram, locale).

**Error & fallback behavior.**
- If semantic rerank fails, return prefix-only suggestions.
- If Redis/index miss, return trending searches list.

**PII handling.**
- Query text only; no PII required. Session id hashed client-side. No raw PII in logs.

**Success metrics.**
- **Product:** Suggest CTR = (# suggestion clicks) / (# suggest impressions).
- **Product:** Search success = (# sessions with product view after suggest click) / (# suggest click sessions).
- **Business:** Conversion uplift for sessions with suggest click vs. control (A/B).

**Feasibility note.** We have catalog metadata and can export to Redis for prefix search. For semantic rerank, start with a small cross-encoder or 8B instruct model with very short prompts. Next prototype: generate candidate sets offline, add rerank service, and A/B behind a feature flag.
