---
name: Point de vente — Beauty and Co
description: Desktop POS / back-office for a Dakar beauty salon, sharing the b&co showcase site's brand identity.
colors:
  rose-primary: "#fdcfca"
  rose-primary-2: "#eddcda"
  on-rose-primary: "#2d2d2d"
  taupe-emphasis: "#886666"
  rose-soft: "#fef0ee"
  lilac-tier: "#e4c8ff"
  cream-bg: "#f8f6f9"
  ink-900: "#101828"
  ink-600: "#475467"
  ink-500: "#667085"
  ink-400: "#98a2b3"
  border-200: "#eaecf0"
  surface-100: "#f2f4f7"
  success: "#12805c"
  warning: "#b5590a"
  info: "#2662d9"
  error: "#b42318"
typography:
  display:
    fontFamily: "Prata, Georgia, serif"
    fontWeight: 400
  accent:
    fontFamily: "Benedict, cursive"
  body:
    fontFamily: "Cabinet Grotesk, Arial, Helvetica, sans-serif"
    fontWeight: 450
rounded:
  control: "9999px"
  card: "16px"
  tile: "16px"
spacing:
  tap-target-min: "44px"
components:
  button-brand:
    backgroundColor: "{colors.rose-primary}"
    textColor: "#000000"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-dark:
    backgroundColor: "{colors.taupe-emphasis}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# Design System: Point de vente — Beauty and Co

## Overview

**Creative North Star: "The Salon Counter"**

A warm, flat, rose-and-taupe visual language borrowed wholesale from the b&co showcase site — this is back-office/operate software, not a marketing surface, so the brand shows up in precise, quiet details (a rose fill on the one action that matters, a taupe emphasis on the current state) rather than in expressive composition. Everything reads at a glance from across a counter, on a touchscreen, under normal indoor light, often mid-conversation with a client.

No gradients, no glass, no decorative depth — surfaces are flat fills at rest, only pill-shaped rounding softens the geometry. The one recurring signature motif is the sidebar's diamond glyph, used sparingly as a faint oversized watermark, never as a repeated icon.

**Key Characteristics:**
- Flat brand fills only — rose for primary/light actions, taupe for dark/emphasis states, no gradients anywhere.
- Fully rounded (pill) controls: buttons, pills, chips, avatars, category chips.
- Prata serif for every heading and hero number; Cabinet Grotesk for everything else.
- Real, varying-length French content (service names, prices, durations) — layouts must hold under real data, not placeholder-length text.
- Every primary interactive target sized and spaced for a touchscreen, not a mouse-only desktop app (44px minimum).

## Colors

Two brand hues carry every screen: a soft rose for primary/light actions and prices, a muted taupe for dark/emphasis states — never mixed as a gradient, always a flat fill.

### Primary
- **Rose Primary** (`#fdcfca`): filled CTAs, selected pills/tabs, price emphasis (paired with the darker `button-2-color` `#a27576` text tone for price figures specifically).

### Secondary
- **Taupe Emphasis** (`#886666`): dark CTA banners (e.g. "Nouvelle Vente"), active nav item, active category back-button, icon accents, borders on focus.

### Tertiary
- **Lilac Tier** (`#e4c8ff`): reserved for the VIP/premium tier badge and one quick-action tile — kept rare so it stays legible as "special."

### Neutral
- **Cream** (`#f8f6f9`): page/app background.
- **Rose Soft** (`#fef0ee`): secondary surface fill (secondary CTA, icon chip backgrounds).
- **Ink 900 → Ink 400** (`#101828` → `#98a2b3`): text hierarchy, darkest for headings/prices down to lightest for placeholder/disabled text.
- **Border 200** (`#eaecf0`): every card/input/divider border.

### Named Rules
**The Two-Hue Rule.** Every "emphasis" role on screen is either rose or taupe — never a third brand color. Semantic color (success/warning/info/error) is separate and never doubles as the accent.
**The Disabled-Is-Not-Invisible Rule.** A disabled control (the "Encaisser" CTA before a client is picked, an unfilled "OK") must stay legible — a muted solid fill with readable text, not a translucent wash over the brand color that erodes contrast to near-nothing.

## Typography

**Display Font:** Prata (serif, with Georgia fallback)
**Body Font:** Cabinet Grotesk (with Arial/Helvetica fallback)
**Accent Font:** Benedict (script, used only for the single "privé" tagline under the wordmark)

**Character:** A confident, slightly editorial serif for anything that announces itself (page titles, hero prices, greetings) against a plain, workmanlike grotesk for everything operational — the pairing reads as "boutique brand, efficient tool."

### Hierarchy
- **Display** (400, `text-2xl`–`text-3xl`, Prata): page titles, "Bonjour, Propriétaire", hero totals.
- **Title** (600, `text-lg`–`text-xl`, Cabinet Grotesk): section headers, card titles, cart item names.
- **Body** (450, `text-sm`–`text-[15px]`): everything operational — labels, descriptions, list content.
- **Label** (600–700, `text-xs`, uppercase, tracked): eyebrow captions ("REVENUS", "ADMIN"), stat headers.

### Named Rules
**The One Serif Rule.** Prata appears only at moments that deserve weight (titles, hero numbers) — never in body copy, buttons, or dense lists, where it would slow scanning.

## Layout

Desktop-only, no responsive/mobile variant. A fixed 260px sidebar (global nav + identity) plus a fluid content area, `max-w-6xl` centered, `px-8 py-8`. Density stays generous — this is a touch-first counter tool, not a data-dense dashboard: `gap-4`–`gap-6` between siblings, `p-5`–`p-8` internal card padding, never sub-8px gaps between distinct tappable elements.

## Elevation & Depth

Flat by default. The only shadow in the system is a barely-there ambient lift on cards and buttons (`0px 1px 3px rgba(0,0,0,0.06–0.1)`) — depth is conveyed through flat color fields and borders, not layered shadows.

### Named Rules
**The Flat-Fill Rule.** No gradients, no glass, no glow — a filled shape is one flat color, full stop.

## Shapes

Everything rounds toward a pill. Buttons, pills, chips, avatars, category chips: `rounded-full`. Cards and catalogue tiles: large soft corners (`rounded-2xl`/`16px`, some `rounded-3xl`/`24px` for hero-scale CTAs). Borders are a single hairline (`border border-[--color-gray-200]`), never doubled or dashed except the one deliberate "required field" dashed-border affordance (client picker).

## Components

### Buttons
- **Shape:** fully rounded (`rounded-full`), `px-4 py-3`, `text-[17px]` — a real touch target, not a compact desktop button.
- **Primary (`brand`):** rose fill, black text.
- **Dark (`dark`):** taupe fill, white text — used for the single most-frequent action on a screen (e.g. "Nouvelle Vente").
- **Disabled:** per the Disabled-Is-Not-Invisible Rule — do not ship the default `opacity-40` wash on a light fill without checking contrast; prefer a muted neutral fill for light-variant buttons when disabled.

### Chips / Pills
- **Style:** rounded-full, active = rose fill + black text, inactive = white + thin border + gray text.
- **State:** exclusive-choice segmented toggles (Services/Produits) and filter pills (subcategories) share this one visual language.

### Cards / Tiles
- **Corner style:** `16px` (`rounded-2xl`).
- **Background:** white on the cream page ground.
- **Border:** single hairline `--color-gray-200`.
- **Tap feedback:** every tappable card/tile gets `active:scale-[0.94–0.97]` — a touchscreen needs to feel a press register, hover alone is not enough.

### Inputs / Fields
- **Style:** white fill, hairline border, `rounded-lg`–`rounded-full` depending on context (form fields vs. search/select).
- **Focus:** border shifts to taupe emphasis, no glow/ring.

### Navigation
- **Sidebar:** fixed, white, active item = taupe-tinted pill fill + taupe text, inactive = gray text.
- **Back navigation:** a real button (icon + label, bordered, ≥44px tall) — never a bare text link with an inline chevron; that reads as decoration, not as a control, on a touchscreen.

## Do's and Don'ts

### Do:
- **Do** keep every primary/frequent tap target at 44px or larger, with visible press feedback (`active:scale`).
- **Do** let the cart/ticket total stay reachable at all times, however long the catalogue scroll gets.
- **Do** clamp long real-data text (service names) to a fixed number of lines rather than letting grid rows stretch unevenly.
- **Do** reuse the rose/taupe two-hue system for every new emphasis need before reaching for a third color.

### Don't:
- **Don't** introduce a gradient, drop shadow beyond the ambient lift, or glass/blur effect anywhere.
- **Don't** ship a disabled primary action at low enough contrast that it reads as broken rather than "not yet available."
- **Don't** rely on hover-only affordances — this is a touchscreen counter, not a mouse-driven desktop.
- **Don't** invent a new accent color for a single feature; VIP/premium is the only sanctioned use of lilac.
