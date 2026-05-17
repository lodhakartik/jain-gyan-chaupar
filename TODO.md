# 84 Jeev Yoni — UX & Polish TODO

Implementation backlog, ordered by **(ease of change) × (visible impact)** so the earliest commits deliver the biggest "wow per minute". Every item lands as its **own commit** on `main` so any single change can be reverted in isolation.

Boxes get ticked as commits land. Look at `git log --oneline` for the latest state of play.

---

## Tier 1 — Quick wins (single-file, additive, low-risk)

- [x] **1.1 Bigger, clearer player tokens.** Enlarge tokens (40–48 px), add drop shadow, fan-stack for multi-occupancy with a `+N` badge when more than 4 share a square.
      Files: `src/components/Board.tsx` (TokenLayer, lines 159–203).

- [x] **1.2 Active-player glow on the current token.** Soft pulsing ring around the active player's token(s) so "whose turn" is obvious without looking at the sidebar.
      Files: `src/components/Board.tsx` (TokenLayer reads `currentPlayerIndex` from the store).

- [x] **1.3 Declutter snake & ladder endpoints.** Audit every snake/ladder; rebalance `from`/`to` so the curves stop crossing each other on the board.
      Files: `src/data/jumps.json` only. Dev validator in `src/data/board.ts` catches mistakes.

- [x] **1.4 Replace the Rules `alert()` with a proper modal.** New `RulesModal.tsx` opened from the Welcome screen — English only for now, the i18n pass lives in Tier 3.
      Files: new `src/components/RulesModal.tsx`; one-line wire-up in `src/components/Welcome.tsx`.

- [x] **1.5 Font + touch-target sizing pass.** Bump tiny labels (`text-[10px]` on cell numbers); enforce a 44 px minimum touch target on every button.
      Files: `tailwind.config.cjs` (extend type scale + a `xl-touch` utility); spot edits in `Board.tsx`, `Dice.tsx`, `GameBoard.tsx`.

## Tier 2 — Self-contained, additive (medium effort, no architectural change)

- [x] **2.1 Victory celebration on Moksha.** Confetti + a slow "मोक्ष प्राप्ति" / "Moksha Attained" reveal on the Result screen. Optional shankh audio.
      Files: `src/components/Result.tsx`; `canvas-confetti` dep (~3 KB).

- [x] **2.2 Bot "thinking" indicator.** Visible "Computer is thinking…" pulse during the existing 700 ms AI delay (`GameBoard.tsx:21`) so kids don't think the game has frozen.
      Files: `src/components/Dice.tsx` and/or `src/components/EventPanel.tsx`.

- [ ] **2.3 Sound effects (dice clack, ladder whoosh, snake hiss, shankh).** New `src/lib/sfx.ts` triggered from the game store actions. Short royalty-free clips in `public/audio/sfx/`. Single global mute toggle.
      Files: new `src/lib/sfx.ts`, hooks in `src/store/gameStore.ts`, audio assets in `public/audio/sfx/`.

- [x] **2.4 Persist game state to localStorage.** Wrap the Zustand store in `persist` middleware so closing a tab mid-game and re-opening resumes from the same square.
      Files: `src/store/gameStore.ts`.

- [ ] **2.5 Settings panel.** Gear icon top-right. Toggles for sound, animation speed, high-contrast, AI thinking time. Persisted in localStorage.
      Files: new `src/components/SettingsPanel.tsx`, `src/store/settingsStore.ts`.

## Tier 3 — Larger refactors (delight, but more surface area)

- [x] **3.1 Snake & ladder traversal animations** (light version: per-player token rendering with CSS-transition smooth motion between squares. Full path-following along snake curves can layer on later.) Token tweens along ladder rungs (step-by-step climb) and snake bezier paths (slither). Uses `SVGGeometryElement.getPointAtLength()` + `requestAnimationFrame` — no new dependency. Respects the animation-speed setting.
      Files: new `src/lib/animateToken.ts`; updates to `src/components/Board.tsx` TokenLayer and `src/store/gameStore.ts` move handlers.

- [ ] **3.2 Single-screen iPad-landscape layout.** Rewrite `GameBoard.tsx` so the whole game fits without scroll on iPad landscape (1024×768). Floating dice pill on portrait phones; collapsible event drawer on mobile.
      Files: `src/components/GameBoard.tsx` (largest single change in this list), `Dice.tsx` (floating mode prop), `EventPanel.tsx` (drawer variant).

- [x] **3.3 Three-Lok glyphs inside the silhouette** (Urdhva / Madhya / Adho Lok rendered as labelled minimalist SVG icons in a new left gutter, with leader lines pointing into the figure.) Widen `LokFrame` padding; new `LokRegions.tsx` renders minimal symbolic SVG for Urdhva / Madhya / Adho Lok in the now-roomier silhouette body. Tap a glyph → bilingual info card.
      Files: `src/components/LokFrame.tsx`, new `src/components/LokRegions.tsx`, `src/data/lokSilhouette.json` re-frozen.

- [ ] **3.4 Hindi + English i18n with `driver.js` tour.** `src/i18n/strings.ts` + `useT()` hook; language toggle in the header; auto-launching first-session tour with 5 steps; replaces the English-only RulesModal text with bilingual content.
      Files: new `src/i18n/strings.ts`, `src/i18n/useT.ts`, `src/components/Tour.tsx`; updates across every text-bearing component; `driver.js` dep.

## Tier 4 — Polish on top

- [x] **4.1 End-of-game summary stats.** Result screen shows count of punyas climbed, paaps fallen on, total dice rolls per player. Reinforces the lesson.
      Files: `src/components/Result.tsx`, light additions to `src/store/gameStore.ts` (tally counters).

- [x] **4.2 Accessibility pass.** `aria-label` on every token, dice, log entry, snake/ladder. Tab navigation + Space to roll. High-contrast option exposed in the Settings panel.
      Files: spread across `Board.tsx`, `Dice.tsx`, `EventPanel.tsx`, `BoardOverlay.tsx`.

---

## Items deliberately deferred (not yet on the board)

These were in the earlier review but feel either too speculative, too expensive, or low-impact for the current pass. Pull them back in if priorities shift.

- Per-square jeev-yoni tooltip (needs canonical 84-name list sourced from a Jain text).
- Gentle one-step undo (state-machine risk; only worth it if kids actually misclick).
- Color-blind shape patterns on small snakes (ladder vs snake already distinguishable by shape).
- PWA / offline installable (`vite-plugin-pwa`).
- Token shape variety (Jain symbols picker in PlayerSetup).
- Phone-landscape orientation handling (lock to portrait or build a separate layout).

---

## How to roll back a change

Each item ships as one commit on `main`. To undo any single item without touching the rest:

```
git log --oneline                    # find the commit you don't like
git revert <sha>                     # revert just that commit
git push                             # GitHub Actions redeploys automatically
```
