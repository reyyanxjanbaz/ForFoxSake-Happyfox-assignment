# Feature Specification: For Fox Sake Org Chart Experience

**Feature Branch**: `001-build-a-frontend`  
**Created**: 2025-09-26  
**Status**: Draft  
**Input**: User description: "Build a frontend application for visualizing and managing an employee organization chart with interactive features, focusing on modern, professional UI/UX. The application should be built using React + React Flow for visualization. Core Requirements: 1. Default Org Chart Layout - Tier 1: CEO, CTO, CMO. - Tier 2: Managers + HR. - Tier 3: Team leads. - Tier 4: Employees. - Tier 5: Interns. - Layout = upside-down family tree. 2. Node Design - Each node styled as a Profile Card from reactbits.dev. - Background of nodes animated using Squares background from reactbits.dev/backgrounds/squares. - Nodes display backgroundless chest-up stock photos for employee avatars. 3. Sidebar (Collapsible) - File-structure style hierarchy (like VSCode Explorer). - Mirrors the org chart hierarchy. - Nodes in sidebar also styled as Profile Cards. 4. Filtering Section - Toggleable section below the tree view. - Filters by: name, employee ID, designation. - Matching nodes highlighted in both sidebar and chart. 5. React Flow Features - Zoom, pan, minimap, controls enabled. - Nodes draggable to reassign managers. - Add Node button creates new employee nodes with dummy data until edited. - Dummy data auto-generated (random names, roles, IDs, backgroundless chest-up stock photos). 6. Styling - Color scheme: White as primary background, orange shades for accents. - Smooth but minimal animations (Framer Motion where necessary). 7. Backend (Mock) - Use MirageJS (or similar) to mock: GET /api/employees PATCH /api/employees/:id POST /api/employees. - Keep employee data synced across chart and sidebar. 8. Deliverables - GitHub repo + README. - Hosted app on Netlify/Vercel. - Demo video showing features."

---

## Overview

- Provide a web-based org chart experience that mirrors the company hierarchy from executives to interns.
- Give HR and leadership teams a single place to explore roles, reassign reports, and plan staffing changes.
- Maintain a professional visual style aligned with the project constitution (white backgrounds, orange accents, subtle animations).
- Ensure accessibility, responsive layouts, and automated testing coverage for all critical interactions.

## Objectives

- Deliver a production-ready frontend that can be hosted publicly and demonstrated via a narrated video.
- Showcase interactive exploration (zoom, pan, minimap) and live hierarchy editing (drag/drop reassignment, node creation).
- Keep sidebar and chart views synchronized with a mock backend that simulates GET, POST, and PATCH endpoints.
- Document setup, testing, and deployment in a comprehensive README.

## Clarifications

### Session 2025-09-26

- Q: What rules govern drag-and-drop reassignment across tiers? → A: Interns can be reassigned anywhere; promotions are allowed when moving upward and the employee data must update; cycles are strictly prevented.
- Q: How realistic should dummy data be and how are photos sourced? → A: Use realistic Faker-generated names/roles and bundle a curated local set of backgroundless chest-up photos.
- Q: How should filters handle matching and combination logic? → A: Name/designation allow partial matches, employee ID requires exact match, and active filters combine with AND logic.
- Q: What is the desired "Add Node" workflow once the control is used? → A: Immediately open a modal to collect details before the node appears in the hierarchy.
- Q: How should matching highlights appear when filters are active? → A: Show a subtle glow/pulse around the card while filters are active, clearing once filters are removed.
- Q: Which data points must appear directly on the profile card? → A: Display name, designation, and employee ID; manager/team context stays in the sidebar/filter panels.

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As an HR operations lead, I need a live organization chart that visually mirrors our reporting hierarchy so I can explore teams, update reporting lines, and identify staffing gaps without leaving the browser.

### Acceptance Scenarios

1. **Given** the default organization chart has loaded with data from the mock API, **When** the HR lead expands teams and opens profile cards, **Then** the chart and sidebar both display synchronized information for each employee tier (executives through interns).
2. **Given** the HR lead needs to add a new hire, **When** they activate the "Add Node" control and drag the resulting employee card beneath a manager, **Then** the new employee appears in both the chart and sidebar with generated placeholder data until manually edited.
3. **Given** the HR lead searches for an employee by name or designation, **When** the query matches one or more employees, **Then** those nodes are highlighted simultaneously in the chart and sidebar and non-matching nodes are visually deemphasized while remaining accessible.

### Edge Cases

- What happens when the mock API returns an empty employee dataset? The interface MUST surface an empty state message and offer a control to repopulate dummy data.
- How does the system handle conflicting drag-and-drop reassignment attempts (e.g., assigning a manager beneath their own direct report)? The system MUST prevent invalid loops and display a non-blocking warning.
- How does the experience respond when filters yield zero matches? The UI MUST display a "No employees found" state without losing existing hierarchy data.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST present a default organization chart with five tiers (executives through interns) arranged as an upside-down family tree on initial load.
- **FR-002**: System MUST render each employee as a profile card containing name, designation, employee ID, and a backgroundless chest-up photo, while contextual manager/team information remains in the sidebar.
- **FR-003**: System MUST display animated square backgrounds behind every profile card node to maintain visual consistency with brand guidelines.
- **FR-004**: The collapsible sidebar MUST mirror the chart hierarchy and support expanding/collapsing to browse teams in a file-structure layout.
- **FR-005**: Users MUST be able to drag employee nodes to assign or reassign managers, with both the chart and sidebar updating instantly while preventing hierarchical cycles.
- **FR-006**: Users MUST be able to filter employees by name, employee ID, or designation; name and designation filters allow partial matches, employee ID requires an exact match, and qualifying nodes MUST be highlighted in both the chart and the sidebar.
- **FR-006a**: Multiple active filters MUST combine using AND logic so only employees satisfying every selected criterion appear highlighted.
- **FR-006b**: Filter matches MUST trigger a subtle glow/pulse animation around the card (chart and sidebar) that persists while filters are active and clears immediately once filters are removed.
- **FR-007**: An "Add Node" control MUST open a modal form to collect employee details (name, role, tier, optional manager) before inserting the new node into the hierarchy.
- **FR-007a**: After submission, the newly created employee MUST appear under the selected manager (or chosen tier) with data synchronized across chart and sidebar.
- **FR-008**: The system MUST provide zoom, pan, minimap, and standard React Flow controls to navigate complex hierarchies.
- **FR-009**: The application MUST synchronize updates between the React Flow chart and sidebar views whenever employee data changes.
- **FR-010**: The frontend MUST interact with a mock API (GET, POST, PATCH) to load, create, and update employee data within the session.
- **FR-011**: The experience MUST support responsive layouts across desktop, tablet, and mobile breakpoints without breaking hierarchy visibility.
- **FR-012**: The interface MUST surface accessible keyboard navigation for both chart focus traversal and sidebar tree navigation.
- **FR-013**: The project MUST ship with documentation (README) outlining setup, testing, deployment targets, and demo video link.
- **FR-014**: The delivered solution MUST include a deployment to a public host (Netlify or Vercel) and provide URL access.
- **FR-015**: When a node is moved to a higher tier, the system MUST treat the action as a promotion and update the employee’s designation and tier data in both the chart and sidebar.

### Non-Functional Requirements

- **NFR-001**: Visual design MUST adhere to professional white primary backgrounds with orange accent palette and avoid visual clutter.
- **NFR-002**: Animations MUST be purposeful and subtle, using Framer Motion only where necessary (e.g., sidebar transitions, node addition).
- **NFR-003**: The interface MUST maintain smooth interactions (target 60 FPS) on mid-tier laptops with up to 500 employee nodes loaded.
- **NFR-004**: Accessibility compliance MUST meet WCAG AA color contrast and include ARIA roles for collapsible sections and employee nodes.
- **NFR-005**: Automated tests MUST cover core flows (drag/drop, filtering, highlighting, API sync) to prevent regressions during iteration.
- **NFR-006**: Dummy assets MUST remain self-contained by shipping with a curated local library of backgroundless chest-up photos to ensure consistent offline builds.

### Key Entities _(include if feature involves data)_

- **Employee**: Represents a single person in the organization; attributes include id, name, designation, tier, managerId, photoAssetKey (referencing bundled photo), highlight state, and timestamps for last update.
- **OrgHierarchy**: Represents the structural relationships between employees; maintains root nodes (CEO/CTO/CMO) and child lists for each manager.
- **FilterState**: Captures current filter inputs (name, employee ID, designation) and derived results for synchronized highlighting.
- **InteractionLog**: Stores session-level actions (node added, reassigned, filter applied) used for regression testing and mock backend sync verification.

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
