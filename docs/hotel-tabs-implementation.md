# Hotel Admin Tabs Implementation

## Summary
Added three new tabs to the `/admin/hotel` page to display Location, Services, and FAQ information from existing APIs, matching the project's design system.

## Changes Made

### 1. New Tab Components Created

#### LocationTab.tsx (`/app/admin/hotel/LocationTab.tsx`)
- **Purpose**: Display hotel location, address, and contact information
- **Data Sources**: 
  - Address API: `https://dev.kacc.mn/api/confirm-address/?property=${hotelId}`
  - Property base info (location, phone, mail)
  - Google Maps embed from property details
- **Features**:
  - Address details card (location, zip code, total floors, phone)
  - Google Maps iframe embed with external link
  - Contact information card (email, phone)
- **Styling**: Uses shadcn/ui Card, icons from @tabler/icons-react

#### ServicesTab.tsx (`/app/admin/hotel/ServicesTab.tsx`)
- **Purpose**: Display hotel services and facilities
- **Data Sources**:
  - Combined data API: `https://dev.kacc.mn/api/combined-data/` (general_facilities)
  - Property detail general_facilities array (IDs)
- **Features**:
  - Fetches all available facilities from combined-data API
  - Filters to show only facilities that match the hotel's general_facilities IDs
  - Grid layout with check icons
  - Shows both Mongolian (name_mn) and English (name_en) names
- **Styling**: Uses shadcn/ui Card with grid layout and hover effects

#### FAQTab.tsx (`/app/admin/hotel/FAQTab.tsx`)
- **Purpose**: Display frequently asked questions for the hotel
- **Data Sources**:
  - FAQ API: `https://dev.kacc.mn/api/faqs/?property=${hotelId}`
- **Features**:
  - Accordion-style FAQ list
  - Numbered questions with expand/collapse functionality
  - Shows empty state if no FAQs exist
  - Loading state while fetching
- **Styling**: Uses shadcn/ui Accordion component

### 2. Updated SixStepInfo.tsx

**Imports Added**:
```tsx
import LocationTab from './LocationTab';
import ServicesTab from './ServicesTab';
import FAQTab from './FAQTab';
```

**Tab Integration**:
- Updated TabsContent for 'location', 'services', and 'faq' tabs
- Passed appropriate props to each tab component
- Replaced placeholder text with actual components

**Props Passed**:
- LocationTab: `address`, `propertyBaseInfo`, `propertyDetail`
- ServicesTab: `facilityIds` (from propertyDetail.general_facilities), `hotelId`
- FAQTab: `hotelId`

### 3. Dependency Resolution
- Fixed Next.js version conflict with next-auth
- Changed `package.json`: `"next": "15.5.4"` (from canary version)
- Ran `npm install` to resolve peer dependency issues

## API Endpoints Used

1. **Location Data**:
   - `/api/confirm-address/?property=${hotelId}` - Address information
   - Property base info (already loaded) - Location, phone, mail
   - Property detail (already loaded) - Google Maps URL

2. **Services Data**:
   - `/api/combined-data/` - All available facilities
   - Property detail `general_facilities` array - Selected facility IDs

3. **FAQ Data**:
   - `/api/faqs/?property=${hotelId}` - FAQ list for the hotel

## Design System Compliance

All components follow the project's design patterns:
- **Color scheme**: Uses `primary`, `accent`, `muted`, `card` tokens
- **Typography**: Uses project's Cyrillic font classes where applicable
- **Components**: Uses shadcn/ui primitives (Card, Badge, Accordion, etc.)
- **Icons**: Uses @tabler/icons-react (consistent with AboutHotel)
- **Spacing**: Follows project's spacing conventions (space-y-6, gap-4, etc.)
- **Responsive**: Uses md/lg breakpoints for grid layouts

## Build Verification
- ✅ Build completed successfully
- ✅ TypeScript type-checking passed
- ✅ No linting errors
- ✅ All routes generated correctly
- ✅ Admin hotel page size: 31.6 kB (reasonable for the added functionality)

## Testing Recommendations

1. **Location Tab**:
   - Verify Google Maps embed loads correctly
   - Test external link to Google Maps
   - Verify address data displays correctly

2. **Services Tab**:
   - Verify facilities load from API
   - Test with hotels that have many/few facilities
   - Verify empty state if no facilities

3. **FAQ Tab**:
   - Test accordion expand/collapse
   - Verify empty state if no FAQs
   - Test with multiple FAQs

## Future Enhancements (Optional)

1. **Location Tab**:
   - Add edit functionality for address
   - Add distance calculator
   - Show nearby attractions

2. **Services Tab**:
   - Add icons for each facility type
   - Group facilities by category
   - Add edit functionality

3. **FAQ Tab**:
   - Add ability to add/edit/delete FAQs
   - Add search/filter functionality
   - Add categories for FAQs
