---
name: Point de vente — Beauty and Co
description: Desktop touch POS for a Dakar beauty salon. Visual world "Le Tableau" — a self-ranking day board, not a scroll of cards. Brand palette, Cabinet Grotesk and logo carried over from the b&co showcase site.
colors:
  rose: "#fdcfca"          # the actionable plaque, filled primary actions, price emphasis
  taupe: "#886666"         # the current / emphasis plaque, active nav, dark CTA
  cream: "#f8f6f9"         # app ground (the wall the boards hang on)
  slate: "#2a2320"         # the standing board header (warm near-black, derived from taupe)
  slate-line: "#4a3f3a"    # routed-groove hairline on the slate header
  amber: "#b5590a"         # THE one signal — changed / now / needs a decision. Nothing else uses it.
  amber-soft: "#fdf0e3"
  rose-soft: "#fef0ee"     # secondary plaque fill, chip wells
  lilac: "#e4c8ff"         # VIP/premium tier flag only — kept rare
  ink-900: "#101828"
  ink-600: "#475467"
  ink-500: "#667085"
  ink-400: "#98a2b3"
  groove: "#e4e0e2"        # the routed double-hairline that frames every plaque
  success: "#12805c"
  warning: "#b5590a"
  info: "#2662d9"
  error: "#b42318"
typography:
  face: "Cabinet Grotesk, Arial, Helvetica, sans-serif"  # the whole app — display and body
  accent: "Benedict, cursive"                            # the wordmark tagline only
  legend: "Cabinet Grotesk — 700, uppercase, tracking 0.12em"  # every board legend / lane label
  figure: "Cabinet Grotesk — 600, tabular-nums"               # every time, count, total, points
rounded:
  plaque: "14px"   # boards and lanes — squarer than the old 16–24px, a board is not a pillow
  chip: "6px"      # the flip-tile status token — a mechanical tile, never a pill
  control: "9999px" # buttons and filter pills stay pills — they are things you press
spacing:
  tap-target-min: "56px"
  tap-target-ideal: "60px"
  lane-height: "56px"      # a lane is a real touch row
---

# Design System — Point de vente · « Le Tableau »

## Direction contract

**THESIS.** A salon counter answers one question all day — *qui, quand, quoi ensuite*. So every
section is **a board that ranks itself by time and holds each row until it has been dealt with**,
not a scroll of soft cards. This refuses the two defaults this kind of app always ships: the warm
cream-ground / rounded-card / one-accent consumer app, and the dark dashboard with a neon accent.

**OWN-WORLD.** Painted directory-board plaques hung on the cream wall. Each content region is a
flat plaque — **rose** when it holds something to act on, **taupe** when it holds the current
state, **slate** (`#2a2320`) for the one standing board header per screen — framed by a *routed
groove* (a `groove`-colour double hairline with 1px of inset, drawn with `box-shadow`, never a
raised shadow). Down the left of every board runs a **legend rail**: hours, letters, or names set
in `legend` type (700, uppercase, `0.12em` tracking). Rows are **lanes** on hairline rules,
`lane-height` tall. State is a **flip-chip** — a small `chip`-radius tabular tile (`PRÊT`,
`ENVOYÉ`, `EN COURS`, `CONFIRMÉ`, `ANNULÉ`, `ABSENTE`, `TENDANCE`) that does one 140ms mechanical
half-flip on change; it never relies on colour alone. **One signal colour: `amber`.** It marks
*changed / now / needs you* — the lane pulses amber once, then holds a 3px amber left-edge until
acknowledged. Figures (time, count, total, points) are always `figure` type with `tabular-nums`
so columns align as the eye sweeps. Cabinet Grotesk everywhere; the board feel comes from the
tracked legends, the big tabular figures and the flip-chips, not from a second face. Benedict
only under the wordmark.

**STORY.** The receptionist glances at any section and reads the queue instantly: what's next,
what changed since she last looked, what still needs a decision. She acts on the lane itself; the
board reflows in place; the chip flips; the amber edge clears.

**FIRST VIEWPORT (Planning).** The standing slate board header — section name, live day in full,
`AUJOURD'HUI` reset. No create button: bookings are made online (ADR 0006); the board is read +
counter gestures (Confirmer / Annuler / Encaisser). Under it the week strip of day tiles. Then the
day board: a roster rail on the left, practitioner lanes, one lane per *rendez-vous* (an atomic
planned prestation — a two-practitioner one shows on both lanes), each carrying its flip-chip.
Nothing bleeds to the window edge — the board always has its frame.

**FORM.** Departures / peg-board directory board, fused with the gate-board grammar "a row
reranks in place and holds its change state until noticed." concept-seed key `5a6bc1b7`, mode
operate, assigned grounded direction #7 (the least-nostalgic of the salon-world set — chosen over
the appointment-ledger and the index-card file precisely because a board reads as *infrastructure*,
which is what an interruption-prone till needs). Image-generation step skipped under the size of
this refonte (4 sections, full re-implementation); the build is the proof.

## Migration status

The world is established on **Planning, Clientèle, Relances, Catalogue** and their sub-screens
(Équipe, Fiche cliente, Carte de fidélité, Détail planche) plus the board primitives in
`components/ui/board.tsx`. `Accueil`, the `Comptoir` layer, `/compte` and `Récap des ventes`
still wear the previous flat-card language and migrate next. Shared atoms (`Button`, `Field`,
`Dialog`, `Toast`, `ConfirmDialog`, `EmptyState`, form inputs) are used by both worlds and were
kept working; where the board world needed its own shape it got a board primitive rather than a
destructive edit to a shared atom.

## Colours

**Two brand hues carry structure, one signal colour carries attention, everything else is ink.**

- **Rose `#fdcfca`** — the *actionable* plaque background at low tint (`rose-soft` for the fill,
  rose at full for a filled primary button and for price figures with the `#a27576` price tone).
  A rose plaque means "there is something to do here".
- **Taupe `#886666`** — the *current-state* plaque, the active nav item, the one dark CTA per
  screen, legend-rail text on light, icon accents. A taupe plaque means "this is where things
  stand".
- **Slate `#2a2320`** — the standing board header only. One per screen. White text, `slate-line`
  groove. It is the board's own frame, not a hero banner.
- **Amber `#b5590a`** — **the** signal. Changed row, "now" marker, a decision still owed
  (unauthorised reconquête, absent practitioner, a just-created follow-up). Pulse once, then hold
  a 3px left-edge on the lane. Never used decoratively, never as a third structural hue. Semantic
  `warning` happens to be the same value — that is deliberate: on this board, "warning" and
  "needs you" are the same idea.
- **Lilac `#e4c8ff`** — VIP/gold tier flag only.
- **Ink 900 → 400** — text hierarchy. `groove #e4e0e2` — every plaque frame and lane rule.
- Semantic `success / info / error` stay conventional and never double as a structural hue.

### Named rules

- **The Board-Not-Card rule.** A content region is a *plaque with a routed groove and a legend*,
  not a rounded white card floating on shadow. `rounded-plaque` (14px), `box-shadow` groove
  (inset hairline), no ambient lift. If it would read as a Material card, it is wrong.
- **The One-Signal rule.** Only amber says "attention". If a second colour starts meaning
  "look here", the board has lost its single channel and the receptionist has to decode a legend.
- **The Chip-Flips rule.** Every status change animates one 140ms half-flip on the flip-chip and,
  if it is a change the receptionist should notice, an amber pulse + held edge on the lane.
  `prefers-reduced-motion` → instant swap, edge still held.
- **The Disabled-Is-Not-Invisible rule** (carried over). A disabled control is a legible muted
  solid fill with readable text, never an opacity wash on a brand colour.

## Typography

Cabinet Grotesk (variable 100–900, Arial/Helvetica fallback) for the whole app. Benedict only for
the wordmark tagline. Hierarchy is weight + role, never a second face.

| Role | Spec | Where |
|---|---|---|
| Board header | 700, `text-[1.9rem]`–`text-3xl`, tight leading | the one slate header per screen |
| Legend / lane label | **700, uppercase, `tracking-[0.12em]`, `text-xs`** | legend rail, plaque titles, chip text |
| Figure | 600, `tabular-nums` | every time, count, total, points, price |
| Name / dialog title | 600 | client names, appointment client, dialog `<h2>` |
| Body | 450, `text-sm`–`text-[15px]` | descriptions, message quotes, field content |

**The Legend rule.** A board region's title is set as a legend (tracked uppercase `text-xs`), not
as a `text-lg` heading — a board is labelled like a schedule, not titled like an article.

## Layout

Fixed 260px sidebar + fluid content, `max-w-6xl`, `px-8 py-8` (unchanged). Inside a section:

- **The slate board header** spans the content width, `rounded-plaque`, `slate` fill, white text,
  section name + context + primary action. One per screen.
- **Boards** are plaques: `rounded-plaque`, white or `rose-soft`/`taupe`-tint fill, routed-groove
  frame, an internal **legend rail** (`w-14` to `w-24` depending on content) and a lane column.
- **Lanes** are `lane-height` rows separated by `groove` hairlines, full-width tap targets, their
  own actions on the right, an amber left-edge slot always reserved (transparent until it holds).
- **Nothing bleeds to the viewport edge** — the outer `px-8` gutter is the board's mounting wall.
- Density is calm: `gap-4`–`gap-6` between boards, lanes touch (the hairline is the separation),
  `p-5`–`p-6` inside a plaque.

## Motion

The form's native motion is *a row reranking on a board and a tile flipping*. Give the page that
motion, orchestrated, once — not scattered hover effects.

- **Flip-chip:** `rotateX` 0→90° (110ms, ease-in) swap text, 90°→0° (110ms, ease-out).
- **Lane rerank:** FLIP transform, 220ms ease-out, on the list container when order changes.
- **Amber pulse:** left-edge `0→3px` + `amber` background flash on the lane, 1 cycle, 500ms, then
  the 3px edge holds at `amber` until the lane is acted on or the view is left.
- **Board entry:** lanes stagger in from a 6px right offset, 30ms apart, 180ms each — a board
  *fills*, it doesn't fade.
- `prefers-reduced-motion`: no flip, no stagger, no pulse animation — the held amber edge and the
  final positions still apply.

## Components

### `BoardHeader`
The standing slate header. Props: `section`, `context` (live day, count, subtitle), `action`,
optional `reset` (the "Aujourd'hui"-style control shown only when relevant), optional `backHref`
(a real 56px bordered button on the slate, never a bare chevron link).

### `Board`
A plaque region. Props: `legend` (the tracked-uppercase label sitting on the routed frame),
`rail` (the legend-rail content — hours, a letter index, or null), `children` (the lanes),
`tone` (`plain` white / `act` rose-soft / `now` taupe-tint). Routed groove via `box-shadow`.

### `Lane`
One row. Props: `leading` (time / avatar / index), `title`, `meta`, `chip` (a `FlipChip`),
`actions`, `signal` (`none` | `pulse` | `hold` — drives the amber left-edge), `onSelect`.
`lane-height` min, full-width press target, actions are `sm` buttons on the right.

### `FlipChip`
The status tile. Props: `value` (the label), `tone` (`neutral` / `act` rose / `now` taupe /
`done` success / `void` ink-400 / `signal` amber). `rounded-chip`, uppercase `legend` text,
`tabular` width so a flip doesn't reflow the lane. Animates the half-flip when `value` changes.

### `WeekStrip`
◀ / ▶ + 7 day tiles. Day tile: two lines (`LUN` / `14`), active = rose fill, today (not active)
= taupe ring. Squarer corners (`rounded-plaque`), not the old `rounded-2xl`.

### `PlateIndex` / `Plate` (Catalogue)
A strict grid of numbered plates — plate number in the corner as a legend, visual, name, price,
optional `TENDANCE` flip-flag. Tap → `Détail planche` dialog.

### Buttons, pills, fields, dialogs
`Button` (rose/taupe/outline pills, 56–60px), `Pills` (filter chips), `Field`, `Dialog`,
`ConfirmDialog`, `Toast` — carried over. In the board world:
- filter pills sit **on the board's legend line**, right-aligned, never in a separate toolbar row;
- a destructive confirm is still the one `ConfirmDialog`;
- an immediate, reversible action still raises the one `Toast` with an "Annuler" — and the toast
  is **amber-keyed** in this world (it is a "this just changed" message).

## Do / Don't

**Do**
- Frame every region as a plaque with a routed groove and a tracked legend.
- Reserve the amber left-edge slot on every lane even when empty — the board's alignment depends on it.
- Keep figures in `tabular-nums`; keep chips `tabular`-width so a flip never reflows a lane.
- Let a board *fill* on entry (staggered lanes) and *rerank in place* on change (FLIP).
- Keep every lane and primary control ≥ 56px.

**Don't**
- Ship a rounded white card on an ambient shadow — that is the world this refonte replaces.
- Give a second colour an "attention" meaning. Amber is the only signal.
- Title a board region with a `text-lg` heading — it is *labelled*, in tracked uppercase.
- Animate a status change without the flip; animate anything with a gradient, glow or glass.
- Reintroduce Entreprise/Salon selectors, per-line practitioner assignment, or a cart link in
  the Catalogue — all removed by decision.
