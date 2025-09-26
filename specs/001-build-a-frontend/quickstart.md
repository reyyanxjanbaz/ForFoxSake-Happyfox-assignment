# Quickstart: For Fox Sake Org Chart Experience

## 1. Prerequisites

- Node.js 18+
- npm 9+
- macOS, Windows, or Linux shell with git

## 2. Install Dependencies

```bash
npm install
```

This installs React, React Flow, MirageJS, Framer Motion, React Bits-inspired components, classnames, Jest, React Testing Library, Testing Library user-event, ESLint, Prettier, ts-jest, and @faker-js/faker.

## 3. Run the Mirage-backed Dev Server

```bash
npm run dev
```

- Vite serves the React app at `http://localhost:5173`.
- MirageJS boots automatically and seeds a five-tier hierarchy.
- Opening the sidebar allows collapsing/expanding tree nodes, with React Flow mirroring updates.

## 4. Execute the Test Suite

```bash
npm run test
```

- Runs Jest in watch mode with React Testing Library and contract tests.
- Includes unit tests for search/filter utilities and integration tests for drag/drop + add node flows.

## 5. Lint & Format

```bash
npm run lint
npm run format
```

- ESLint enforces constitution-driven rules (accessibility, hooks, testing).
- Prettier keeps formatting consistent across `.ts`, `.tsx`, `.css`, and Markdown docs.

## 6. Build for Production

```bash
npm run build
```

- Creates optimized static output in `dist/` ready for Netlify or Vercel deployment.
- Run `npm run preview` to smoke-test the production bundle locally.

## 7. Deploy

- **Netlify**: Connect repository, set build command `npm run build`, publish directory `dist`.
- **Vercel**: Import project, set framework preset to Vite, build command `npm run build`, output `dist`.
- Record demo video (screen capture + narration) showcasing default chart, sidebar interactions, filters, drag/drop promotions, and add-node flow.

## 8. Asset Management

- Curated backgroundless photo assets live in `src/assets/photos/`.
- Update `photoAssetKey` mappings in Mirage seed data when adding new assets.

## 9. Troubleshooting

- Mirage cycle validation errors trigger toast notifications; reset data via sidebar “Reset hierarchy” control.
- If Jest struggles with ES modules, ensure `ts-jest` config uses `isolatedModules: false` and transform lists React Flow packages.
