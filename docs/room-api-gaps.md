# Room Management — API Gaps

This document lists the fields and endpoints the new `/admin/room` UI design requires that are **not yet present in the backend** (`https://dev.kacc.mn`). Each gap is categorised A–D and includes a proposed request/response contract for the backend team.

---

## Current Working APIs (verified)

| Method | BFF Route | Backend | Purpose |
|--------|-----------|---------|---------|
| GET | `/api/roomsNew` | `/api/roomsNew/` | List all room groups for the authenticated hotel |
| POST | `/api/roomsNew` | `/api/roomsNew/` | Create a new room group |
| PATCH | `/api/roomsNew` / `/api/roomsNew/[id]` | `/api/roomsNew/{id}/` | Partially update a room group |
| DELETE | `/api/roomsNew` | `/api/roomsNew/{id}/` | Delete a room group |
| POST | `/api/roomsNew/transfer` | `/api/roomsNew/transfer/` | Move room numbers between groups |
| GET | `/api/lookup` | `/api/all-data/` | Fetch all reference/lookup data |

### Current `RoomGroup` response shape (GET `/api/roomsNew/`)

```json
{
  "id": 42,
  "hotel": 7,
  "room_type": 6,
  "room_category": 3,
  "room_size": "30",
  "group_beds": [
    { "bed_type": 41, "bed_size": { "id": 22, "size": "90 x 200 cm" }, "quantity": 1 }
  ],
  "is_Bathroom": true,
  "room_Facilities": [47, 53],
  "bathroom_Items": [1, 2],
  "free_Toiletries": [3],
  "food_And_Drink": [3],
  "outdoor_And_View": [3],
  "adultQty": 1,
  "childQty": 0,
  "number_of_rooms": 5,
  "number_of_rooms_to_sell": 5,
  "room_Description": "Standard single room with city view.",
  "smoking_allowed": false,
  "room_numbers": [101, 102, 103, 104, 105],
  "images": [
    { "id": 1, "image": "https://dev.kacc.mn/media/rooms/img.jpg", "description": "Bedroom" }
  ],
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-17T08:00:00Z"
}
```

### Current `/api/all-data/` lookup keys

```
room_types[]       → {id, name, name_mn, is_custom, order}        — 9 types
bed_types[]        → {id, name, is_custom}                         — 9 types
bed_sizes[]        → {id, size, is_custom}                         — 9 sizes
room_facilities[]  → {id, name_en, name_mn}                        — 61 items
bathroom_items[]   → {id, name_en, name_mn}                        — 13 items
free_toiletries[]  → {id, name_en, name_mn}                        — 11 items
food_and_drink[]   → {id, name_en, name_mn}                        — 10 items
outdoor_and_view[] → {id, name_en, name_mn}                        — 7 items
room_category[]    → {id, name_en, name_mn, is_custom, order}      — 12 types
```

---

## Room Type → Bed Constraint Presets

The new form auto-fills bed type, allowed sizes, bed count, and adult capacity when the user selects a room type. The following presets define the constraints:

| Room Type | API id | Bed Type | Bed Size IDs | Default Beds | Default Adults | Manual? |
|-----------|--------|----------|--------------|--------------|----------------|---------|
| Single Room | 6 | Single bed (41) | 22 (90x200), 21 (100x200) | 1 | 1 | No |
| Twin Room | 8 | Single bed (41) | 22 (90x200), 21 (100x200) | 2 | 2 | No |
| Double Room | 7 | Double bed (38) | 19 (140x200), 18 (150x200) | 1 | 2 | No |
| Twin/Double Room | 9 | Double bed (38) | 19 (140x200), 18 (150x200) | 2 | 4 | No |
| Queen Room | 16 | Queen bed (37) | 16 (160x200) | 1 | 2 | No |
| King Room | 15 | King bed (36) | 15 (180x200) | 1 | 2 | No |
| Family Room | 11 | ALL | ALL | manual | manual (required) | Yes |
| Apartment | 13 | ALL | ALL | manual | manual (required) | Yes |
| Triple Room | 10 | ALL | ALL | manual | manual (required) | Yes |

---

## Gap A — Room Short Name (`room_short_name`)

**What the UI needs:** A short internal name for the room group (e.g. `"DD"` for Deluxe Double) shown in the timetable and Front Desk views, separate from the full `room_category + room_type` combination.

**Proposed backend change:**
- Add optional `room_short_name` (varchar, max 50) to the `RoomGroup` model.
- Return it on GET and accept it on POST/PATCH.

**Request** `POST /api/roomsNew/`
```json
{
  "hotel": 7,
  "room_type": 6,
  "room_category": 3,
  "room_short_name": "SS",
  "room_size": "30",
  "group_beds": [...],
  "adultQty": 1,
  "childQty": 0,
  "number_of_rooms": 5,
  "number_of_rooms_to_sell": 5,
  "room_Description": "...",
  "smoking_allowed": false,
  "RoomNo": [101, 102, 103, 104, 105],
  "images": [...]
}
```

**Response** — same as current plus:
```json
{
  "room_short_name": "SS",
  ...
}
```

---

## Gap B — Per-Image Type (`image_type`) + Image Type Lookup

**What the UI needs:** Each room image belongs to a category (e.g. "Орны зураг", "Ариун цэврийн өрөө", "Гал тогоо") so the gallery can be filtered by tab.

**Proposed backend changes:**

1. Add `image_type` (FK to a new `RoomImageType` model, or an integer enum) to the room image model.
2. Either add `image_types[]` to `/api/all-data/` OR expose a new endpoint:

**New endpoint** `GET /api/room-image-types/`
```json
[
  { "id": 1, "name_en": "Bedroom", "name_mn": "Орны өрөө" },
  { "id": 2, "name_en": "Bathroom", "name_mn": "Ариун цэврийн өрөө" },
  { "id": 3, "name_en": "Kitchen", "name_mn": "Гал тогоо" },
  { "id": 4, "name_en": "Living room", "name_mn": "Зочны өрөө" },
  { "id": 5, "name_en": "View", "name_mn": "Байгалийн үзэмж" }
]
```

**Updated image object in `GET /api/roomsNew/`**
```json
{
  "id": 1,
  "image": "https://dev.kacc.mn/media/rooms/img.jpg",
  "description": "Main bedroom",
  "image_type": 1
}
```

**Create/update** — pass `image_type` in the `images` array body field:
```json
"images": [
  { "image": "data:image/jpeg;base64,...", "description": "Bedroom", "image_type": 1 }
]
```

---

## Gap C — Per-Room-Number Rename

**What the UI needs:** Each room number chip in the expanded group row has a pencil icon to rename/edit that physical room number.

**Proposed new endpoint** `PATCH /api/roomsNew/room/`
```json
{
  "group_id": 42,
  "old_number": 101,
  "new_number": 111
}
```

**Response (200)**
```json
{
  "group_id": 42,
  "updated_number": 111,
  "room_numbers": [111, 102, 103, 104, 105]
}
```

**Alternative:** extend the group PATCH to accept a `rename_rooms` array:
```json
PATCH /api/roomsNew/42/
{
  "rename_rooms": [
    { "old": 101, "new": 111 }
  ]
}
```

---

## Gap D — Missing Room Types in `room_types`

The room constraint table references room types not yet in the API. These need to be added as `room_type` entries:

| Name | Bed Type | Bed Size | Beds | Adults |
|------|----------|----------|------|--------|
| Semi Double Room | Semi double bed (39) | 120x200 (id: 20) | 1 | 1 |
| Two Queen Room | Queen bed (37) | 160x200 (id: 16) | 2 | 4 |
| Super King Room | King bed (36) | 200x200 (id: 14) | 1 | 2 |

**Request to backend team:** Add these three entries to the `RoomType` table so they appear in `GET /api/all-data/` → `room_types[]`.

---

## Gap E (Optional) — Dedicated Image Upload Endpoint

Currently images are sent as base64 strings inside the JSON body, which works but is inefficient for large files. If the backend team wants to improve this in the future:

**New endpoint** `POST /api/roomsNew/{id}/images/` (multipart/form-data)
```
image: <file>
description: "Bedroom"
image_type: 1
```

**Response (201)**
```json
{ "id": 5, "image": "https://dev.kacc.mn/media/rooms/img.jpg", "description": "Bedroom", "image_type": 1 }
```

This is optional — the current base64-in-JSON approach continues to work.
