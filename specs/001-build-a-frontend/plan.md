ios/ or android/

# Implementation Plan: For Fox Sake Org Chart Experience

**Branch**: `001-build-a-frontend` | **Date**: 2025-09-26 | **Spec**: [`specs/001-build-a-frontend/spec.md`](specs/001-build-a-frontend/spec.md)
**Input**: Feature specification from `/specs/001-build-a-frontend/spec.md`

## Summary

Build a React 18 + TypeScript org-chart interface scaffolded with Vite, pairing React Flow, MirageJS, and custom React Bits-inspired components to deliver synchronized sidebar/chart editing, filtering, and animation flows that satisfy constitutional UI, testing, and performance mandates.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18, React 18  
**Primary Dependencies**: Vite, React Flow, @dagrejs/dagre, MirageJS, Framer Motion, classnames, @faker-js/faker, Jest, React Testing Library, Testing Library user-event, ESLint, Prettier  
**Storage**: MirageJS in-memory schema with bundled photo assets  
**Testing**: Jest + React Testing Library + ts-jest + user-event + contract tests  
**Target Platform**: Web (desktop/tablet/mobile) hosted on Netlify or Vercel  
**Project Type**: Single web frontend (Vite application)  
**Performance Goals**: 60 FPS interactions with up to 500 employee nodes loaded  
**Constraints**: WCAG AA contrast, keyboard navigation, prevent hierarchy cycles, offline-ready photo assets  
**Scale/Scope**: Five-tier org chart, drag/drop promotions, add-node modal, highlight filters, deployment + demo video deliverables

## Constitution Check

- [x] **UI/UX Style**: Plan codifies white/orange theme tokens, animated Squares background component, and consistent profile cards.
- [x] **Animation Guidelines**: Framer Motion limited to sidebar collapse, filter panel transitions, and node-add pulses with documented triggers.
- [x] **Self-Testing**: Jest suites cover filters, tree builder, drag/drop, add-node, Mirage sync, plus failing contract tests.
- [x] **Accessibility Compliance**: Keyboard navigation map, ARIA roles for tree + modal, and RTL selectors defined in tests.
- [x] **Code Quality Standards**: Modular feature folder (`features/org-chart`) with hooks/services/utils; README documents decisions.
- [x] **Performance Optimization**: React.memo/useCallback strategy, dagre layout caching, lazy-loaded images, debounced filters.

## Project Structure

```
src/
├── app/
│   ├── App.tsx
│   ├── providers/
│   └── router/
├── assets/
│   ├── photos/
│   └── theme/
├── components/
│   ├── chart/
│   ├── sidebar/
│   ├── filters/
│   └── shared/
├── features/
│   └── org-chart/
│       ├── hooks/
│       ├── services/
│       ├── state/
│       ├── utils/
│       ├── components/
│       └── __tests__/
├── mocks/
│   └── server.ts
├── styles/
│   └── globals.css
└── main.tsx

tests/
├── unit/
│   ├── filters/
│   ├── tree/
│   └── data/
├── integration/
│   ├── drag-drop/
│   └── add-node/
└── contract/
    └── api/

config/
├── jest.config.ts
├── eslint.config.js
└── prettier.config.js
```

**Structure Decision**: Single Vite-powered frontend. Feature-centric folders keep org-chart logic isolated, while shared testing directories mirror constitution mandates for unit, integration, and contract coverage.

## Phase 0: Outline & Research

- Completed `research.md` capturing:
  - Vite + React 18 + TS as baseline (rejected CRA/Next).
  - Dagre-powered layout strategy for React Flow.
  - Recreation approach for React Bits Profile Card and Squares background as reusable components.
  - MirageJS architecture with factories + seeds and Faker-driven dummy data.
  - Jest + RTL testing stack using ts-jest.
  - CSS Modules and theme tokens for orange/white styling.
  - Netlify/Vercel deployment alignment with static build artifacts.
- No outstanding clarifications; all unknowns resolved or assigned clear direction.

## Phase 1: Design & Contracts

- Authored `data-model.md` defining Employee, OrgHierarchy, FilterState, InteractionLog entities, validation rules, derived view models, and state machines.
- Generated `contracts/openapi.yaml` describing GET/POST/PATCH employee endpoints, payload schemas, hierarchy validation errors.
- Added failing Jest placeholders in `contracts/tests/employees.contract.test.ts` to enforce contract coverage once Mirage routes exist.
- Documented onboarding steps and commands in `quickstart.md`, covering install, dev server, testing, linting, build, deploy, assets, troubleshooting.
- Planned component responsibilities: service layer bridging Mirage + React Flow, hook for drag/drop validation, and highlight pulse controller.

## Phase 2: Task Planning Approach

- `/tasks` will translate design artifacts into ~25 ordered tasks.
- Ordering: set up tooling → data layer (models + Mirage) → React Flow rendering → sidebar + filters → interactions (drag/drop/add node) → animations → accessibility polish → testing → deployment + README.
- Parallelization: contract tests vs. UI scaffolding, dummy data generator vs. photo asset import, docs vs. deployment pipeline.
- Emphasize TDD: write unit tests for filter logic, tree builder, Mirage services before implementing; integration suites for drag/drop and add-node before hooking UI.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _None_    | —          | —                                    |

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
