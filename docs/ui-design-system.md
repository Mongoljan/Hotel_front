# UI Design System Documentation

## Dashboard Design Patterns & Characteristics

This document outlines the consistent design patterns and visual characteristics used throughout the Hotel Admin application for future reference and consistency.

---

## 🧱 Binding Layout Tokens (AUTHORITATIVE — use these everywhere)

These tokens are the **single source of truth** for spacing, widths, and typography. Every admin page, registration step, form, and modal **must** use these exact classes. Do not invent new widths, paddings, or title sizes — change this document first and then update the codebase.

### Admin Page Shell
```tsx
<div className="flex-1 space-y-6 p-4 md:p-6">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-semibold">Page Title</h1>
    <div className="flex items-center gap-2">{/* actions */}</div>
  </div>
  {/* content — inherits space-y-6 from shell */}
</div>
```
- Outer wrapper: `flex-1 space-y-6 p-4 md:p-6`
- Header row: `flex items-center justify-between`
- Page title: `text-2xl font-semibold` (NO `mb-*` — rely on `space-y-6`)
- Action button group: `flex items-center gap-2`

### Registration Step / Centered Form Card
```tsx
<div className="flex justify-center px-4">
  <Card className="w-full max-w-[640px]">
    <CardHeader className="space-y-1 pb-4">
      <CardTitle className="text-xl font-semibold text-center">Title</CardTitle>
      <CardDescription className="text-center">Optional description</CardDescription>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form className="space-y-5">
          {/* fields */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1">Back</Button>
            <Button type="submit" className="flex-1">Next</Button>
          </div>
        </form>
      </Form>
    </CardContent>
  </Card>
</div>
```
- Outer: `flex justify-center px-4` (no `items-center` — let content flow from the top)
- Card width: **always** `w-full max-w-[640px]` for registration / settings forms
- CardHeader: `space-y-1 pb-4`
- CardTitle: `text-xl font-semibold text-center` (NEVER `font-bold` — reserved for hero cards)
- CardDescription: `text-center`
- Form spacing (between sections): `space-y-5`
- Button row: `flex gap-3 pt-2` with `flex-1` buttons
- Button icons: `h-4 w-4`, `mr-2` / `ml-2`

### Form Field Spacing
- **Between sections** (groups of related fields): `space-y-5`
- **Between related fields in a section**: handled by default `FormItem` gap (no custom wrapper)
- **Inside a single field cluster** (e.g. label + horizontal group): `space-y-2`
- **Inner padding for "conditional panel"** (a sub-form that appears when a toggle is on): `p-3 border border-dashed rounded-lg` with `space-y-3` inside
- **Label min-width for inline label/control rows**: `min-w-[200px]` (desktop) — but prefer stacked `FormLabel` on top for new code
- **Numeric input widths**: `w-20` (short, e.g. "%"), `w-32` (medium), `w-40` / `w-48` (currency)

### Dialog / Modal
```tsx
<DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>Title</DialogTitle>
  </DialogHeader>
  <form className="space-y-5">
    {/* body */}
    <DialogFooter className="gap-2 pt-2">
      <Button variant="outline">Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </form>
</DialogContent>
```
- Dialog width: `sm:max-w-[640px]` (matches form card width — consistency when Dialog holds the same form content)
- Always scroll-safe: `max-h-[90vh] overflow-y-auto`
- Footer: `gap-2 pt-2`

### Typography Hierarchy
| Use | Class |
|-----|-------|
| Page title | `text-2xl font-semibold` |
| Card title | `text-xl font-semibold` |
| Section heading (inside card) | `text-base font-semibold` |
| Sub-section heading | `text-sm font-medium` |
| Body / field label | `text-sm` (default FormLabel) |
| Secondary / helper text | `text-sm text-muted-foreground` |
| Dense meta (labels above values) | `text-xs text-muted-foreground` |

- **font-bold is reserved** for hero gradient cards and hero numeric stats only.
- Never combine title text with `mb-*` — rely on the parent `space-y-*` to create gap.

### Read-only Info Display (InfoRow pattern)
When showing saved values in a read-only settings view, use a consistent key-value pattern:
```tsx
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">Label</p>
    <p className="text-sm font-medium">Value</p>
  </div>
</div>
```
- Grid gap: `gap-6` (24px) — consistent with card-to-card gap elsewhere
- Label/value pair spacing: `space-y-0.5` (2px) so they read as a unit

### Sidebar / Vertical Menu (inside a settings card)
```tsx
<nav className="flex flex-col gap-0.5 text-sm">
  <button
    className={cn(
      'w-full text-left py-2 px-3 rounded-md transition-colors',
      active
        ? 'bg-muted text-foreground font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    )}
    aria-current={active ? 'page' : undefined}
  >
    Menu Item
  </button>
</nav>
```
- Always use `<button>`, never `<p onClick>` (accessibility).
- Active state uses `bg-muted` (neutral), NOT `bg-primary/10` — primary is reserved for CTAs (see COLOR-STANDARD.md).

### Step Indicator (Multi-step flow)
- Responsive: circle `h-8 w-8 sm:h-10 sm:w-10`
- Label: `text-[10px] sm:text-xs`, `line-clamp-2` for long Mongolian labels
- Connector line: `h-[2px]` absolute-positioned to avoid fixed `space-x-*` breaking on mobile
- All step names **must** go through `useTranslations` (no hardcoded strings)

---

## 🎨 Core Design Philosophy

### Visual Identity
- **Clean & Professional**: Minimalist design with purposeful elements
- **Dashboard-First**: Enterprise-grade interface patterns
- **Gradient Accents**: Subtle gradient overlays for depth and sophistication
- **Card-Based Layout**: Information organized in clean, bordered cards
- **Consistent Spacing**: Systematic spacing using `space-y-4`, `space-y-6` patterns

### Color System
- **Background**: `bg-background` - Clean, light base
- **Cards**: `bg-card` with subtle borders `border-border/50`
- **Muted Elements**: `text-muted-foreground` for secondary information
- **Primary Actions**: `bg-primary` with `text-primary-foreground`
- **Gradient Overlays**: Blue/indigo/purple spectrum for visual depth

## 🔥 Signature Card Designs

### Hero Cards (Large Feature Cards)
```css
/* Gradient Dark Card - Used in Room Management */
background: gradient-to-r from-slate-950 via-indigo-950 to-slate-900
border: border-border/50
shadow: shadow-[0_30px_80px_rgba(15,23,42,0.35)]
text: text-slate-100

/* Overlay Effects */
radial-gradient: circle_at_top, rgba(99,102,241,0.35), transparent_55%
linear-gradient: 140deg, rgba(255,255,255,0.08), transparent_45%
```

### Stats Cards
```css
/* Glass-morphism Effect */
background: bg-background/70
backdrop-filter: backdrop-blur
border: border-border/50
shadow: shadow-xl

/* Gradient Accent (Top) */
position: absolute inset-x-0 -top-16 h-32
background: bg-gradient-to-r opacity-40 blur-3xl
variants:
  - from-indigo-500/40 via-sky-500/30 to-cyan-500/40
  - from-fuchsia-500/30 via-purple-400/20 to-indigo-400/30
  - from-emerald-500/30 via-teal-400/20 to-sky-400/30
  - from-sky-500/30 via-blue-400/20 to-cyan-300/30
```

### Enhanced Table Cards
```css
/* Container */
background: bg-gradient-to-br from-background via-background/95 to-background/90
border: border-border/50
shadow: shadow-xl
backdrop-filter: backdrop-blur

/* Gradient Effects */
top-gradient: from-blue-500/20 via-indigo-500/15 to-purple-500/20 opacity-60 blur-3xl
radial-overlay: radial-gradient(circle_at_top_right, rgba(99,102,241,0.15), transparent_50%)

/* Inner Table Container */
background: bg-background/50
border: border-border/30
shadow: shadow-inner
backdrop-filter: backdrop-blur
```

## 📊 Table Design System

### Material-UI DataGrid Enhancements

#### Header Styling
```css
background: hsl(var(--muted))
color: hsl(var(--foreground))
font-weight: 600
border-radius: 16px 16px 0 0
min-height: 52px
padding: 16px horizontal
```

#### Row Styling
```css
/* Alternating Rows */
even-rows: hsl(var(--background))
odd-rows: hsl(var(--card))

/* Hover Effect */
hover: hsl(var(--muted)) with transition 0.15s ease-in-out

/* Cell Padding */
padding: 16px horizontal, 12px vertical
font-size: 0.875rem
line-height: 1.25rem
```

#### Footer Styling
```css
background: hsl(var(--muted))
border-radius: 0 0 16px 16px
border-top: 1px solid hsl(var(--border))
min-height: 52px
```

## 🎯 Typography System

### Headings
```css
/* Page Titles */
text-3xl font-bold tracking-tight text-cyrillic

/* Card Titles */  
text-xl font-bold tracking-tight

/* Section Headers */
text-lg font-semibold text-cyrillic
```

### Body Text
```css
/* Primary Text */
text-sm text-foreground

/* Secondary Text */
text-xs text-muted-foreground

/* Cyrillic Text */
.text-cyrillic { font-family: 'PT Sans', 'Noto Sans', system-ui, sans-serif }
```

## 🔘 Interactive Elements

### Buttons
```css
/* Primary Actions */
bg-primary text-primary-foreground
shadow-lg hover:shadow-xl transition

/* Secondary Actions */
variant="outline" border-white/30 bg-white/10

/* Icon Buttons */
rounded-full bg-primary/10 p-2 text-primary
```

### Form Elements
```css
/* Inputs */
border border-input bg-background
focus-visible:ring-2 focus-visible:ring-ring

/* Labels */
text-sm font-medium text-cyrillic

/* Error States */
border-destructive text-destructive
```

## 🌈 Badge & Status System

### Status Badges
```css
/* Verified/Success */
border-emerald-200 bg-emerald-500/10 text-emerald-600

/* Pending/Warning */
border-amber-200 bg-amber-50 text-amber-600

/* Info/Default */
bg-primary/10 text-primary border-primary/20
```

## 📐 Layout Patterns

### Dashboard Container
```css
flex-1 space-y-4 p-4 md:p-8 pt-6
```

### Grid Layouts
```css
/* Stats Grid */
grid gap-4 md:grid-cols-2 lg:grid-cols-4

/* Content Grid */
grid gap-4 md:grid-cols-2 lg:grid-cols-7
col-span-4 (content) + col-span-3 (sidebar)

/* Form Grid */
grid gap-6 md:grid-cols-2
```

### Card Spacing
```css
/* Outer Container */
space-y-4 (main sections)
space-y-6 (form sections)

/* Inner Content */
space-y-2 (form fields)
space-y-3 (card content)
```

## 🎭 Animation & Transitions

### Hover Effects
```css
transition hover:bg-white (buttons)
transition-transform group-hover:rotate-90 (icons)
transition-opacity group-hover:opacity-100 (tooltips)
```

### Loading States
```css
/* Circular Progress */
color: hsl(var(--primary))
size: 40px

/* Skeleton Loading */
bg-muted animate-pulse
```

## 🔮 Special Effects

### Glass Morphism
```css
backdrop-blur + bg-white/10 + border-white/30
```

### Gradient Overlays
```css
pointer-events-none absolute inset-0
bg-[radial-gradient(...)] or bg-[linear-gradient(...)]
opacity-20 to opacity-60
blur-xl to blur-3xl
```

### Shadow System
```css
/* Card Shadows */
shadow-sm (subtle)
shadow-lg (medium)
shadow-xl (prominent)
shadow-[custom] (special effects)
```

## 📱 Responsive Patterns

### Breakpoints
```css
sm: 640px (mobile-first)
md: 768px (tablet adjustments)
lg: 1024px (desktop optimizations)
xl: 1280px (large screens)
```

### Mobile Adaptations
```css
/* Flexible Layouts */
flex-col sm:flex-row
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

/* Padding Adjustments */
p-4 md:p-8
space-y-4 md:space-y-6
```

## 🎨 Theme Integration

### CSS Variables Usage
```css
/* Always use CSS variables for theming */
hsl(var(--primary))
hsl(var(--background))
hsl(var(--muted-foreground))

/* Component Classes */
.text-cyrillic (Mongolian text)
.sidebar-modern (custom sidebar styling)
```

This design system ensures consistency across all admin interfaces while maintaining the sophisticated, professional appearance that characterizes the Hotel Admin application.

---

# 🎨 Hotel Admin UI Modernization Roadmap

## Project Overview
Transform the entire Hotel Admin application with the stunning gradient card designs and consistent dashboard styling.

## 🔥 Signature Design Elements (The "Damn Cool" Stuff)

### 1. Hero Gradient Cards (The Star of the Show)
```css
/* Dark Purple-Indigo Hero Cards */
background: bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950
text: text-white (full white text for contrast)
shadows: shadow-[0_40px_100px_rgba(15,23,42,0.5)]
borders: border-border/50

/* Multi-layered Gradient Overlays */
Layer 1: radial-gradient(circle_at_top_left, rgba(147,51,234,0.4), transparent_50%)
Layer 2: radial-gradient(circle_at_bottom_right, rgba(79,70,229,0.3), transparent_60%)  
Layer 3: linear-gradient(140deg, rgba(255,255,255,0.12), transparent_40%)
```

## 📋 Implementation Plan

### Phase 1: Core Admin Pages (Session 1)
**Priority: HIGH** 
- ✅ `/admin/hotel` - Dashboard styling applied
- ✅ `/admin/room` - Hero card and table enhanced  
- 🔄 `/admin/dashboard` - Add hero cards and enhance existing
- 🔄 `/admin/register` - Apply gradient cards to registration steps

### Phase 2: Room Management Suite (Session 2)  
- `/admin/room/price` - Price management with gradient cards
- `/admin/room/RoomModal` - Modal redesign with glass-morphism

### Phase 3: Extended Areas (Session 3)
- `/admin/superadmin` - Superadmin dashboard with hero cards
- `/app/user/dashboard` - User dashboard modernization

## 🌍 Translation Integration
```json
{
  "room_management": "Өрөөний удирдлага",
  "dashboard_overview": "Удирдлагын самбар", 
  "total_revenue": "Нийт орлого",
  "occupancy_rate": "Эзэмшлийн хувь"
}
```