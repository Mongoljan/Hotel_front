# Unified Approval System - Implementation Documentation

## Overview
The Unified Approval System provides a streamlined interface for SuperAdmins to approve both hotel owners and their properties together, reflecting the 1:1 relationship between owners and properties in the system.

**Created**: December 2024  
**Status**: Complete (Frontend ready, backend integration pending for property approval)

---

## User Experience Design

### Problem Statement
Previously, SuperAdmins had to:
1. Navigate to separate pages for owners and properties
2. Manually match owners with their properties
3. Approve each entity separately without seeing the relationship
4. Context-switch between pages to understand the full picture

### Solution
A unified approval view that:
- Shows owner + property pairs in expandable cards
- Displays relationship status at a glance with color-coded badges
- Provides flexible approval options: "Approve Both", "Owner Only", "Property Only"
- Allows quick search and filtering across all data
- Presents comprehensive information in a single view

---

## Architecture

### File Structure
```
app/
├── superadmin/
│   ├── approvals/
│   │   └── page.tsx              # Main unified approval page
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard (links to approvals)
│   └── Sidebar.tsx               # Navigation (includes approvals menu)
├── api/
│   └── superadmin/
│       ├── owners/
│       │   └── route.ts          # GET all owners
│       ├── properties/
│       │   └── route.ts          # GET all properties
│       ├── approve-user/
│       │   └── route.ts          # POST approve/revoke owner
│       └── approve-property/
│           └── route.ts          # POST approve/revoke property (ready for backend)
```

### Data Flow

#### 1. Fetching Data
```typescript
// Parallel fetch of owners and properties
const [ownersRes, propertiesRes] = await Promise.all([
  fetch('/api/superadmin/owners'),
  fetch('/api/superadmin/properties'),
]);

// Match by hotel name
const combined = owners.map((owner) => {
  const property = properties.find(
    (p) => p.PropertyName.toLowerCase() === owner.hotel_name.toLowerCase()
  );
  return { owner, property, status };
});
```

#### 2. Status Determination
```typescript
type Status = 
  | 'both-pending'      // Neither approved
  | 'both-approved'     // Both approved
  | 'owner-pending'     // Property approved, owner pending
  | 'property-pending'  // Owner approved, property pending
  | 'orphan'           // No matching property found
```

#### 3. Approval Actions
```typescript
// Approve Both
POST /api/superadmin/approve-user     { owner_pk, approved: true }
POST /api/superadmin/approve-property { property_pk, is_approved: true }

// Approve Owner Only
POST /api/superadmin/approve-user     { owner_pk, approved: true }

// Approve Property Only
POST /api/superadmin/approve-property { property_pk, is_approved: true }

// Revoke (same endpoints with false)
```

---

## UI Components

### 1. Statistics Cards
Four cards showing overview:
- **Total**: Total owner-property pairs
- **Pending** (Orange): Both owner and property pending
- **Partial** (Yellow): One approved, one pending
- **Approved** (Green): Both approved

### 2. Search Bar
- Searches across: owner name, hotel name, email, property name
- Real-time filtering
- Case-insensitive

### 3. Approval Cards
Each card shows:

**Collapsed State**:
- Owner avatar icon
- Owner name
- Hotel name
- Email
- Status badge (color-coded)
- Expand/collapse icon

**Expanded State**:
- **Left Column**: Owner details
  - Name
  - Email
  - Phone
  - Registration date
  - Approval status badge
  
- **Right Column**: Property details (or "Not Found" message)
  - Property name
  - Company name
  - Registration number
  - Location
  - Registration date
  - Approval status badge

- **Action Buttons** (conditional):
  - "Approve Both" (green) - shown when both pending
  - "Approve Owner Only" (outline) - shown when owner pending
  - "Approve Property Only" (outline) - shown when property pending
  - "Revoke Owner" (red outline) - shown when owner approved
  - "Revoke Property" (red outline) - shown when property approved

### 4. Status Badges

| Status | Color | Icon | Text |
|--------|-------|------|------|
| both-approved | Green | ✓ | Бүгд зөвшөөрөгдсөн |
| both-pending | Orange | ⚠ | Хүлээгдэж буй |
| owner-pending | Yellow | 👤 | Эзэн хүлээгдэж буй |
| property-pending | Yellow | 🏢 | Буудал хүлээгдэж буй |
| orphan | Red | ✗ | Буудал олдсонгүй |

### 5. Confirmation Dialog
Before any approval/revoke action:
- Shows clear action description
- Displays which entity will be affected
- "Cancel" and "Confirm" buttons
- Loading state during processing

---

## Integration Points

### Navigation
1. **Sidebar**: New menu item "Зөвшөөрлийн удирдлага" with clipboard icon
2. **Dashboard**: 
   - Orange-highlighted quick action card
   - "Recent Pending Requests" cards link to approvals page
   - "View All" buttons link to approvals page

### API Endpoints

#### Backend Endpoints Used:
- `GET /api/all-owners/` - Fetch all owners
- `POST /api/approve_user/` - Approve/revoke owner
- `GET /api/properties/` - Fetch all properties
- `POST /api/approve_property/` - **PENDING** - Approve/revoke property

#### Frontend API Routes:
All in `/app/api/superadmin/`:
- `GET /owners` - Proxy to backend
- `GET /properties` - Proxy to backend
- `POST /approve-user` - Proxy to backend
- `POST /approve-property` - **Ready for backend integration**

---

## Matching Logic

### How Owners and Properties are Paired
```typescript
// Primary matching: Property name matches hotel name
const property = properties.find(
  (p) => p.PropertyName.toLowerCase() === owner.hotel_name.toLowerCase()
);
```

### Edge Cases Handled:
1. **No matching property**: Status = 'orphan', shows "Property Not Found"
2. **Multiple owners per property**: Current design assumes 1:1 (can be extended)
3. **Case sensitivity**: Matching is case-insensitive
4. **Empty property list**: All owners show as orphans

### Future Improvements:
- Add property ID to owner record for direct linking
- Support multiple owners per property with role-based access
- Fuzzy matching for similar names
- Manual property assignment UI for orphaned owners

---

## User Workflows

### 1. View All Pending Approvals
1. Navigate to "Зөвшөөрлийн удирдлага" from sidebar
2. See overview statistics at top
3. Scroll through list of owner-property pairs
4. Orange badges indicate pending approvals

### 2. Approve Both Owner and Property
1. Click on a card with "both-pending" status
2. Review owner and property details
3. Click "Бүгдийг зөвшөөрөх" (Approve Both)
4. Confirm in dialog
5. Both entities approved simultaneously
6. Card updates to green "both-approved" badge

### 3. Approve Owner Only
1. Expand card
2. Click "Эзнийг зөвшөөрөх" (Approve Owner Only)
3. Confirm
4. Owner approved, property remains pending
5. Badge changes to "property-pending"

### 4. Search and Filter
1. Type in search bar
2. Results filter in real-time
3. Search across owner name, email, hotel name, property name

### 5. Revoke Approval
1. Expand approved card
2. Click "Эзнийг цуцлах" or "Буудлыг цуцлах"
3. Confirm revocation
4. Status updates immediately

---

## Technical Details

### State Management
```typescript
const [approvals, setApprovals] = useState<CombinedApproval[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
const [confirmDialog, setConfirmDialog] = useState({...});
const [isProcessing, setIsProcessing] = useState(false);
```

### Performance Optimizations
1. **Parallel Fetching**: Owners and properties fetched simultaneously
2. **Memoized Callbacks**: `fetchData` wrapped in `useCallback`
3. **Client-Side Filtering**: No re-fetch on search
4. **Selective Expansion**: Only expanded cards load full details
5. **Optimistic Updates**: Immediate feedback on actions

### Error Handling
```typescript
try {
  // Fetch/approve logic
  toast.success('Success message');
  fetchData(); // Refresh
} catch (error) {
  console.error('Error:', error);
  toast.error('Алдаа гарлаа');
} finally {
  setIsProcessing(false);
}
```

### Accessibility
- Keyboard navigation with collapsible triggers
- Color + icon + text for status (not just color)
- Loading states with spinners
- Clear button labels
- Confirmation dialogs prevent accidental actions

---

## Backend Integration Checklist

### ✅ Completed
- [x] GET owners endpoint integrated
- [x] GET properties endpoint integrated
- [x] POST approve-user endpoint integrated
- [x] Frontend UI complete
- [x] Navigation updated
- [x] Dashboard links updated

### ⏳ Pending Backend
- [ ] `POST /api/approve_property/` endpoint
  - Expected payload: `{ property_pk: number, is_approved: boolean }`
  - Expected response: `{ success: boolean, message: string }`
  - Authorization: SuperAdmin only

### 🔧 Once Backend Ready
1. Update `/app/api/superadmin/approve-property/route.ts`:
   ```typescript
   const response = await fetch(`${API_BASE_URL}/api/approve_property/`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify({ property_pk, is_approved }),
   });
   ```

2. Test approval workflow:
   - Approve property only
   - Approve both
   - Revoke property
   - Error handling

---

## Testing Scenarios

### Manual Testing Checklist

#### Data Loading
- [ ] Page loads without errors
- [ ] Statistics cards show correct counts
- [ ] All owner-property pairs display
- [ ] Orphan owners handled correctly

#### Search & Filter
- [ ] Search by owner name works
- [ ] Search by hotel name works
- [ ] Search by email works
- [ ] Search by property name works
- [ ] Clear search resets results

#### Approval Actions
- [ ] "Approve Both" approves owner and property
- [ ] "Approve Owner Only" only approves owner
- [ ] "Approve Property Only" only approves property (when backend ready)
- [ ] Confirmation dialog shows before each action
- [ ] Toast notifications appear
- [ ] Page refreshes after approval
- [ ] Status badges update correctly

#### Revoke Actions
- [ ] "Revoke Owner" removes owner approval
- [ ] "Revoke Property" removes property approval (when backend ready)
- [ ] Confirmation required
- [ ] Status updates immediately

#### Edge Cases
- [ ] Empty results (no pending) handled
- [ ] Network errors show toast
- [ ] Loading states display
- [ ] Orphan owners display correctly
- [ ] Rapid clicks don't cause double-approvals

#### Navigation
- [ ] Sidebar link works
- [ ] Dashboard link works
- [ ] Refresh button works
- [ ] Back button preserves state

---

## Security Considerations

### Authorization
- All API routes check for SuperAdmin role (user_type = 1)
- Middleware redirects non-SuperAdmins
- JWT token validated on every request

### Data Validation
- Property/Owner PKs validated as numbers
- Boolean flags for approval status
- CORS and credentials included in fetches

### Audit Trail
- Backend should log all approval/revoke actions
- Include timestamp, admin ID, and action type
- Consider email notifications to affected users

---

## Future Enhancements

### Phase 1 (Short-term)
1. **Bulk Actions**: Select multiple and approve/revoke together
2. **Export**: Download approval report as CSV/PDF
3. **Filters**: Add tabs for "Pending", "Approved", "Partial", "Orphan"
4. **Sort**: By date, name, status

### Phase 2 (Medium-term)
1. **Approval Notes**: Add reason/notes for approval decisions
2. **Approval History**: Show timeline of status changes
3. **Email Notifications**: Notify owners on approval/rejection
4. **Manual Matching**: UI to manually link orphan owners to properties

### Phase 3 (Long-term)
1. **Approval Workflow**: Multi-stage approval (reviewer → approver)
2. **Document Verification**: Attach/view registration documents
3. **Property Verification**: Photos, licenses, certifications
4. **Analytics Dashboard**: Approval metrics, time-to-approval trends

---

## Troubleshooting

### Issue: "No properties found" for all owners
**Cause**: Property name doesn't match hotel name  
**Solution**: Check backend data consistency, implement fuzzy matching

### Issue: Approve Both button does nothing
**Cause**: Property approval endpoint not ready  
**Solution**: Wait for backend, or approve separately

### Issue: Search not working
**Cause**: String comparison case sensitivity  
**Solution**: Already handled with `.toLowerCase()`

### Issue: Page doesn't refresh after approval
**Cause**: `fetchData()` not called after action  
**Solution**: Already implemented in success handler

### Issue: Multiple cards for same owner
**Cause**: Duplicate owner records in backend  
**Solution**: Backend data cleanup needed

---

## Maintenance Notes

### Regular Tasks
1. Monitor orphan count - investigate mismatches
2. Review approval times - optimize if too slow
3. Check for duplicate approvals
4. Verify statistics accuracy

### Code Maintenance
1. Update types if backend API changes
2. Add new filters as requested
3. Optimize matching algorithm if performance degrades
4. Keep status badge colors consistent with design system

### Documentation Updates
- Update this doc when adding new features
- Document any changes to matching logic
- Update integration checklist when backend ready

---

## Summary

The Unified Approval System successfully consolidates owner and property approval workflows into a single, efficient interface. It provides SuperAdmins with:

✅ Complete visibility into owner-property relationships  
✅ Flexible approval options (both, owner only, property only)  
✅ Clear status indicators with color coding  
✅ Fast search and filtering  
✅ Comprehensive detail view in expandable cards  
✅ Confirmation dialogs to prevent mistakes  
✅ Seamless integration with existing navigation  

**Frontend**: 100% Complete  
**Backend**: Waiting for property approval endpoint  
**UX**: Optimized for 1:1 owner-property relationship  
**Next Steps**: Backend integration, then user testing  

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team
