# Hotel Management System - UI Standards

This document defines the consistent UI patterns used across the admin panel.

## 🎨 Design Tokens

### Border Radius
- **Cards**: `rounded-lg` (0.5rem / 8px)
- **Buttons**: `rounded-lg` (default from shadcn)
- **Inputs**: `rounded-lg` (default from shadcn)
- **Badges**: `rounded-full` or `rounded-lg`
- **Modals**: `rounded-2xl` for large modals, `rounded-lg` for small dialogs

### Borders
- **Default card borders**: `border border-border/50`
- **Hover states**: `hover:border-primary/50`
- **Input borders**: `border-input` (from shadcn)

### Shadows
- **Cards (elevated)**: `shadow-sm hover:shadow-md transition-shadow`
- **Modals**: `shadow-xl`
- **Stat cards**: `shadow-xl backdrop-blur`

### Spacing
- **Page padding**: `p-4 md:p-8 pt-6`
- **Card padding**: `p-6`
- **Section gaps**: `space-y-4` or `gap-4`
- **Grid gaps**: `gap-4`

## 🧩 Component Patterns

### Page Header
```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
    <p className="text-muted-foreground">
      Page description
    </p>
  </div>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Action Button
  </Button>
</div>
```

### Stat/Metric Cards
```tsx
<Card className="relative overflow-hidden border border-border/50 bg-background/70 shadow-sm">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">Label</CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-semibold text-foreground">Value</p>
    <p className="text-xs text-muted-foreground">Helper text</p>
  </CardContent>
</Card>
```

### Data Table Cards
```tsx
<Card className="border border-border/50 shadow-sm">
  <CardContent className="pt-6">
    <Table>
      {/* table content */}
    </Table>
  </CardContent>
</Card>
```

### Info Banners
```tsx
// Success/Available state
<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
  <p className="text-sm text-green-800">Message</p>
</div>

// Warning/Info state
<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
  <p className="text-sm text-blue-800">Message</p>
</div>

// Error state
<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
  <p className="text-sm text-red-800">Message</p>
</div>
```

## 💰 Currency & Numbers

### Display Format
- **Always use**: `toLocaleString()` for display
- **Format**: `250'000₮` (apostrophe separator)
- **Never use**: Static `$` symbols - use `₮` for Tugrik

### Icons for Money
```tsx
import { DollarSign } from 'lucide-react'; // Use for price-related items
// Or use tabler icons for consistency
import { IconCurrencyDollar } from "@tabler/icons-react";
```

## 🎯 Icon System

**Primary Icon Library**: `lucide-react` for UI elements
**Alternative**: `@tabler/icons-react` for dashboard/stats (already in use)

### Common Icons
- Money/Price: `DollarSign` or `IconCurrencyDollar`
- Calendar/Date: `Calendar` or `IconCalendar`
- Users/People: `Users` or `IconUsers`
- Rooms: `Building2`, `Bed`, `IconBed`
- Actions: `Plus`, `Edit`, `Trash2`, `RefreshCw`

## 🌐 Translation Strategy

### Use i18n Consistently
```tsx
// ✅ Correct
const t = useTranslations('PageName');
<h1>{t('title')}</h1>

// ❌ Incorrect
<h1>Өрөөний үнэ</h1> // Hardcoded Mongolian
```

### Translation Keys Structure
```
PageName.title
PageName.description
PageName.actions.add
PageName.actions.edit
PageName.fields.price
PageName.messages.success
```

## 🎨 Color Usage

### Semantic Colors
- **Primary**: Brand color (blue)
- **Success**: `text-green-600`, `bg-green-50`, `border-green-200`
- **Warning**: `text-yellow-600`, `bg-yellow-50`, `border-yellow-200`
- **Error/Destructive**: `text-red-600`, `bg-red-50`, `border-red-200`
- **Info**: `text-blue-600`, `bg-blue-50`, `border-blue-200`

### Text Colors
- **Primary text**: `text-foreground`
- **Secondary text**: `text-muted-foreground`
- **Labels**: `text-sm font-medium`

## ✅ Button Standards

### Primary Actions
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  <Plus className="mr-2 h-4 w-4" />
  Text
</Button>
```

### Secondary Actions
```tsx
<Button variant="outline">
  <Edit className="h-4 w-4 mr-2" />
  Text
</Button>
```

### Destructive Actions
```tsx
<Button variant="destructive">
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>
```

### Icon-only Buttons
```tsx
<Button variant="ghost" size="icon">
  <Edit className="h-4 w-4" />
</Button>
```

## 📋 Form Standards

### Input Fields
```tsx
<div className="space-y-2">
  <Label htmlFor="field">{t('fieldLabel')}</Label>
  <Input
    id="field"
    type="text"
    placeholder={t('fieldPlaceholder')}
  />
</div>
```

### Required Fields
```tsx
<Label htmlFor="field">
  {t('fieldLabel')} <span className="text-red-500">*</span>
</Label>
```

## 🚨 Empty States

```tsx
<div className="text-center py-8">
  <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-2 text-sm font-semibold text-foreground">
    {t('emptyState.title')}
  </h3>
  <p className="mt-1 text-sm text-muted-foreground">
    {t('emptyState.description')}
  </p>
</div>
```

## 📱 Responsive Grid

```tsx
// For stat cards
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// For content cards
<div className="grid gap-4 md:grid-cols-2">
```

## 🔄 Loading States

```tsx
<div className="flex items-center justify-center h-32">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
</div>
```

---

**Last Updated**: 2025-01-27
**Version**: 1.0
