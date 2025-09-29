# UI Modernization Roadmap

_Last updated: 2025-09-29_

## Vision

Deliver a cohesive, highly legible management experience across every surface (auth, user, admin, superadmin) that reflects the new brand tokens, supports full localization, and maintains accessibility excellence.

## Guiding Principles

- **Consistency first:** Reuse shadcn primitives plus our enhanced tokens before crafting bespoke UI.
- **Localization-ready:** Every text, aria-label, and validation message must resolve through `next-intl`.
- **Ambient depth:** Apply the brand gradient/noise surfaces, layered shadows, and radius tokens across all shells and cards.
- **Performance aware:** Prefer utility-first Tailwind tweaks over bespoke CSS where possible.
- **Progressive delivery:** Ship improvements route-by-route while keeping the app deployable at all times.

## Phase Overview

### Phase 1 – Shell & Navigation Alignment _(in progress)_
- [x] Refresh global theming tokens (`tailwind.config.ts`, `app/globals.css`).
- [x] Rebuild `unauthorized`/`forbidden` pages with shadcn surfaces.
- [ ] Embed localized language toggles in every authenticated shell (admin, superadmin, user).
- [ ] Unify header treatment via `BreadcrumbHeader` + orchestrated topbars.
- [ ] Normalize sidebar spacing, focus states, and collapse affordances.

### Phase 2 – Form & Feedback Harmonization
- [ ] Replace legacy inputs with shadcn `Form` + `Input`/`Select` wrappers.
- [ ] Centralize Zod error translation keys and surface inline hints.
- [ ] Standardize toast notifications (success, warning, destructive) with brand colors.
- [ ] Implement skeleton/loading states using `components/ui/skeleton` for every async section.

### Phase 3 – Data Presentation Upgrade
- [ ] Restyle Material UI tables to adopt brand palette (or migrate to shadcn tables where feasible).
- [ ] Introduce reusable `AnalyticsCard` / `StatBadge` components for dashboards.
- [ ] Build pattern library for timeline, activity feed, and status indicators.

### Phase 4 – Micro-interactions & Polish
- [ ] Add motion primitives (fade/slide) to drawers, modals, and accordions.
- [ ] Layer in focus-visible rings + reduced-motion fallbacks.
- [ ] Curate iconography set (lucide only) and retire mixed icon packs.
- [ ] Expand dark-mode QA across all routes.

## Route-by-Route Sequencing

| Route Group | Key Components | Modernization Tasks | Target Phase |
|-------------|----------------|---------------------|--------------|
| `/auth/*` | LoginForm, Register steps | Align with shadcn `Card`/`Form`, unify spacing, translate all placeholders | 2 |
| `/admin/dashboard` | Stat blocks, charts | Create `AnalyticsCard`, harmonize chart colors with tokens | 3 |
| `/admin/hotel/*` | Stepper forms | Introduce reusable step header + progress indicator, migrate form controls | 2 |
| `/admin/room/*` | RoomModal, pricing tables | Restyle tables, convert modals to `Sheet` with new glassmorphism | 3 |
| `/superadmin/*` | Legacy sidebar/topbar | Replace bespoke layout with shared `SidebarLayout`, add LanguageSwitcher | 1 |
| `/user/dashboard/*` | Widgets/cards | Apply updated `Card` shadow/radius, ensure responsive grid | 2 |

## Shared Component Enhancements

- Create `SectionHeader` pattern (title + actions + helper) to reuse across cards.
- Extend `Button` variants with gradient accent + quiet tone for secondary actions.
- Ship `Surface` utility class for consistent padding and background layering in mixed contexts (cards, sheets, drawers).
- Build `EmptyState` component with icon, title, description, and CTA slots.

## Accessibility & Localization Checklist

- [ ] Verify every dialog/sheet has a visible or hidden `Title` + `Description`.
- [ ] Audit aria-label usage to ensure translation keys exist.
- [ ] Provide language toggle keyboard shortcuts + focus outlines.
- [ ] Run axe-core scans on representative pages each sprint.

## Current Sprint Focus (S-09.5)

1. Integrate localized language switchers into admin & superadmin headers and persist locale via cookie + router.
2. Polish `BreadcrumbHeader` (spacing, separators, responsive collapse) and align with SectionHeader spec.
3. Refresh base `Card` styling with subtle backdrop + gradient border to propagate across surfaces.
4. Catalogue pending lint violations tied to unused variables and create elimination plan aligned with modernization phases.

## Risks & Mitigation

- **Locale desync between cookie and router:** Adopt `next-intl` navigation helpers and centralize switching logic.
- **Design drift across legacy MUI screens:** Introduce wrapper components that map tokens to MUI theme overrides.
- **Regression risk during sweeping UI updates:** Maintain granular commits per route, backed by screenshot diffs (Playwright visual tests backlog).

## Next Steps

- [x] Implement admin header language toggle (current task).
- [x] Stand up `@/i18n/navigation` helpers to simplify locale-aware navigation.
- [ ] Draft MUI theming bridge proposal for Phase 3.
- [ ] Schedule dark-mode pass once Phase 2 forms land.

## Room Management Tables Modernization (Deep Dive)

### Current State Recap
- **Room list view:** Relies on Material UI `DataGrid` with default styling, inconsistent typography, and no alignment with Tailwind tokens.
- **Room price view:** Custom table with ad-hoc spacing, mixed button variants, and limited empty/loading states.
- **Modals & editors:** `RoomModal` mixes multiple icon packs, toasts, and bespoke form layout without shadcn primitives.

### Objectives
1. Harmonize both grids with brand palette, typography, and focus treatments.
2. Provide consistent toolbar affordances (filters, search, quick actions) with responsive design.
3. Ensure localization for column headers, tooltips, and empty states.
4. Improve readability of complex cell renderers (badges, price breakdowns) via reusable atoms.

### Workstreams

**A. DataGrid Theme Bridge**
- [ ] Create `styles/mui-theme.ts` exporting a theme that maps Tailwind tokens to MUI palette/typography.
- [ ] Configure global `ThemeProvider` wrapper inside `SidebarLayout` to scope the theme to admin routes.
- [ ] Override `DataGrid` slots for header background, row hover, checkbox, and pagination controls.
- [ ] Replace inline sx props in room modules with token-driven classes.

**B. Column Definition Refactor**
- [ ] Extract room columns into `app/admin/room/columns.ts` with typed helpers and translation keys (via `next-intl`).
- [ ] Introduce cell components for status badges, amenities summary, and CTA menus.
- [ ] Document column patterns in `/docs/component-guidelines/data-grid.md`.

**C. Room Price Table Upgrade**
- [ ] Port existing markup to shadcn `Table` primitives or lightweight DataGrid depending on interactions.
- [ ] Add inline editing affordances (if required) using `Sheet`-based editors for price overrides.
- [ ] Implement segmented controls for season filters with gradient-accented buttons.

**D. Modals & Forms**
- [ ] Convert `RoomModal` to `SheetContent`-based multi-step flow using `Form` primitive.
- [ ] Swap out icon packs (FontAwesome/Misc) for lucide equivalents to reduce bundle weight.
- [ ] Centralize toast notifications through `sonner` with localized messages.

**E. QA & Performance**
- [ ] Add loading/skeleton states to both tables leveraging `components/ui/skeleton`.
- [ ] Ensure virtualization settings fit new styling without layout jumps.
- [ ] Verify keyboard navigation and screen reader announcements for all interactive cells.

### Milestones
1. **M1: Theme foundation (S-09.6)** – MUI theme bridge + DataGrid overrides in place.
2. **M2: Room list revamp (S-09.7)** – Column refactor, new toolbar, localized copy.
3. **M3: Room pricing overhaul (S-09.8)** – Table modernized, season toggles, empty states.
4. **M4: Modal/forms alignment (S-09.9)** – Sheet-based editor, lucide icons, sonner toasts.

### Dependencies
- Completion of `@/i18n/navigation` to translate column headers.
- Available brand token references from `tailwind.config.ts` for theme mapping.
- Coordination with backend for any API adjustments (e.g., additional metadata for tooltips).

### Open Questions
- Should room pricing support inline bulk actions? (Confirm with stakeholders.)
- Do we maintain Material UI DataGrid or migrate to TanStack Table for consistency? Evaluate after M1.
- What is the priority order for mobile support on these tables? Need responsive breakpoints defined.
