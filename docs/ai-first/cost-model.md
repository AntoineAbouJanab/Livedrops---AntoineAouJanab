# Cost Model (Realistic with RAG)

We assume **Llama 3.1 8B Instruct via OpenRouter** unless noted:  
- **$0.05 / 1K prompt tokens**  
- **$0.20 / 1K completion tokens**  

Cache hit rate is applied to daily totals.  
All support assistant queries involve **RAG retrieval**, which increases input size.

---

## A) Support Assistant (FAQ + Order Status via RAG)

### Assumptions
- Model: Llama 3.1 8B Instruct  
- Avg prompt (tokens in):  
  - Question text ≈ 50  
  - System/template ≈ 150  
  - Retrieved context (3–5 chunks, 120–150 tokens each) ≈ 500–700  
  - Order JSON snippet ≈ 100  
  - **Total ≈ 900–1,000 tokens**
- Avg completion (tokens out): 200–250 (answers + citations)  
- Requests/day: 1,000  
- Cache hit rate: 30%

### Calculation
Cost/action = (950/1000 * 0.05) + (225/1000 * 0.20)  
= 0.0475 + 0.045 = **$0.0925 ≈ $0.093/action**

Daily cost = 1,000 × (1 – 0.30) × $0.093  
= 700 × $0.093 = **$65.10/day**

### Notes
- RAG overhead nearly doubles input size compared to a no-retrieval assistant.  
- Costs can be reduced by limiting context to **top-3 chunks** and trimming order JSON.  

---

## B) Semantic Typeahead (Search Suggestions)

### Assumptions
- Model: Llama 3.1 8B Instruct (or distilled reranker model for prod)  
- Avg prompt (tokens in):  
  - User prefix ≈ 20  
  - Candidate list (50 items × ~3 tokens each) ≈ 150  
  - System/template ≈ 50  
  - **Total ≈ 220 tokens**
- Avg completion (tokens out): 40–50 (ranked list with labels/URLs)  
- Requests/day: 50,000  
- Cache hit rate: 70%

### Calculation
Cost/action = (220/1000 * 0.05) + (45/1000 * 0.20)  
= 0.011 + 0.009 = **$0.020/action**

Daily cost = 50,000 × (1 – 0.70) × $0.020  
= 15,000 × $0.020 = **$300/day**

### Notes
- Cache at edge/CDN can cut cost dramatically since head queries repeat heavily.  
- For production, replace full LLM rerank with **mini cross-encoder** to drop cost by >80%.  

---

## Summary Table

| Touchpoint          | Tokens In | Tokens Out | Cost/Action | Daily Volume | Cache Hit | Daily Cost |
|---------------------|-----------|------------|-------------|--------------|-----------|------------|
| Support assistant   | ~950      | ~225       | $0.093      | 1,000        | 30%       | $65.10     |
| Typeahead reranker  | ~220      | ~45        | $0.020      | 50,000       | 70%       | $300.00    |

---

## Cost Levers

- **Support assistant**  
  - Trim retrieval context to ≤500 tokens.  
  - Cache common FAQ questions for 24h.  
  - Use smaller response caps (≤150 tokens).  
  - FAQ-only path can use a distilled model.  

- **Typeahead**  
  - Route popular prefixes to prefix-only cache.  
  - Distill reranker to **tiny cross-encoder** (non-LLM).  
  - Increase cache TTL to 30m–1h for hot queries.  

---
