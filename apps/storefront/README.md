Storefront v1

Run instructions

- install: `pnpm install` (or `npm install`)
- dev: `pnpm dev` (or `npm run dev`)
- build: `pnpm build` (or `npm run build`)
- test: `pnpm test` (or `npm run test`)
- storybook: `pnpm storybook` (or `npm run storybook`)

Notes

- Uses Vite + React + TypeScript + Tailwind.
- Mock data under `public/mock-catalog.json`.
- Routes: `#/`, `#/p/:id`, `#/cart`, `#/checkout`, `#/order/:id`.
- Ask Support answers from `src/assistant/ground-truth.json` and order status only.
- No secrets are stored; if using a live model later, add keys to `.env` and reference `.env.example`.

