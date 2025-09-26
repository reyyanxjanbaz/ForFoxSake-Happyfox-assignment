<!--
Sync Impact Report:
- Version change: 1.0.0 (initial constitution version)
- Added principles: UI/UX Style, Animation Guidelines, Self-Testing, Accessibility, Code Quality, Performance
- Added sections: Technology Standards, Development Workflow
- Templates requiring updates: ✅ plan-template.md, spec-template.md, tasks-template.md will be validated
- Follow-up TODOs: None - all placeholders filled
-->

# For Fox Sake Constitution

## Core Principles

### I. UI/UX Style (NON-NEGOTIABLE)

Professional yet modern design MUST be maintained at all times. All interfaces MUST use clean layouts with primarily white backgrounds and shades of orange for accents. All nodes MUST implement animated square backgrounds from reactbits.dev/squares. Profile cards inside nodes MUST remain readable and professional with backgroundless, chest-up stock photos for consistent appearance. Responsive layout across devices is MANDATORY.

**Rationale**: Consistent visual identity ensures professional presentation and user trust while maintaining modern appeal.

### II. Animation Guidelines

Animations MUST be subtle and purposeful. Framer Motion SHALL only be used where necessary (sidebar collapse/expand, smooth node addition). Over-animation that distracts from usability is PROHIBITED. Every animation must enhance rather than hinder user experience.

**Rationale**: Purposeful animation improves user experience without creating distractions or performance issues.

### III. Self-Testing (NON-NEGOTIABLE)

The system MUST self-test. Every core feature (drag/drop, filtering, highlighting, API sync) MUST have automated tests. Automated tests MUST catch regressions and errors early to eliminate manual testing burden. Both unit tests (logic) and integration tests (UI interactions) MUST be written for all features.

**Rationale**: Automated testing prevents regression and reduces developer burden while ensuring reliability.

### IV. Accessibility Compliance

Org chart and sidebar MUST be navigable by keyboard. ARIA roles MUST be implemented for collapsible sections and employee nodes. Color contrast MUST meet accessibility compliance standards. All interactive elements must be accessible to users with disabilities.

**Rationale**: Inclusive design ensures the application is usable by all users regardless of abilities.

### V. Code Quality Standards

React components MUST be modular and maintainable. Clarity and maintainability MUST be favored over shortcuts. Design choices MUST be documented in README. Code must follow established patterns and conventions consistently.

**Rationale**: High code quality ensures long-term maintainability and team productivity.

### VI. Performance Optimization

Efficient rendering of React Flow chart MUST be maintained even with large numbers of employees. Memoization (React.memo, useCallback) MUST be used to avoid unnecessary re-renders. Employee images MUST be lazy-loaded for optimal performance.

**Rationale**: Performance directly impacts user experience and application scalability.

## Technology Standards

Technology stack decisions MUST align with the established React ecosystem. React Flow MUST be used for org chart visualization. Framer Motion usage MUST be justified and minimal. Stock photo standards MUST be maintained for professional appearance. Orange color palette MUST be consistently applied across all UI elements.

## Development Workflow

All pull requests MUST verify compliance with these principles. Each feature MUST include automated tests before implementation. Performance impact MUST be measured and documented. Accessibility compliance MUST be tested and verified. UI consistency MUST be maintained across all components.

## Governance

This constitution supersedes all other development practices. Amendments require documentation of rationale, team approval, and migration plan for existing code. All development decisions must be justified against these principles. Violations must be corrected before code integration.

**Version**: 1.0.0 | **Ratified**: 2025-09-26 | **Last Amended**: 2025-09-26
