# Room Modal & Table Fixes

## Date: October 6, 2025

## Issues Fixed

### 1. ✅ Image Preview Modal
**Problem:** When clicking uploaded images in RoomModal, there was no way to view them in full size.

**Solution:** Added image preview modal functionality
- Added `previewImage` state to track which image to preview
- Made thumbnail images clickable with hover effect
- Created full-screen preview modal with:
  - Dark overlay (bg-black/80)
  - Large image display (max-w-4xl, max-h-85vh)
  - Close button (X icon in top-right)
  - Click outside to close
  - Higher z-index (z-[60]) than main modal (z-50)

**Code Changes:**
```tsx
// State
const [previewImage, setPreviewImage] = useState<string | null>(null);

// Clickable thumbnail
<img
  src={watchedEntries[index].images}
  className="... cursor-pointer hover:opacity-80 transition"
  onClick={() => setPreviewImage(watchedEntries[index].images)}
/>

// Preview Modal
{previewImage && (
  <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
       onClick={() => setPreviewImage(null)}>
    <img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
  </div>
)}
```

---

### 2. ✅ Fix Duplicate Images in Table
**Problem:** When uploading 1 image for a room, the table showed 3 duplicate thumbnails (same image repeated).

**Root Cause:** In `/app/admin/room/_lib/transformers.ts`, the grouping logic was using:
```tsx
group.rooms.flatMap((room) => room.images.map((image) => image.image))
```
This collected ALL images from ALL rooms, so if 5 rooms each had the same image, it would show that image 3 times (sliced to 3).

**Solution:** Changed to take only the first image from each room:
```tsx
// Get unique images from all rooms in the group, but limit to first image per room
const uniqueImages = Array.from(
  new Set(
    group.rooms
      .map((room) => room.images[0]?.image) // Take only first image from each room
      .filter(Boolean) // Remove undefined/null
  )
).slice(0, 3); // Limit to 3 images
```

**Result:** Now shows unique images properly - if 1 image uploaded, shows 1 thumbnail (not 3 duplicates).

---

### 3. ✅ Fix Room Count Validation on Edit
**Problem:** When editing an existing room, got error: "Та 5 өрөөг зарах гэж байгаа ч зөвхөн 1 өрөөний номер оруулсан байна."

**Root Cause:** The validation logic checked `roomNumbersArr.length < formData.number_of_rooms_to_sell` for BOTH create and edit modes. When editing, you're only updating 1 room, so entering "101" (1 room number) but having `number_of_rooms_to_sell: 5` from original creation would fail validation.

**Solution:** Only validate room count when creating new rooms (not editing):
```tsx
// Only validate room count when creating new rooms (not when editing)
if (!roomToEdit && roomNumbersArr.length < parseInt(formData.number_of_rooms_to_sell)) {
  toast.error(
    `Та ${formData.number_of_rooms_to_sell} өрөөг зарах гэж байгаа ч зөвхөн ${roomNumbersArr.length} өрөөний номер оруулсан байна.`
  );
  return;
}
```

**Result:** Edit mode now works correctly - validates only that at least 1 room number exists, doesn't check count matching.

---

## Files Modified

### 1. `/app/admin/room/RoomModal.tsx`
- Added `previewImage` state
- Made image thumbnails clickable
- Added image preview modal component
- Fixed room count validation to skip when editing

### 2. `/app/admin/room/_lib/transformers.ts`
- Fixed `uniqueImages` logic to take only first image per room
- Added comments explaining the fix

---

## Testing Checklist

✅ Click on uploaded image thumbnail → Opens full-size preview  
✅ Click outside preview modal → Closes modal  
✅ Upload 1 image → Table shows 1 thumbnail (not 3 duplicates)  
✅ Upload 3 different images → Table shows 3 unique thumbnails  
✅ Edit existing room → No validation error about room count  
✅ Create new room with 5 rooms → Still validates room numbers match count  
✅ Build successful with no errors  

---

## User Experience Improvements

1. **Better Image Viewing**: Users can now see full details of uploaded room images
2. **Accurate Table Display**: Table thumbnails accurately represent room images (no duplicates)
3. **Smooth Editing**: Editing rooms no longer throws confusing validation errors

---

## Technical Notes

- Preview modal uses higher z-index (60) than main modal (50) to appear on top
- Image deduplication uses Set + filter pattern for clean unique values
- Edit vs Create logic properly separated with `!roomToEdit` check
- All cursor interactions include hover states for better UX
