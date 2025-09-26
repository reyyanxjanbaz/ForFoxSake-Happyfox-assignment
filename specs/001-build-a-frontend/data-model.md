# Data Model: For Fox Sake Org Chart Experience

## Entity: Employee

| Field            | Type                                                             | Required | Description                                                            |
| ---------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `id`             | `string`                                                         | ✅       | Unique snowflake-style identifier generated via Faker.                 |
| `name`           | `string`                                                         | ✅       | Employee full name displayed on profile cards.                         |
| `designation`    | `string`                                                         | ✅       | Job title; updated automatically on tier promotion.                    |
| `tier`           | `"executive" \| "lead" \| "manager" \| "individual" \| "intern"` | ✅       | Defines default column in chart and styling tier.                      |
| `team`           | `string`                                                         | ✅       | Team name (Marketing, Engineering, etc.) used for grouping in sidebar. |
| `managerId`      | `string \| null`                                                 | ✅       | Parent employee id; null for root executives.                          |
| `photoAssetKey`  | `string`                                                         | ✅       | Filename for bundled backgroundless photo asset.                       |
| `employeeId`     | `string`                                                         | ✅       | Public-facing identifier searched in filters (exact match).            |
| `highlightState` | `{ active: boolean; reason: "filter" \| "drag" \| null }`        | ✅       | Controls glow animation triggers.                                      |
| `lastUpdatedAt`  | `string (ISO timestamp)`                                         | ✅       | Useful for optimistic Mirage sync and audit trail.                     |

**Validation Rules**:

- `managerId` MUST NOT create cycles; validated during drag/drop operations.
- `designation` auto-updates when `tier` promoted; manual edits validated to match tier taxonomy.
- `photoAssetKey` must reference a local image; build step checks existence.

## Entity: OrgHierarchy

| Field      | Type                       | Required | Description                                                    |
| ---------- | -------------------------- | -------- | -------------------------------------------------------------- |
| `roots`    | `string[]`                 | ✅       | List of executive IDs to render at top level.                  |
| `children` | `Record<string, string[]>` | ✅       | Mapping of managerId → ordered child IDs for React Flow edges. |
| `levels`   | `Record<string, number>`   | ✅       | Cached depth used for layout recalculation (dagre ranking).    |

**Derived Data**:

- `levels` recalculated on employee addition or reassignment.
- Maintains deterministic ordering for sidebar tree and React Flow node positions.

## Entity: FilterState

| Field              | Type                                                           | Required | Description                                     |
| ------------------ | -------------------------------------------------------------- | -------- | ----------------------------------------------- |
| `nameQuery`        | `string`                                                       | ✅       | Case-insensitive substring search.              |
| `designationQuery` | `string`                                                       | ✅       | Case-insensitive substring search.              |
| `employeeIdQuery`  | `string`                                                       | ✅       | Exact-match string.                             |
| `activeFilters`    | `{ name: boolean; designation: boolean; employeeId: boolean }` | ✅       | Tracks which chips are active for AND logic.    |
| `results`          | `string[]`                                                     | ✅       | Employee ids that satisfy AND-composed filters. |

**Rules**:

- When `results` empty and any filter active, UI displays zero-state.
- Highlight pulses triggered when `results` updated.

## Entity: InteractionLog

| Field       | Type                                       | Required | Description                                                         |
| ----------- | ------------------------------------------ | -------- | ------------------------------------------------------------------- |
| `id`        | `string`                                   | ✅       | Unique log entry id.                                                |
| `timestamp` | `string`                                   | ✅       | ISO timestamp of interaction.                                       |
| `type`      | `"filter" \| "reassignment" \| "add-node"` | ✅       | Categorizes log for analytics/testing.                              |
| `payload`   | `Record<string, unknown>`                  | ✅       | Holds event detail (previous/new manager ids, filter inputs, etc.). |

**Usage**:

- Used in tests to assert Mirage patch/post events executed.
- Optionally persisted to localStorage for session history.

## Derived View Models

| View Model      | Fields                                                                | Source                                              |
| --------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| `SidebarNode`   | `{ id, name, designation, badges, depth, isExpanded, isHighlighted }` | Combines `Employee`, `FilterState`, `OrgHierarchy`. |
| `FlowNode`      | `{ id, data: Employee, position, type, status, isHighlighted }`       | Derived from `Employee` + `OrgHierarchy.levels`.    |
| `FilterSummary` | `{ count, activeFilters, lastUpdatedAt }`                             | Derived from `FilterState` + `InteractionLog`.      |

## State Machines

- **Sidebar Collapse Machine**: `expanded → collapsing → collapsed → expanding`. Driven by Framer Motion to keep animation consistent.
- **Add Node Modal Flow**: `idle → editing → submitting → success|error`. Success updates Mirage via POST then pushes to `OrgHierarchy`.
- **Drag/Drop Flow**: `idle → dragging → validatingCycle → applying`. If validation fails, returns to `idle` with toast notification.
