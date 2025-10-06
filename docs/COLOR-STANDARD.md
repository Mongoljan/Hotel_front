# 🎨 Hotel Admin - Official Color Standard

**Version:** 1.0  
**Date:** October 6, 2025  
**Status:** ✅ Approved & Enforced

---

## 📋 Overview

This document defines the **official color standard** for all UI components in the Hotel Admin application. Following this standard ensures visual consistency, professional appearance, and maintainable code.

---

## 🎯 Core Principle

**"Primary colors for primary actions, neutral colors for selections"**

- Use **theme primary color** (purple/indigo) for important CTAs and branding
- Use **slate-700** for selections, checked states, and active items
- Use **accent colors** for subtle hover effects
- Use **semantic colors** for status indicators

---

## 🔵 Selection & Checked States

### ✅ CORRECT - Use Slate-700 for Selected, Subtle Unselected

**For radio buttons, checkboxes, and toggle selections:**

```tsx
<span className="peer-checked:bg-slate-700 peer-checked:text-white peer-checked:border-slate-700 
               border border-border/40 rounded-lg px-4 py-2 cursor-pointer
               bg-background text-muted-foreground transition hover:bg-muted/50 hover:border-border">
  Option Text
</span>
```

**Key Design Decisions:**
- ✅ **Selected state**: `bg-slate-700` - Professional, clear feedback
- ✅ **Unselected state**: `bg-background` - Very subtle, not eye-catching
- ✅ **Unselected text**: `text-muted-foreground` - Muted gray text
- ✅ **Unselected border**: `border-border/40` - Light, barely visible border (40% opacity)
- ✅ **Hover state**: `hover:bg-muted/50` - Subtle hint of gray on hover
- ✅ Maintains visual hierarchy (primary color reserved for CTAs)
- ✅ Selected items stand out, unselected items fade into background

### ❌ INCORRECT - Don't Use Primary Color

```tsx
<!-- ❌ TOO BRIGHT, COMPETES WITH PRIMARY ACTIONS -->
<span className="peer-checked:bg-primary peer-checked:text-primary-foreground">
```

---

## 🟣 Primary Actions (Buttons & CTAs)

### Use Theme Primary Color

**For important actions, submit buttons, primary CTAs:**

```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Save Changes
</Button>

<button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg">
  Create Room
</button>
```

**When to use:**
- Submit buttons
- Primary action buttons
- Create/Add new buttons
- Important CTAs

---

## 🔗 Links & Text

### Navigation Links

```tsx
<Link className="text-foreground hover:text-primary transition-colors">
  Login
</Link>
```

### Highlighted Text / Headings

```tsx
<h2 className="text-primary font-bold">
  Section Title
</h2>
```

---

## 🎨 Hover States

### For Unselected Items

```tsx
className="hover:bg-accent transition-colors"
```

### For Buttons

```tsx
// Primary buttons
className="bg-primary hover:bg-primary/90"

// Secondary/Outline buttons  
className="border border-primary hover:bg-primary hover:text-primary-foreground"
```

---

## 🏷️ Borders & Backgrounds

### Form Elements

```tsx
// Input borders
className="border border-input"

// Muted backgrounds (inactive states)
className="bg-muted text-foreground"

// Active/focus states
className="focus-visible:ring-2 focus-visible:ring-ring"
```

---

## 📊 Status & Badges

### Success States

```tsx
<Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">
  Verified
</Badge>
```

### Warning States

```tsx
<Badge className="border-amber-200 bg-amber-50 text-amber-600">
  Pending
</Badge>
```

### Info States

```tsx
<Badge className="bg-primary/10 text-primary border-primary/20">
  New
</Badge>
```

---

## 📝 Complete Examples

### Radio Button Group (Correct Standard)

```tsx
<div className="flex gap-2">
  <label className="flex items-center cursor-pointer">
    <input
      type="radio"
      value="yes"
      className="hidden peer"
    />
    <span className="peer-checked:bg-slate-700 peer-checked:text-white peer-checked:border-slate-700 
                   border border-input px-4 py-2 rounded-lg transition hover:bg-accent">
      Yes
    </span>
  </label>
  
  <label className="flex items-center cursor-pointer">
    <input
      type="radio"
      value="no"
      className="hidden peer"
    />
    <span className="peer-checked:bg-slate-700 peer-checked:text-white peer-checked:border-slate-700 
                   border border-input px-4 py-2 rounded-lg transition hover:bg-accent">
      No
    </span>
  </label>
</div>
```

### Checkbox Group (Correct Standard - Subtle Unselected)

```tsx
<div className="flex flex-wrap gap-2">
  {options.map((option) => (
    <div key={option.id}>
      <input
        type="checkbox"
        id={`option-${option.id}`}
        className="hidden peer"
      />
      <label
        htmlFor={`option-${option.id}`}
        className="peer-checked:bg-slate-700 peer-checked:text-white peer-checked:border-slate-700 
                   border border-border/40 rounded-lg px-4 py-2 cursor-pointer 
                   bg-background text-muted-foreground transition hover:bg-muted/50 hover:border-border"
      >
        {option.label}
      </label>
    </div>
  ))}
</div>
```

**Why this approach?**
- Unselected items blend into the background (not distracting)
- Selected items clearly stand out with dark slate background
- Hover provides subtle feedback without being aggressive
- Perfect for forms with many options (toiletries, amenities, etc.)

### Primary Button vs Link

```tsx
{/* Primary Action - Use primary color */}
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Create Hotel
</Button>

{/* Navigation Link - Use foreground with primary hover */}
<Link className="text-foreground hover:text-primary transition-colors">
  View Details
</Link>
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Using Primary Color for Selections

```tsx
<!-- DON'T DO THIS -->
<span className="peer-checked:bg-primary peer-checked:text-primary-foreground">
```

**Problem:** Too bright, creates visual competition with actual primary actions

### ❌ Using Blue Hardcoded Colors

```tsx
<!-- DON'T DO THIS -->
<button className="bg-blue-500 hover:bg-blue-300">
```

**Problem:** Doesn't respect theme system, inconsistent across app

### ❌ Mixing Color Systems

```tsx
<!-- DON'T DO THIS -->
<span className="peer-checked:bg-blue-500 text-primary border-slate-700">
```

**Problem:** Mixing hardcoded colors with theme tokens creates inconsistency

---

## 📦 Quick Reference Table

| Use Case | Background | Text | Border | Hover |
|----------|-----------|------|--------|-------|
| **Selected Radio/Checkbox** | `bg-slate-700` | `text-white` | `border-slate-700` | N/A (already selected) |
| **Unselected Radio/Checkbox** | `bg-background` | `text-muted-foreground` | `border-border/40` | `hover:bg-muted/50 hover:border-border` |
| **Primary Button** | `bg-primary` | `text-primary-foreground` | N/A | `hover:bg-primary/90` |
| **Secondary Button** | `bg-transparent` | `text-primary` | `border-primary` | `hover:bg-primary hover:text-primary-foreground` |
| **Navigation Link** | N/A | `text-foreground` | N/A | `hover:text-primary` |
| **Form Input** | `bg-background` | `text-foreground` | `border-input` | `hover:border-primary` |
| **Muted Element** | `bg-muted` | `text-foreground` | `border-input` | `hover:bg-accent` |
| **Success Badge** | `bg-emerald-500/10` | `text-emerald-600` | `border-emerald-200` | N/A |
| **Warning Badge** | `bg-amber-50` | `text-amber-600` | `border-amber-200` | N/A |

---

## ✅ Enforcement Checklist

Before committing code with color changes, verify:

- [ ] Selection states use `bg-slate-700`, not `bg-primary`
- [ ] Primary actions (buttons) use `bg-primary`
- [ ] No hardcoded blue colors (`bg-blue-500`, `text-blue-300`)
- [ ] Hover states use `hover:bg-accent` or `hover:bg-primary/90`
- [ ] Borders use `border-input` or `border-primary`
- [ ] Text uses `text-foreground`, `text-muted-foreground`, or `text-primary`

---

## 🔄 Version History

### v1.0 (October 6, 2025)
- Initial color standard established
- Corrected selection states from `bg-primary` to `bg-slate-700`
- Documented all color use cases
- Added visual hierarchy rules

---

## 📚 Related Documentation

- [ui-design-system.md](./ui-design-system.md) - Full design system specs
- [color-consistency-fixes.md](./color-consistency-fixes.md) - Implementation history

---

**Remember:** Consistency is key to professional UI. When in doubt, refer to this document!
