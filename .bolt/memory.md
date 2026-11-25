# Project memory

## Product intent & audience

- Smart Campus Room Availability Checker: lets students check whether a campus room is free for a requested time window.
- Secondary users: staff/admins who can block a room (currently no access control).
- Simulation-oriented now (editable "current time"), with a path toward real bookings hinted by Supabase dependency.

## Brand personality & voice

- Production-quality, non-cookie-cutter UI per explicit user instructions; prefer fully featured, polished pages.
- Instructional/campus tone; booking titles like "Faculty Meeting" are currently fictional.

## Visual design & UX direction

- Single-page React app: header with block toggle, booking form (start/end time fields + duration badge), result banner, timeline visualization, and collapsible test-cases panel.
- Components inferred: `App.tsx`, `Header.tsx`, `BookingForm.tsx` (with `TimeField`), `ResultBanner.tsx`, `TestCases.tsx`, plus logic in `availability.ts` and data in `data.ts`.
- Styling via Tailwind classes; icons via `lucide-react`. Do not add UI theme/icon packages.
- Imports use `@/` alias to `src/`.
- Accessibility gaps to address: live region for result announcement, label-to-input association, `aria-expanded` on test-cases toggle.

## Decisions, constraints & rationale

- Backend is intentionally absent: `@supabase/supabase-js` is in `package.json` but unused; introducing backend usage violates the no-backend rule unless explicitly authorized.
- State is in-memory only; the staff block toggle must not be persisted without sign-in.
- Editing "now" time is allowed by design for simulation (`AGENTS.md`).
- Default times (`11:00`, `12:00`, `08:00`) and slot-parsing logic are duplicated across `handleCheck`/`handleRunTest`; a shared `parseSlot` helper is planned but not yet added.
- Test files `availability.test.ts` and `availability.regression.test.ts` overlap intentionally; do not merge in a way that weakens assertions.
- Messages hardcode values like "120 minutes"; risk of drift if the limit changes.

## Open questions & assumptions

- Are staff meant to use the room block toggle, and should it require auth?
- Will real booking data (with titles) ever be shown to all visitors? Privacy review needed before that.
- Test/lint status is unverified in this session; regression test file has not been run.
- Duration calculation behavior with blank start field is preexisting; whether to fix or preserve is undecided.