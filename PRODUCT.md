# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (and only) user: the **receptionist** at the salon counter — a fixed staff position; a practitioner may hold the post occasionally with the exact same rights (there is no second role, no "direction/admin" — see `docs/adr/0001`). She runs checkout all day on a touchscreen desktop station. Appointment clients booked online, came in, saw their practitioner, and reach her at the **end** of the visit to pay; walk-ins she rings up directly. Creating or reshaping appointments is a rare task for her — most bookings are made by clients themselves on a separate online platform.

## Product Purpose

Point de vente is the till app for Beauty and Co, a beauty salon brand (Almadies + Sea Plaza, Dakar). The core loop is checkout, run from the always-present Comptoir layer: pick or scan a client, browse the Menu (prestations + produits), build a cart, apply discounts, take payment (Wave, Orange Money, Espèces, Carte — real Senegalese payment rails), and produce a receipt. Discounts are three stacking mechanisms — loyalty points redeemed, a prepaid gift card, and a receptionist-granted discount (≤ 20 % of prestations, with a mandatory reason captured after payment). See `docs/adr/0002`–`0003`.

## Positioning

Internal operational tool, not a market-facing product — no competitive positioning applies. Its job is to make a busy, interruption-prone counter workflow fast and error-resistant.

## Operating Context

- Desktop-only by explicit decision — no mobile/responsive variant is planned or wanted.
- The counter station is touchscreen, not just mouse/keyboard, despite being desktop-sized — every primary interactive target must work as a tap, not rely on hover.
- A typical sale is a rich basket: 3+ prestations in one visit (e.g. coiffure + soin + manucure), often across several practitioners, sometimes for a friend or a child too — but **one payer settles the whole thing**. The cart must stay legible with several lines, some tagged with a beneficiary. Practitioner attribution on the Récap comes from the sale's origin **réservation**, split across its prestations by price. See `docs/adr/0006`.
- Multiple concurrent sales can be open at once (sale tabs) — a receptionist may be serving more than one client's tab in parallel.
- **Booking is out of scope for this app.** Appointments are made by clients on a separate online platform. The model here is **Réservation → atomic Rendez-vous** (one prestation, one beneficiary, one slot, one or two practitioners); several can run at the same time. Planning is a read view — Confirmer / Annuler / Encaisser only, no create/edit form. Relationship follow-up lives in its own **Relances** section (see `docs/adr/0004`).
- Currency is FCFA (format: `12 345 F`, `Intl.NumberFormat("fr-FR")` grouping), not €.

## Capabilities and Constraints

- Real catalogue, a verbatim mirror of the b&co booking catalogue (`b&co/lib/data/booking-services.ts` → `lib/data/menu.ts`): 107 prestations across 8 categories (Coiffure, Manucure/Pédicure, Onglerie, Spa & Massages, Soins Visage, Épilation, Mini&Co · Hair, Mini&Co · Spa), each with name, price, duration, category + subcategory, and a `twoPractitionersEligible` flag (shown as a "2" pill in the Menu).
- Separate "Produits" tab (retail items) — currently mock data, no real source exists yet.
- Client identification: search/select from a client list, or scan a loyalty-card QR (camera-based; QR decoding itself is not wired to real payload data yet — a "simuler la détection" stand-in).
- Cart mechanics to preserve: per-line quantity, promo code, manager discount code, loyalty-points redemption, running subtotal/discount/total, checkout requires a client to be selected.
- No backend — everything is local/in-memory fixture data (see `lib/data/vente.ts`).

## Brand Commitments

Same brand as the b&co showcase site — reuse its tokens (rose/taupe/cream palette, Cabinet Grotesk for both display and body — Prata retired, hierarchy carried by weight), fonts and logo rather than inventing a new visual identity. No gradients (existing convention: flat brand fills only).

## Evidence on Hand

- Real service catalogue with real prices/durations/descriptions: `lib/data/vente.ts` (ported from `b&co/lib/data/booking-services.ts`).
- Real client list with loyalty points/tiers: `lib/data/vente.ts` `CLIENTS`.
- Real payment methods (Wave, Orange Money, Espèces, Carte) and practitioner roster.
- No real "Produits" (retail) catalogue exists anywhere yet — do not fabricate one beyond what's already mocked.

## Product Principles

- Every primary action is a tap target, sized and spaced for a touchscreen counter, not a mouse-only desktop app.
- The cart's running total and checkout action stay reachable at all times, however long the catalogue browsing gets.
- A rich, multi-line basket is the normal case to design for, not the edge case.
- Real prestation data (names, prices, durations) varies a lot in length — layouts must hold up under that variance, not just under short placeholder names.
- Preserve all existing checkout mechanics (multi-sale tabs, discounts, loyalty, mixed payment) — this is a visual/interaction redesign, not a feature change.

## Accessibility & Inclusion

No formally required standard confirmed. Given the touchscreen counter context, treat comfortable tap-target size and high-contrast interactive states (including disabled states) as a functional requirement, not a nicety.
