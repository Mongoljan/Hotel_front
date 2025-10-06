# Room Table Redesign - Simplified & Clean

## Current Problems (from screenshot):
1. ❌ Room count shows 7 instead of 5
2. ❌ Shows 3 duplicate images when only 1 was uploaded  
3. ❌ Too much text - room descriptions clutter the view
4. ❌ Misaligned columns - headers don't match data
5. ❌ Group row counted as room (it's just a header)

## Proposed Solution - Clean Minimal Table:

### Columns (Simplified):
1. **▼** - Expand/collapse arrow (48px)
2. **Зураг** - Single thumbnail image (80px)
3. **Өрөө** - Room number + category (flex: 1.5)
4. **Хэмжээ** - Size in m² (80px)
5. **Хүмүүс** - Adult/Child capacity icons (100px)
6. **Үнэ** - Price/Status (120px)
7. **Үйлдэл** - Edit/Delete (80px)

### Group Row (Collapsed):
```
▶  [img] Standard Room • 12.20 m²  👤2  💰  
```

### Child Rows (Expanded):
```
▶  [img] Standard Room • 12.20 m²  👤2  💰
   [img] №101         12.20 m²       👤2 👶1  ₮150,000  [✏️][🗑️]
   [img] №102         12.20 m²       👤2 👶1  ₮150,000  [✏️][🗑️]
   [img] №103         12.20 m²       👤2 👶1  ₮150,000  [✏️][🗑️]
```

### Key Changes:
- **Remove room descriptions** from table (show in modal/detail view)
- **Single image** per row (not 3 duplicates)
- **Compact icons** instead of text
- **Fixed widths** for alignment
- **Group row** is visual only (not counted)
- **Clean spacing** - no cramming

### Room Count Fix:
```typescript
// Current (WRONG - counts all rows including groups):
totalInventory = rawRooms.length // 7 (includes 2 group rows)

// Correct (only count actual rooms):
totalInventory = rawRooms.reduce((acc, room) => 
  acc + (room.number_of_rooms ?? 0), 0
) // 5 (only leaf rooms)
```

### Image Fix (Already Applied):
```typescript
// Only take first image from each room (no duplicates)
const uniqueImages = Array.from(
  new Set(
    group.rooms
      .map((room) => room.images[0]?.image)
      .filter(Boolean)
  )
).slice(0, 1); // Show only 1 image in group
```

## Implementation Plan:
1. Redesign columns to be minimal
2. Fix room count calculation
3. Remove descriptions from table cells
4. Use fixed widths for alignment
5. Show only 1 image per group
6. Add tooltips for additional info

