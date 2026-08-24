This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`, sharing its brand (Beauty and Co) with the [b&co](../b&co) showcase site.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result (or `http://localhost:3001` if `b&co`'s dev server is already running on 3000 — see `.claude/settings.local.json`).

## Structure

- `app/` — routes (App Router)
- `components/ui/` — shared design-system primitives, imported from b&co (button, dialog, switch, avatar, stepper, logo…)
- `components/layout/` — page chrome (header, footer, nav) — to be built for this app
- `lib/` — utilities and domain logic
- `public/images/brand/` — Beauty and Co logo assets
- `docs/adr/` — architecture decision records
- `.claude/skills/` — Claude Code skills for UX/UI design and frontend development (see below)

## Claude Code skills

Imported from `b&co` (same brand, same team) plus the official `webapp-testing` skill from [anthropics/skills](https://github.com/anthropics/skills):

- **Design & UX**: `frontend-design`, `bencium-controlled-ux-designer`, `impeccable`, `layers-*` (Layers of Product Design framework), `prototype`
- **Process**: `grill-with-docs`, `grill-me`, `handoff`, `token-efficiency`
- **Motion/3D** (kept for parity with b&co, likely lower priority for a POS UI): `gsap-*`, `threejs-webgl`, `react-three-fiber`, `web3d-integration-patterns`
- **Testing**: `webapp-testing` (Playwright-based frontend testing)
