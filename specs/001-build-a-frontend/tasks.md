# Tasks: For Fox Sake Org Chart Experience

**Input**: Design documents from `/specs/001-build-a-frontend/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Phase 3.1: Setup

- [x] T001 Scaffold Vite + React + TypeScript project at repo root (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `index.html`) following plan structure.
- [x] T002 Install runtime dependencies (`react`, `react-dom`, `react-flow-renderer`, `@dagrejs/dagre`, `miragejs`, `framer-motion`, `classnames`, `@faker-js/faker`) and dev dependencies (`@types/*`, `jest`, `ts-jest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `eslint`, `prettier`) updating `package.json` scripts.
- [x] T003 Configure tooling: add `config/jest.config.ts`, `eslint.config.js`, `prettier.config.js`, extend `tsconfig.json`, and wire npm scripts (`test`, `lint`, `format`, `dev`, `build`, `preview`).

## Phase 3.2: Tests First (TDD) ⚠️ write tests to fail before implementation

- [x] T004 [P] Author contract coverage in `tests/contract/api/employees.contract.test.ts` asserting GET/POST/PATCH align with `contracts/openapi.yaml` schemas and currently fail without Mirage handlers.
- [x] T005 [P] Create integration test `tests/integration/chart/chartLoad.spec.tsx` to verify initial Mirage load renders synchronized sidebar + React Flow tiers.
- [x] T006 [P] Create integration test `tests/integration/drag-drop/dragDrop.spec.tsx` simulating reassignment drag, ensuring PATCH request issued and cycles blocked.
- [x] T007 [P] Create integration test `tests/integration/filters/filterHighlight.spec.tsx` covering filter panel search, AND logic, and highlighting pulses.
- [x] T008 [P] Create unit test `tests/unit/filters/filterEmployees.test.ts` for filter predicate helpers (partial name/designation, exact ID).
- [x] T009 [P] Create unit test `tests/unit/data/dummyData.test.ts` validating dummy data generator outputs Faker-based ids, tiers, and photo keys.
- [x] T010 [P] Create unit test `tests/unit/tree/buildHierarchy.test.ts` for hierarchy builder ensuring deterministic levels and cycle protection.

## Phase 3.3: Core Implementation (after tests are red)

- [x] T011 [P] Implement Employee types/selectors in `src/features/org-chart/state/employee.ts` matching data-model fields.
- [x] T012 [P] Implement OrgHierarchy utilities (`roots`, `children`, dagre level cache) in `src/features/org-chart/state/orgHierarchy.ts`.
- [x] T013 [P] Implement FilterState store with AND logic flags in `src/features/org-chart/state/filterState.ts`.
- [x] T014 [P] Implement InteractionLog module in `src/features/org-chart/state/interactionLog.ts` with event append helpers.
- [x] T015 Implement dummy data generator in `src/features/org-chart/utils/dummyData.ts` using Faker names/roles, photo asset lookup, and tier-aware designations.
- [x] T016 Configure Mirage server in `src/mocks/server.ts` with models, factories, routes (GET/POST/PATCH) and seeded five-tier hierarchy.
- [x] T017 Build API service wrapper in `src/features/org-chart/services/api.ts` (load, create, update employees, promotion logic on tier change).
- [x] T018 Implement graph builder + layout in `src/features/org-chart/services/graphBuilder.ts` integrating `@dagrejs/dagre` for downward layout.
- [x] T019 Construct two-panel layout shell in `src/app/App.tsx` and `src/styles/globals.css` applying white/orange theme tokens and CSS grid.
- [x] T020 Create shared components `ProfileCard.tsx` and `SquaresBackground.tsx` in `src/components/shared/` with animated square backdrop and lazy-image slot.
- [x] T021 Implement sidebar tree (`src/components/sidebar/Sidebar.tsx` + styles) with collapsible groups, ARIA tree roles, and profile cards.
- [x] T022 Implement filter panel (`src/components/sidebar/FilterPanel.tsx`) with collapsible Framer Motion accordion, AND logic wiring, and clear controls.
- [x] T023 Wire highlight orchestration hook in `src/features/org-chart/hooks/useHighlights.ts` to sync FilterState results to sidebar/chart pulses.
- [x] T024 Implement React Flow canvas component `src/components/chart/OrgChartCanvas.tsx` rendering profile card nodes, edges, minimap, controls, and responsive sizing.
- [x] T025 Implement drag/drop reassignment hook `src/features/org-chart/hooks/useDragReassign.ts` validating cycles, triggering PATCH, updating InteractionLog.
- [x] T026 Implement Add Node modal + trigger (`src/components/shared/AddNodeModal.tsx`, `src/features/org-chart/hooks/useAddNode.ts`) auto-filling Faker data and inserting via POST.
- [x] T027 Create org chart provider/context in `src/features/org-chart/providers/OrgChartProvider.tsx` to keep sidebar and canvas state synchronized after mutations.
- [x] T028 Add Framer Motion animations (sidebar collapse, filter accordion, node addition glow) across relevant components while respecting animation guidelines.

## Phase 3.4: Polish & Compliance

- [x] T029 Implement accessibility pass: keyboard navigation for tree + canvas, focus traps in modal, ARIA labels in components touched above.
- [x] T030 Add lazy-loading for photo assets and loading placeholders in `ProfileCard` + ensure Mirage seeds reference bundled images.
- [x] T031 Tune responsive breakpoints in `src/styles/globals.css` and layout components for tablet/mobile views.
- [x] T032 Run `npm run test` and `npm run lint` ensuring all suites (unit, integration, contract) pass and adjust configs as needed.
- [x] T033 Prepare deployment configs (`netlify.toml`, `vercel.json`, `package.json` deploy scripts) and document environment variables if any.
- [x] T034 Execute production build (`npm run build`), deploy to chosen host, capture public URL, and note demo video capture plan.
- [x] T035 Author root `README.md` detailing setup, testing, architecture decisions, deployment URL, and demo video link.

## Dependencies

- T001 → T002 → T003 establish tooling before tests.
- T004-T010 must complete (failing) before starting T011.
- T011-T014 (state) must finish before T017-T028 (services/components) that rely on them.
- T015 precedes T016 (seeds) and T026 (add node).
- T016 must precede T017 and T025-T027.
- T018 depends on T011-T014.
- T019 must precede T021-T024.
- T022 depends on T013.
- T023 depends on T013 and T021-T024 wiring as it consumes their state outputs.
- T024 must precede T025 and T028.
- T025-T027 must finish before T028 (animations) and T032 (passing tests).
- T028 must complete before T029 (accessibility review includes animated elements).
- T032 must precede T033-T035 to ensure clean artifacts.

## Parallel Execution Example

Launch independent test authoring once setup is complete:

```
Task: "T005 [P] Create integration test tests/integration/chart/chartLoad.spec.tsx"
Task: "T006 [P] Create integration test tests/integration/drag-drop/dragDrop.spec.tsx"
Task: "T007 [P] Create integration test tests/integration/filters/filterHighlight.spec.tsx"
Task: "T008 [P] Create unit test tests/unit/filters/filterEmployees.test.ts"
```

All touch separate files and share only the mocked Mirage context defined per-test.

## Notes

- Mark tasks complete individually and commit after each major step.
- Ensure tests written in Phase 3.2 fail before implementing matching functionality.
- Keep animated effects subtle and performance-friendly in accordance with the constitution.
