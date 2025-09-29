# Room Management Table Redesign

_Reference screenshot received on 2025-09-29._

## Layout Goals

- **Hierarchical grouping:** Display room types as parent rows with collapsible child entries for individual room numbers.
- **High information density:** Present photo, name, size, amenities, capacities, and housekeeping status in a single viewport without horizontal scrolling on desktop (≥1280px).
- **Icon-driven cues:** Use lucide icons for occupancy, amenities, smoking policy, and actions to reduce text clutter.
- **Quick actions:** Surface edit/delete buttons inline for both parent and child rows; expose “view details” chevron for child expansion.
- **Localized copy:** All headers, tooltips, and badges resolve through `next-intl` keys (`Rooms.*`).

## Column Blueprint

| Segment | Parent row content | Child row content | Notes |
|---------|--------------------|-------------------|-------|
| Preview | 64×64 image placeholder with gradient border | Empty | Use `next/image`; fallback initials block |
| Room name | Title (EN/MN), size, Wi-Fi badge | Room number + view description | Multi-line stack with subtle divider |
| Inventory | “Sold/Total” badge with progress bar | Price plan/room list (comma separated) | Show occupancy bar color-coded |
| Capacity | Team icon + max adults/children | Seat/bed icon counts | Use lucide `Users`, `BedDouble`, etc. |
| Amenities | Checklist of top 3 amenities, tooltip for remainder | Same icons if overridden | Reuse `Badge` variant success |
| Housekeeping | Status chip (e.g., “Clean”, “Needs service”) | Latest housekeeping note | Map to color tokens |
| Actions | Edit + Delete (primary, destructive) buttons | Same, plus duplicate option | Align right, show on hover |

## Interaction Requirements

- Parent rows clickable to toggle children; use `Sheet` for inline detail editing.
- Hover states highlight entire row with soft accent background (`accent/10`).
- Keyboard navigation: left/right arrows collapse/expand, Enter opens sheet.
- Responsive: collapse amenity list to icon-only for widths <1024px; provide horizontal scroll fallback.

## Implementation Steps

1. **Data layer:** Extend API mapper to provide grouped data with locale-ready strings and amenity arrays capped for display.
2. **Component shell:** Create `RoomManagementTable` using `@mui/x-data-grid` while supplying custom row renderers.
3. **Custom slots:** Override `Row`, `Cell`, `Toolbar`, and `NoRowsOverlay` to match the design.
4. **Styling bridge:** Apply theme overrides (`styles/mui-theme.ts`) to inject Tailwind tokens for fonts, colors, radii.
5. **Amenity badges:** Build `AmenityPill` component with icon + label; show tooltip (`Tooltip`) on truncated lists.
6. **Progress indicator:** Integrate `Progress` from shadcn for sold/total bar inside cells.
7. **Testing:** Snapshot parent/child expansion, responsive breakpoints, translation toggles, and keyboard interaction.

## Translation Keys (Draft)

```
"Rooms": {
  "title": "Өрөө бүртгэл",
  "add": "Өрөө нэмэх",
  "columns": {
    "preview": "Зураг",
    "name": "Өрөөний нэр",
    "inventory": "Өрөөний тоо / Зарах тоо",
    "capacity": "Хүний тоо / орны тоо",
    "amenities": "Ерөнхий онцлог зүйлс",
    "housekeeping": "Угаалгын өрөөнд",
    "actions": "Засах"
  },
  "status": {
    "clean": "Цэвэр",
    "needsService": "Үйлчилгээ хэрэгтэй",
    "occupied": "Сууж байна"
  }
}
```

## Migration Notes

- Review commit `fb0970e` for the prior grouped DataGrid logic; reuse grouping math while replacing inline icons and styles.
- Audit `RoomModal` dependencies before refactor; ensure grouped table stays in sync with new sheet-based editor.
- Plan change management: release flag or feature toggle to allow gradual rollout.
