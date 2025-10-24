# Hardcoded Text Audit & Translation Mapping

**Date:** 2025-01-22  
**Purpose:** Identify and map all hardcoded text that needs translation

## Room Management

### Add Room Modal (`/app/admin/room/RoomModal.tsx`)
**Status:** 🔴 Needs Work

**Hardcoded Texts Found:**
- Section headers (need minimal redesign)
- Form labels
- Button texts
- Validation messages
- Tooltips

**Translation Keys Needed:**
```json
{
  "RoomModal": {
    "title_add": "Өрөө нэмэх",
    "title_edit": "Өрөө засах",
    "section_basic": "Үндсэн мэдээлэл",
    "section_images": "Зургууд",
    "room_number": "Өрөөний дугаар",
    "room_type": "Өрөөний төрөл",
    "capacity": "Багтаамж",
    "floor": "Давхар",
    "description": "Тайлбар",
    "images_upload": "Зураг оруулах",
    "images_drag_drop": "Файлаа энд чирж оруулах эсвэл сонгох",
    "images_formats": "PNG, JPG (max. 5MB)",
    "required_fields": "Шаардлагатай талбаруудыг бөглөнө үү",
    "validation_incomplete": "Эхний хэсгийг бөглөснөөр хоёр дахь хэсэг харагдана",
    "save": "Хадгалах",
    "cancel": "Цуцлах",
    "saving": "Хадгалж байна..."
  }
}
```

### Room Price List (`/app/admin/room/price/RoomPriceList.tsx`)
**Status:** ✅ Mostly OK

### Room Price Settings (`/app/admin/room/price-settings/page.tsx`)
**Status:** ✅ OK

## Hotel Registration Flow

### Step 1 - Property Basic Info
**Status:** ✅ Using translations

### Step 2 - Address
**Status:** ✅ Using translations (fixed)

### Step 3 - Location
**Status:** ✅ Using translations

### Step 4 - Property Policies
**Status:** ✅ Using translations

### Step 5 - Property Images
**Status:** 🟡 Partial - some hardcoded

### Step 6 - Property Details
**Status:** 🟡 Partial - some hardcoded

## Admin Pages

### Hotel Page (`/app/admin/hotel/page.tsx`)
**Status:** 🟡 Partial

**Hardcoded Texts:**
- "Өрөөний тоо" → Should be t('total_rooms')
- "Эхэлсэн огноо" → Should be t('start_date')
- "Хүүхэд" → Should be t('children')
- "Буудлын ID" → Should be t('hotel_id')

### SixStepInfo (`/app/admin/hotel/SixStepInfo.tsx`)
**Status:** 🟡 Partial

### Dashboard
**Status:** 🟡 Needs audit

## Priority Action Items

1. **HIGH: Room Modal Redesign**
   - Make image section minimal (collapsible or side-by-side)
   - Add tooltip for incomplete sections
   - Add all translations

2. **MEDIUM: Complete hotel page translations**
   - Replace hardcoded stats labels
   - Add to HotelPage translation namespace

3. **LOW: Audit remaining pages**
   - Dashboard
   - Employee management
   - Settings

## Best Practices

1. **Always use translation keys** - Never hardcode user-facing text
2. **Namespace properly** - Use component/page name as namespace
3. **Fallback values** - Always provide fallback: `t('key') || 'Fallback'`
4. **Consistent naming** - Use snake_case for translation keys
5. **Group related** - Keep related translations together in JSON
