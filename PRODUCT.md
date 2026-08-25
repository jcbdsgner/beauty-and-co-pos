# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user of the caisse (POS) screens: a dedicated hostess/receptionist role at the salon counter — a fixed staff position, distinct from the practitioners (coiffeuses, esthéticiennes) who perform the services. She runs checkout for walk-ins and appointment clients throughout the day on a touchscreen desktop station at the counter.

## Product Purpose

Point de vente is the till/back-office app for Beauty and Co, a beauty salon brand (Almadies + Sea Plaza, Dakar). This screen (`/vente`, "Nouvelle Vente") is the core checkout flow: pick or scan a client, browse the real service catalogue, build a cart, apply promo/manager/loyalty discounts, take payment (Wave, Orange Money, Espèces, Carte — real Senegalese payment rails), and produce a receipt.

## Positioning

Internal operational tool, not a market-facing product — no competitive positioning applies. Its job is to make a busy, interruption-prone counter workflow fast and error-resistant.

## Operating Context

- Desktop-only by explicit decision — no mobile/responsive variant is planned or wanted.
- The counter station is touchscreen, not just mouse/keyboard, despite being desktop-sized — every primary interactive target must work as a tap, not rely on hover.
- A typical sale is a rich basket: 3+ prestations in one visit (e.g. coiffure + soin + manucure), often assigned to different practitioners each — the cart must stay legible with several lines, each carrying its own praticien assignment.
- Multiple concurrent sales can be open at once (sale tabs) — a receptionist may be serving more than one client's tab in parallel.
- Currency is FCFA (format: `12 345 F`, `Intl.NumberFormat("fr-FR")` grouping), not €.

## Capabilities and Constraints

- Real catalogue (imported from the b&co booking site, see `lib/data/vente.ts`): 107 prestations across 8 categories (Coiffure, Manucure/Pédicure, Onglerie, Spa & Massages, Soins Visage, Épilation, Mini & Co — Coiffure/Spa), each with name, price, duration, optional description, category + subcategory.
- Separate "Produits" tab (retail items) — currently mock data, no real source exists yet.
- Client identification: search/select from a client list, or scan a loyalty-card QR (camera-based; QR decoding itself is not wired to real payload data yet — a "simuler la détection" stand-in).
- Cart mechanics to preserve: per-line quantity, per-line practitioner assignment, promo code, manager discount code, loyalty-points redemption, running subtotal/discount/total, checkout requires a client to be selected.
- No backend — everything is local/in-memory fixture data (see `lib/data/vente.ts`).

## Brand Commitments

Same brand as the b&co showcase site — reuse its tokens (rose/taupe/cream palette, Prata display serif, Cabinet Grotesk body), fonts and logo rather than inventing a new visual identity. No gradients (existing convention: flat brand fills only).

## Evidence on Hand

- Real service catalogue with real prices/durations/descriptions: `lib/data/vente.ts` (ported from `b&co/lib/data/booking-services.ts`).
- Real client list with loyalty points/tiers: `lib/data/vente.ts` `CLIENTS`.
- Real payment methods (Wave, Orange Money, Espèces, Carte) and practitioner roster.
- No real "Produits" (retail) catalogue exists anywhere yet — do not fabricate one beyond what's already mocked.

## Product Principles

- Every primary action is a tap target, sized and spaced for a touchscreen counter, not a mouse-only desktop app.
- The cart's running total and checkout action stay reachable at all times, however long the catalogue browsing gets.
- A rich, multi-line, multi-practitioner basket is the normal case to design for, not the edge case.
- Real prestation data (names, prices, durations) varies a lot in length — layouts must hold up under that variance, not just under short placeholder names.
- Preserve all existing checkout mechanics (multi-sale tabs, discounts, loyalty, mixed payment) — this is a visual/interaction redesign, not a feature change.

## Accessibility & Inclusion

No formally required standard confirmed. Given the touchscreen counter context, treat comfortable tap-target size and high-contrast interactive states (including disabled states) as a functional requirement, not a nicety.
