# Smart Campus Room Availability Checker

Classroom prototype (React + TypeScript + Vite + Tailwind). A student picks a start time and a
duration (1–120 minutes) and the app checks whether Room B204 is available (Practice #12 contract). All bookings are fictional; nothing is saved.

## Rules (Practice #12 shared acceptance criteria)
- AC1: Start time must be in the future (after the simulated current time).
- AC2: Duration must be greater than zero and at most 120 minutes.
- AC3: Overlapping bookings are unavailable (touching endpoints are allowed).
- AC4: A blocked room is unavailable (toggle in the header).
- AC5: A clear decision is shown; existing bookings are never changed.
- AC6: Invalid input receives understandable feedback.

Outputs: `available` (boolean), `reasonCode` (AVAILABLE, OVERLAP, ROOM_BLOCKED, PAST_START,
INVALID_DURATION, INVALID_TIME, OUTSIDE_DAY) and a visible message. The in-page panel
"Acceptance tests T1–T8" runs the shared test set.

## Setup
Requires Node 18+ and npm.

```bash
npm ci          # install exact versions from package-lock.json
npm run dev     # local preview at http://localhost:5173
```

## Checks
| Command | What it does |
|---|---|
| `npm test` | Runs all Vitest tests in `src/utils/*.test.ts` |
| `npm run typecheck` | TypeScript check (`tsc --noEmit -p tsconfig.app.json`) |
| `npm run lint` | ESLint |
| `npm run build` | Production build into `dist/` |
| `npm run check` | All four of the above, stops at the first failure |

## Structure
- `src/utils/availability.ts` — booking rules (single source of truth)
- `src/utils/contract.ts` — Practice #12 contract: input validation + reason codes (calls availability.ts)
- `src/contractCases.ts` — shared test set T1–T7 (T8 = bookings unchanged)
- `src/utils/slot.ts` — older start/end entry point (kept for existing regression tests)
- `src/utils/explain.ts` — optional "Explain this result" text (local mock, no network, no API key)
- `src/components/` — UI components; `src/App.tsx` — page state
- `src/data.ts` — fictional room, bookings and in-page test cases

No environment variables are needed. `@supabase/supabase-js` is listed in `package.json` but is not
used anywhere in the code (removal pending approval; see AGENTS.md).

Agents: read `AGENTS.md` before making changes.
