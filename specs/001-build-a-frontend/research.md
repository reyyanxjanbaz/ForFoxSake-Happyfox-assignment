# Research Findings: For Fox Sake Org Chart Experience

## Decision: Vite + React 18 + TypeScript

- **Rationale**: Vite offers fast dev server and optimized build, aligns with modern React workflows, and integrates cleanly with MirageJS and React Flow. TypeScript enforces typings across complex org-chart state.
- **Alternatives Considered**: Create React App (deprecated, slower DX); Next.js (overhead for static org-chart and complicates Mirage integration).

## Decision: React Flow with Dagre layout helper

- **Rationale**: React Flow natively handles node connections and controls. Leveraging `@dagrejs/dagre` for hierarchical tree layout ensures consistent downward flow and easy re-layout on drag events.
- **Alternatives Considered**: Custom D3 implementation (higher effort, less React-friendly); using built-in React Flow layout (insufficient for strict top-down tiers without manual positioning).

## Decision: React Bits Profile Card & Squares background recreation

- **Rationale**: React Bits is a design reference, not a published npm package. Plan is to recreate the Profile Card and Squares background as reusable components/styles that match the visual guidelines.
- **Alternatives Considered**: Importing raw snippets from React Bits every time (duplication); substituting another UI kit (violates constitution branding).

## Decision: MirageJS mock server architecture

- **Rationale**: Instantiate Mirage in `src/mocks/server.ts` with factories and seeds for five hierarchy tiers. Expose service layer hooks to read/write via Mirage endpoints.
- **Alternatives Considered**: MSW (better for request mocking but lacks built-in ORM for hierarchical relationships); JSON Server (harder to embed in Vite build).

## Decision: Dummy data generator with `@faker-js/faker`

- **Rationale**: Faker provides realistic names, roles, and IDs. Pairing with curated local photo assets meets offline requirement.
- **Alternatives Considered**: Static JSON (less varied, harder to expand); Random data generator (less realistic titles).

## Decision: Testing stack with Jest + React Testing Library + Testing Library user-event

- **Rationale**: Jest remains standard for React testing, integrates with TypeScript via `ts-jest`. RTL ensures accessible selectors and interactions, aligning with constitution.
- **Alternatives Considered**: Vitest (faster but requirement explicitly lists Jest); Cypress (for e2e, but heavier than needed for mandated integration coverage).

## Decision: Styling & theming approach

- **Rationale**: Use CSS Modules for component-scoped styles plus a global CSS for theme tokens (orange palette, typography). Utilize CSS custom properties for accent shades and apply animated squares using CSS keyframes.
- **Alternatives Considered**: Tailwind (not requested, adds tooling overhead); Styled Components (runtime cost higher, not necessary).

## Decision: Deployment strategy

- **Rationale**: Configure build output for static hosting; provide Netlify/Vercel deployment scripts and environment documentation in README.
- **Alternatives Considered**: GitHub Pages (lacks serverless features if future API required); AWS Amplify (extra complexity for this project size).
