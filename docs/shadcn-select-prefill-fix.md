# shadcn/ui Select Dropdown Pre-fill Fix

## Problem
When using shadcn/ui `Select` component with controlled values (react-hook-form or useState), the dropdown doesn't show pre-selected values when opening an edit modal, even though the form data is correctly set.

## Root Cause
- shadcn/ui Select component doesn't properly update when the controlled `value` prop changes after the component has already mounted
- Using both `value` and `defaultValue` creates conflicts between controlled/uncontrolled behavior
- Empty strings can cause the Select to show as "empty" even when a value exists

## Solution Pattern

### For react-hook-form (with watch/setValue)
```tsx
<Select 
  key={`field-name-${editId || 'new'}-${watch("field_name")}`}  // Enhanced key includes current value
  onValueChange={(value) => setValue("field_name", value)} 
  value={watch("field_name") || undefined}  // Use undefined instead of empty string
>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {options.map((option) => (
      <SelectItem key={option.id} value={option.id.toString()}>
        {option.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### For useState
```tsx
<Select
  key={`field-name-${editId || 'new'}-${formData.field_name}`}  // Enhanced key includes current value
  value={formData.field_name || undefined}  // Use undefined instead of empty string
  onValueChange={(value) => setFormData({ ...formData, field_name: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {options.map((option) => (
      <SelectItem key={option.id} value={option.id.toString()}>
        {option.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Key Points

### ✅ DO:
1. **Enhanced key prop**: Include both edit ID AND current value
   - Pattern: `key={field-${editId}-${currentValue}}`
   - Forces React to create a new component instance when value changes

2. **Use undefined for empty values**: `value={currentValue || undefined}`
   - Never use empty string `""` as it can cause display issues

3. **Remove defaultValue**: Don't use `defaultValue` with controlled Select
   - Creates conflict between controlled and uncontrolled behavior

4. **Ensure proper data population**: Use useEffect to reset form when edit data changes
   ```tsx
   useEffect(() => {
     if (editData) {
       reset({
         field_name: String(editData.field_name),  // Convert to string
         // ... other fields
       });
     }
   }, [editData, reset]);
   ```

### ❌ DON'T:
1. **Don't use only edit ID in key**: `key={field-${editId}}` (insufficient)
2. **Don't use both value and defaultValue**: Creates conflicts
3. **Don't use empty string**: `value={currentValue || ""}` (causes issues)
4. **Don't forget string conversion**: Select values must be strings

## Real-World Examples

### Example 1: Room Edit Modal (RoomModal.tsx)
```tsx
// Room Type Select
<Select 
  key={`room_type-${roomToEdit?.id || 'new'}-${watch("room_type")}`}
  onValueChange={(value) => setValue("room_type", value)} 
  value={watch("room_type") || undefined}
>
  <SelectTrigger>
    <SelectValue placeholder="-- Сонгох --" />
  </SelectTrigger>
  <SelectContent>
    {combinedData.roomTypes.map((rt) => (
      <SelectItem key={rt.id} value={rt.id.toString()}>
        {rt.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Form reset logic
useEffect(() => {
  if (roomToEdit) {
    reset({
      room_type: String(roomToEdit.room_type),
      room_category: String(roomToEdit.room_category),
      bed_type: String(roomToEdit.bed_type),
      // ... other fields
    });
  } else {
    reset({
      room_type: '',
      room_category: '',
      bed_type: '',
      // ... other fields
    });
  }
}, [roomToEdit, reset]);
```

### Example 2: Price Settings Modal (PriceSettingModal.tsx)
```tsx
// Room Combination Select
<Select
  key={`room-combo-${editData?.id || 'new'}-${formData.room_combination}`}
  value={formData.room_combination || undefined}
  onValueChange={(value) => setFormData({ ...formData, room_combination: value })}
>
  <SelectTrigger className="border-input">
    <SelectValue placeholder="Өрөөний бүлэг сонгох" />
  </SelectTrigger>
  <SelectContent>
    {roomOptions.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// State update logic
useEffect(() => {
  if (editData) {
    setFormData({
      name: editData.name,
      room_combination: `${editData.room_type}-${editData.room_category}`,
      start_date: editData.start_date,
      end_date: editData.end_date,
      adjustment_type: editData.adjustment_type,
      value_type: editData.value_type,
      value: String(editData.value),
      is_active: editData.is_active,
    });
  } else {
    setFormData({
      name: '',
      room_combination: '',
      start_date: '',
      end_date: '',
      adjustment_type: 'ADD',
      value_type: 'PERCENT',
      value: '',
      is_active: true,
    });
  }
}, [editData]);
```

## Why This Works

1. **Enhanced key prop**: When the value changes, the key changes, forcing React to:
   - Unmount the old Select component
   - Mount a new Select component with the updated value
   - This bypasses shadcn's internal state management issues

2. **undefined vs empty string**: 
   - `undefined` tells Select "no value selected yet"
   - Empty string `""` can be interpreted as a valid selection
   - Select can render incorrectly with empty strings

3. **No defaultValue conflict**:
   - `defaultValue` = uncontrolled (initial value only)
   - `value` = controlled (updates on every change)
   - Using both creates ambiguity in component behavior

## Testing Checklist

After applying this fix, verify:

- [ ] Create modal: All dropdowns empty/show placeholders
- [ ] Edit modal: All dropdowns show pre-selected values
- [ ] Change dropdown: Value updates correctly in form
- [ ] Save changes: Updated values persist
- [ ] Switch between create/edit: No stale values shown
- [ ] Multiple selects in same form: All work independently

## Affected Components

This fix has been applied to:
- `/app/admin/room/RoomModal.tsx` (room_type, room_category, bed_type)
- `/app/admin/room/price-settings/PriceSettingModal.tsx` (room_combination)

## Alternative Approaches (if this fails)

If the above solution doesn't work, try:

1. **Fully uncontrolled approach**:
   ```tsx
   <Select defaultValue={value} onValueChange={onChange}>
   ```
   Reset modal state completely between edit/create modes.

2. **Custom Select wrapper**:
   Create a wrapper component that handles the remounting logic internally.

3. **Native select element**:
   ```tsx
   <select value={value} onChange={(e) => onChange(e.target.value)}>
   ```
   Less styling but guaranteed to work with controlled values.

## Related Fixes

### Room Price Edit - Prices Array Empty Bug
**File**: `app/admin/room/price/RoomPriceList.tsx`

**Problem**:
- Clicking edit on a row with price shows "Үнийн мэдээлэл олдсонгүй" error
- Debug logs show `prices` array is empty (`Array(0)`)
- Row has valid `id` (e.g., 29) indicating price exists in database

**Root Cause**:
When loading data from localStorage cache, the code was setting `rows` state but NOT setting `prices` state. This caused the `handleEdit` function to search in an empty array.

**Solution**:
```typescript
// Before (BROKEN):
if (lookupCache && roomsCache && priceCache && !isRoomAdded) {
  setLookup(JSON.parse(lookupCache));
  const roomsData = JSON.parse(roomsCache);
  const prices: PriceEntry[] = JSON.parse(priceCache);
  setRows(buildRows(JSON.parse(lookupCache), roomsData, prices));
  // ❌ Missing: setPrices(prices)
  setLoading(false);
  return;
}

// After (FIXED):
if (lookupCache && roomsCache && priceCache && !isRoomAdded) {
  const allData = JSON.parse(lookupCache);
  const roomsData = JSON.parse(roomsCache);
  const pricesData: PriceEntry[] = JSON.parse(priceCache);
  
  setLookup(allData);
  setPrices(pricesData); // ✅ CRITICAL: Set prices state from cache
  setRows(buildRows(allData, roomsData, pricesData));
  setLoading(false);
  return;
}
```

**Impact**:
- ✅ Edit button now works correctly when loading from cache
- ✅ Prices array properly populated
- ✅ No more "price not found" errors on valid data

---

### Room Price Create/Update - Missing Token Bug
**File**: `app/admin/room/price/RoomPriceList.tsx`

**Problem**:
- Creating or updating room prices shows error: `{error: "Token шаардлагатай."}`
- API rejects request due to missing authentication token

**Root Cause**:
Both `createPrice` and `updatePrice` functions were fetching the token but NOT including it in the API request URL.

**Solution**:

**Create Price Fix:**
```typescript
// Before (BROKEN):
const response = await fetch("https://dev.kacc.mn/api/room-prices/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hotel, ...form }),
});

// After (FIXED):
const response = await fetch(
  `https://dev.kacc.mn/api/room-prices/?token=${encodeURIComponent(token)}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hotel, ...form }),
  }
);
```

**Update Price Fix:**
```typescript
// Before (BROKEN):
const response = await fetch(`https://dev.kacc.mn/api/room-prices/${editingPrice.id}/`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hotel, ...form }),
});

// After (FIXED):
const response = await fetch(
  `https://dev.kacc.mn/api/room-prices/${editingPrice.id}/?token=${encodeURIComponent(token)}`,
  {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hotel, ...form }),
  }
);
```

**Additional Improvements**:
- Better error handling with error message from API response
- Type-safe error handling with `err: any`
- Display actual API error messages to user

**Impact**:
- ✅ Create room price works with authentication
- ✅ Update room price works with authentication
- ✅ No more "Token шаардлагатай" errors
- ✅ Better error messages for users

---

### Room Table Image Display Issues
**Files**: `RoomListNew.tsx`, `_lib/transformers.ts`

**Problems**:
1. Empty/placeholder images showing in table even when not uploaded
2. Broken table layout with images
3. No fallback for missing images

**Solutions**:
1. **Filter empty images in transformers**:
   ```typescript
   const uniqueImages = Array.from(
     new Set(
       group.rooms.flatMap((room) => 
         room.images
           .map((image) => image.image)
           .filter((url) => url && url.trim() !== '') // Filter out empty
       )
     )
   ).slice(0, 3);
   ```

2. **Improved table cell rendering**:
   - Show placeholder icon when no images
   - Fixed width with flex-shrink-0 to prevent layout breaks
   - Added max-width container with flex-wrap
   - Image error handling (onError)
   - Hover effects for better UX
   - Clickable "+X" badge to view more images

3. **Better layout control**:
   - Column size increased to 220px
   - Images limited to 3 visible + counter
   - Responsive wrapping if needed

---

## 404 and Under Development Pages

### Custom 404 Page
**File**: `app/not-found.tsx`

**Features**:
- Beautiful animated design with Construction icon
- Bilingual (Mongolian + English)
- "Under Development" badge with pulse animation
- Back and Home navigation buttons
- Responsive layout with gradient background
- Accessible and user-friendly

**Auto-triggered when**:
- User navigates to non-existent route
- Page doesn't exist in the app

---

### Reusable UnderDevelopment Component
**File**: `components/UnderDevelopment.tsx`

**Purpose**: Show "under development" message for pages that aren't ready yet

**Usage**:
```tsx
import UnderDevelopment from "@/components/UnderDevelopment";

export default function YourPage() {
  return (
    <UnderDevelopment
      title="Custom Title"
      description="Custom description about this feature"
      showBackButton={true}
      showHomeButton={true}
    />
  );
}
```

**Props**:
- `title?: string` - Main heading (default: "Энэ хуудас хөгжүүлэлтийн шатандаа байна")
- `description?: string` - Description text
- `showBackButton?: boolean` - Show back button (default: true)
- `showHomeButton?: boolean` - Show home button (default: true)

**Example**:
See `/app/example-under-dev/page.tsx` for implementation example

**Features**:
- 3 animated icons (Hammer, Code, Wrench)
- Feature cards showing development status
- Timeline indicator
- Customizable content
- Consistent with app design system

---

## Date Created
January 8, 2025

## Last Updated
January 8, 2025
