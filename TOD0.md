# TODO — town-route-guide honest fixes (Phase 0–1)

## Phase 0 — Trust-critical UX lies
- [ ] src/routes/index.tsx
  - [ ] Remove fake Safety SOS (`setTimeout` “sent” copy); replace with honest dial/call option or remove GPS-dispatch language entirely.
  - [ ] Remove hardcoded `shareLive` link (`naatransit.ap.gov.in/live/track-391`) and clipboard share; disable/remove feature until real live-view exists.
  - [ ] Update `DICT.govTag` to remove government affiliation claim.
  - [ ] Rewrite `AIAssistant.respond()` to not fabricate bus/ETA/platform; make it an honest route lookup assistant (or remove rich reply).
  - [ ] Remove/rename “APSRTC LIVE” badge in `MapMock`.

## Phase 1 — Build/type-contract fixes
- [ ] src/routes/index.tsx
  - [ ] Fix `getNearbyPlaces` call shape: pass `{ data: { cityId, category } }` to match `inputValidator`.
  - [ ] Fix Safety crash: either add `safety: string[]` to `City` + fill `CITIES`, or remove corridor safety feed section.
- [ ] src/lib/api/conductor.functions.ts
  - [ ] Refactor every export to correct `createServerFn({ method }).inputValidator(zod).handler(async ({ data }) => ...)` pattern.
  - [ ] Add zod schemas for login/start/end/push location/live queries/tickets.
- [ ] src/routes/conductor.tsx
  - [ ] Update call sites for all conductor server fns to match new `{ data: ... }` signatures.
  - [ ] Remove demo credentials box from UI (Phase 0).
- [ ] src/lib/conductor-data.ts
  - [ ] Remove mock/demo plaintext password accounts and dead in-memory stores (if truly unused after Phase 1 refactor).

## Verification (after edits)
- [ ] Run `npx tsc --noEmit` (must be zero errors).
- [ ] Run `npx eslint .` and fix issues.
- [ ] Manual checks:
  - [ ] Safety tab no longer crashes.
  - [ ] PlacesSheet nearby places fetch works without contract mismatch.
  - [ ] Conductor login/start/end compile and call server fns correctly.
