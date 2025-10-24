# Room Modal UX Improvements

## Current Issues

1. **Image upload section takes too much space** - needs minimal design
2. **Hard transition between sections** - user can't preview section 2 without completing section 1
3. **Hardcoded texts** - all UI text needs translation
4. **Poor validation UX** - blocking instead of guiding

## Proposed Solution

### 1. Make Image Upload Minimal

**Current:** Large drag-and-drop area
**New:** Compact button-based upload with preview thumbnails

```tsx
{/* Minimal Image Upload */}
<div className="space-y-3">
  <Label>{t('images')}</Label>
  <div className="flex items-start gap-3">
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => fileInputRef.current?.click()}
      className="shrink-0"
    >
      <Upload className="h-4 w-4 mr-2" />
      {t('upload_images')}
    </Button>
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />
    <p className="text-xs text-muted-foreground">
      {t('images_hint')} (PNG, JPG max 5MB)
    </p>
  </div>
  
  {/* Image Thumbnails */}
  {images.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {images.map((img, idx) => (
        <div key={idx} className="relative w-20 h-20 rounded border">
          <img src={img.preview} className="w-full h-full object-cover rounded" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => removeImage(idx)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )}
</div>
```

### 2. Improve Section Navigation UX

**Instead of:** Blocking access to section 2
**Do:** Show both sections with visual indicators and helpful tooltips

```tsx
{/* Section Tabs with Progress */}
<div className="flex gap-2 mb-6 border-b">
  <button
    onClick={() => setStep(1)}
    className={cn(
      "pb-3 px-4 text-sm font-medium border-b-2 transition-colors",
      step === 1
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    )}
  >
    <div className="flex items-center gap-2">
      {isSection1Complete ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs">
          1
        </span>
      )}
      {t('basic_info')}
    </div>
  </button>
  
  <button
    onClick={() => {
      if (!isSection1Complete) {
        toast.info(t('complete_basic_first'), {
          description: t('fill_required_fields')
        });
        return;
      }
      setStep(2);
    }}
    className={cn(
      "pb-3 px-4 text-sm font-medium border-b-2 transition-colors relative",
      step === 2
        ? "border-primary text-primary"
        : isSection1Complete
        ? "border-transparent text-muted-foreground hover:text-foreground"
        : "border-transparent text-muted-foreground/50 cursor-not-allowed"
    )}
  >
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs">
        2
      </span>
      {t('amenities')}
      {!isSection1Complete && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {t('locked')}
        </Badge>
      )}
    </div>
  </button>
</div>

{/* Show tooltips for incomplete sections */}
{step === 1 && !isSection1Complete && (
  <Alert className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {t('required_fields_hint')}: {getMissingFields().join(', ')}
    </AlertDescription>
  </Alert>
)}
```

### 3. Add All Translations

Add to `/messages/mn.json`:

```json
{
  "RoomModal": {
    "title_add": "Өрөө нэмэх",
    "title_edit": "Өрөө засах",
    "basic_info": "Үндсэн мэдээлэл",
    "amenities": "Тохижилт",
    "room_numbers": "Өрөөний дугаар",
    "room_numbers_hint": "Хэд хэдэн өрөө нэгэн зэрэг нэмэхдээ таслалаар тусгаарлана уу (жишээ: 101,102,103)",
    "room_type": "Өрөөний төрөл",
    "bed_type": "Орны төрөл",
    "capacity": "Багтаамж",
    "floor": "Давхар",
    "category": "Ангилал",
    "description": "Тайлбар",
    "description_placeholder": "Өрөөний тухай дэлгэрэнгүй мэдээлэл...",
    "images": "Зургууд",
    "upload_images": "Зураг оруулах",
    "images_hint": "Зарга оруулах",
    "facilities": "Тохижилт",
    "bathroom": "Угаалгын өрөө",
    "toiletries": "Ариун цэврийн хэрэгсэл",
    "food_drink": "Хоол, ундаа",
    "view": "Байршил ба үзэмж",
    "complete_basic_first": "Эхний хэсгийг бөглөнө үү",
    "fill_required_fields": "Үндсэн мэдээллийг бүрэн бөглөснөөр дараагийн хэсэг нээгдэнэ",
    "required_fields_hint": "Дутуу талбарууд",
    "locked": "Түгжээтэй",
    "save": "Хадгалах",
    "cancel": "Цуцлах",
    "saving": "Хадгалж байна...",
    "next": "Дараах",
    "back": "Буцах",
    "success_created": "Өрөө амжилттай нэмэгдлээ",
    "success_updated": "Өрөө амжилттай шинэчлэгдлээ",
    "error_create": "Өрөө нэмэхэд алдаа гарлаа",
    "error_update": "Өрөө шинэчлэхэд алдаа гарлаа"
  }
}
```

Add to `/messages/en.json`:

```json
{
  "RoomModal": {
    "title_add": "Add Room",
    "title_edit": "Edit Room",
    "basic_info": "Basic Information",
    "amenities": "Amenities",
    "room_numbers": "Room Numbers",
    "room_numbers_hint": "Separate with commas to add multiple rooms (e.g., 101,102,103)",
    "room_type": "Room Type",
    "bed_type": "Bed Type",
    "capacity": "Capacity",
    "floor": "Floor",
    "category": "Category",
    "description": "Description",
    "description_placeholder": "Detailed room information...",
    "images": "Images",
    "upload_images": "Upload Images",
    "images_hint": "Upload images",
    "facilities": "Facilities",
    "bathroom": "Bathroom",
    "toiletries": "Toiletries",
    "food_drink": "Food & Drink",
    "view": "Location & View",
    "complete_basic_first": "Complete basic info first",
    "fill_required_fields": "Fill all required fields to unlock next section",
    "required_fields_hint": "Missing fields",
    "locked": "Locked",
    "save": "Save",
    "cancel": "Cancel",
    "saving": "Saving...",
    "next": "Next",
    "back": "Back",
    "success_created": "Room created successfully",
    "success_updated": "Room updated successfully",
    "error_create": "Failed to create room",
    "error_update": "Failed to update room"
  }
}
```

### 4. Helper Function for Validation

```tsx
const getMissingFields = () => {
  const missing = [];
  if (!watch('room_number') || watch('room_number').length === 0) missing.push(t('room_numbers'));
  if (!watch('room_type')) missing.push(t('room_type'));
  if (!watch('bed_types') || watch('bed_types').length === 0) missing.push(t('bed_type'));
  if (!watch('max_occupancy')) missing.push(t('capacity'));
  if (!watch('floor')) missing.push(t('floor'));
  return missing;
};

const isSection1Complete = useMemo(() => {
  return getMissingFields().length === 0;
}, [watch('room_number'), watch('room_type'), watch('bed_types'), watch('max_occupancy'), watch('floor')]);
```

## Implementation Steps

1. ✅ Add translations to mn.json and en.json
2. Import useTranslations in RoomModal
3. Replace all hardcoded text with t('key')
4. Implement minimal image upload UI
5. Add tab-based section navigation
6. Add validation helper and tooltips
7. Test UX flow

## Benefits

- ✅ **Cleaner UI** - Minimal image upload saves space
- ✅ **Better UX** - Users can see what's coming without feeling blocked
- ✅ **Guided Flow** - Helpful tooltips instead of hard blocks
- ✅ **Fully Translated** - No hardcoded text
- ✅ **Professional** - Modern tabbed interface with progress indicators
