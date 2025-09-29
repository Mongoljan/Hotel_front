# UI Surface Map — September 26, 2025

This inventory captures how pages, layouts, and UI building blocks compose the rendered experience today. It pulls directly from the current codebase so we can track where shadcn components are already adopted, where Material UI or bespoke markup remains, and what should be standardized in the next passes.

> **Legend**  
> • **shadcn** – Component exported from `@/components/ui/*`  
> • **Custom** – Component under `@/components/*` (non-shadcn)  
> • **Raw** – Plain JSX/HTML inputs or legacy markup  
> • **MUI** – Usage of Material UI (`@mui/*`, `@mui/x-data-grid`)

## Layout stack

| Scope | File | Wraps | Key children | Styling notes |
| --- | --- | --- | --- | --- |
| Root | `app/layout.tsx` | Entire app (server) | `NextIntlClientProvider`, body wrapper | Uses CSS variables from `globals.css`; no decorative background applied yet |
| Auth | `app/auth/layout.tsx` | `/auth/**` client pages | `TopbarAuth`, page content | Imports `WavyBackground` but doesn’t render it; no sidebar |
| Admin | `app/admin/layout.tsx` → `app/admin/admin_layout.tsx` | `/admin/**` dashboards | `SidebarLayout` (client), `LoadingPage` fallback | `SidebarLayout` composes `SidebarProvider`, `AppSidebar`, `BreadcrumbHeader` |
| Superadmin | `app/superadmin/layout.tsx` → `app/superadmin/admin_layout.tsx` | `/superadmin/**` | `TopbarAdmin`, legacy `Sidebar` (custom) | Sidebar toggled via state; relies on raw Tailwind classes |
| User | `app/user/dashboard/page.tsx` (no custom layout) | `/user/**` | `Topbar`, `Menu` | Mix of raw HTML forms and legacy menu |

## Route inventory (rendered pages)

| Route | Layout | Description | Primary components & libs |
| --- | --- | --- | --- |
| `/` | Root | Redirects to login | — |
| `/auth/login` | Auth | Card-based login screen | shadcn `Card`, `LoginForm` (uses shadcn `Input`, `Button`, `Alert`, lucide icons, `sonner`) |
| `/auth/register` | Auth | Step 1 hotel onboarding | **Raw inputs**, `react-number-format`, `react-toastify`; no shadcn wrappers |
| `/auth/register/2` | Auth | Step 2 staff onboarding | **Raw inputs**, `PatternFormat`, `react-toastify`; password toggles with `react-icons` |
| `/auth/register/Hotel` | Auth | Placeholder (empty) | — (candidate for removal) |
| `/admin/dashboard` | Admin | KPI dashboard with charts | shadcn `Card`, `Tabs`, `Button`; `recharts`, `tabler-icons-react` |
| `/admin/hotel` | Admin | Hotel approval workflow | Custom `Proceed`, `SixStepInfo`, `StepIndicator`; conditional rendering based on auth state |
| `/admin/room` | Admin | Room list shell | shadcn `Card`, `Button`; embeds `RoomList` |
| `/admin/room/RoomList` | Admin | Rooms table | shadcn `Table`, `Badge`, `Button`; `react-toastify`; fetches REST API |
| `/admin/room/price` | Admin | Pricing management entry | shadcn `Card`, `Separator`; local components |
| `/admin/room/price/SeasonPrice` | Admin | Seasonal pricing form | shadcn `Button`, `Badge`, `Input`, `Label`; manual state management |
| `/admin/register` | Admin | Internal user invite form | **Raw inputs**, `react-phone-input-2`, `toast`, `js-cookie` |
| `/superadmin/dashboard` | Superadmin | Owners table | **MUI `DataGrid`**, `react-toastify`; relies on server fetch + client pass-through |
| `/unauthorized` | Root | Plain 401 message | Bare div, no shadcn |
| `/forbidden` | Root | Plain 403 message | Bare heading, no shadcn |
| `/user/dashboard` | Root | User menu toggles | Legacy `Menu` (custom), raw checkboxes, tailwind utility mix |

## Shared component inventory

| Component | File | Type | Consumed by |
| --- | --- | --- | --- |
| `Topbar` | `components/topbar.tsx` | Custom | Public landing & user dashboard |
| `TopbarAuth` | `app/auth/TopbarAuth.tsx` | Custom | Auth layout header |
| `TopbarAdmin` | `app/admin/TopbarAdmin.tsx` | Custom + shadcn (`Button`, `Badge`) | Admin shell |
| `AppSidebar` | `components/app-sidebar.tsx` | Custom composition of shadcn sidebar primitives | Admin shell |
| `NavMain` | `components/nav-main.tsx` | Custom | Admin sidebar navigation |
| `SidebarLayout` | `components/sidebar-provider.tsx` | Custom | Wraps admin content |
| `BreadcrumbHeader` | `components/breadcrumb-header.tsx` | Custom + shadcn `Breadcrumb` | Admin content header |
| `GradientBackground` / `WavyBackground` | `components/ui/gradient-bg.tsx`, `components/ui/wavy-background.tsx` | shadcn-inspired utilities | Currently unused in layouts |
| `Button`, `Input`, etc. | `components/ui/*` | shadcn | Used across modernized forms and dashboards |
| Legacy `Button`, `input` | `components/Button.tsx`, `components/input.tsx` | Dead/unused | Safe to remove once confirmed |
| `Menu` | `components/menu.tsx` | Custom legacy nav | Only user dashboard |

## Divergences & opportunities

- **Forms still using raw inputs**: `/auth/register`, `/auth/register/2`, `/admin/register`, and portions of admin hotel onboarding bypass shadcn form primitives and lack consistent spacing, radius, and color tokens.
- **Status pages lack branding**: `/unauthorized` and `/forbidden` render unstyled text blocks.
- **Superadmin relies on Material UI DataGrid**: Styling diverges sharply from shadcn look. We need a wrapper theme or a shadcn-aligned table upgrade.
- **Background treatments**: No shared gradient/noise surface despite having helper components (`GradientBackground`, `WavyBackground`).
- **Typography**: `text-cyrillic` utility swaps to PT Sans manually; future typography scale should leverage Tailwind tokens.

## Next diagnostic steps

1. **Token pass** – define brand palette, spacing, and radius tokens in `globals.css` / `tailwind.config.ts` (guided by [shadcn theming](https://ui.shadcn.com/docs/theming) and [Tailwind color customization](https://tailwindcss.com/docs/colors)).
2. **Background system** – introduce layered gradient + noise surfaces, inspired by [MagicPattern CSS Backgrounds](https://www.magicpattern.design/tools/css-backgrounds) and its grain generator, to replace the flat white body.
3. **Form unification** – migrate remaining raw inputs to `Form`, `Input`, `Label`, and `Select` from shadcn, wiring existing Zod schemas for validation feedback.
4. **Data grids** – either skin Material UI to match the new tokens or replace with a shadcn-compatible table abstraction for superadmin workflows.

Use this file as the canonical checklist while we iterate through the redesign.
