# Quick Integration Guide: Phase 2 Components

**Duration**: 60-90 minutes to complete all integration  
**Difficulty**: Easy (mostly copy-paste and wiring)  
**Files to modify**: 1 main file + 3 API routes

---

## Overview

Phase 2 created 4 reusable components that need to be connected to the dashboard:

1. **AdminNotifications** → Already in header ✅
2. **DashboardFilters** → Needs to be added to 4 tabs
3. **ExportButton** → Needs to be added to 4 tabs
4. **QuoteMessaging** → Needs modal in Quotes tab

---

## Quick Start: 3 Steps

### Step 1: Add Filters & Export to Quotes Tab (10 mins)

**File**: `src/app/admin/_components/AdminDashboardClient.tsx`

Find the Quotes tab content (around line 200-250):

```tsx
// BEFORE:
<TabsContent value="quotes" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Recent Quotes</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        {/* table content */}
      </Table>
    </CardContent>
  </Card>
</TabsContent>

// AFTER:
<TabsContent value="quotes" className="space-y-4">
  <div className="flex gap-2 mb-4">
    <DashboardFilters 
      filterDefinitions={[
        { key: 'buyerContactEmail', label: 'Email', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', 
          options: ['draft', 'sent', 'approved', 'rejected'] },
      ]}
      onFilter={(filters) => {
        // Apply filters
        const filtered = quotes.filter(q => 
          Object.entries(filters).every(([k, v]) => {
            if (!v) return true;
            return String(q[k] || '').toLowerCase().includes(String(v).toLowerCase());
          })
        );
        setDisplayedQuotes(filtered);
      }}
    />
    <ExportButton data={displayedQuotes || quotes} filename="quotes" />
  </div>
  
  <Card>
    <CardHeader>
      <CardTitle>Recent Quotes</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        {/* table content */}
      </Table>
    </CardContent>
  </Card>
</TabsContent>
```

### Step 2: Duplicate for Other Tabs (15 mins)

Repeat Step 1 for:
- **Users tab**: Filter by email, role, status
- **Forms tab**: Filter by email, formType, status
- **Newsletter tab**: Filter by email, subscriptionStatus

Just change the `filterDefinitions` for each tab.

### Step 3: Add Message Button to Quotes (10 mins)

In the Quotes table, add a "Message" button column:

```tsx
// In the Table render, add this column header:
<TableHead>Actions</TableHead>

// In the TableBody, add this for each quote row:
<TableCell>
  <Button 
    variant="ghost" 
    size="sm"
    onClick={() => {
      setSelectedQuote(quote);
      setShowMessaging(true);
    }}
  >
    <MessageSquare className="h-4 w-4" />
    Message
  </Button>
</TableCell>

// Add this state at top of component:
const [selectedQuote, setSelectedQuote] = useState(null);
const [showMessaging, setShowMessaging] = useState(false);

// Add this modal at the bottom of the component:
{showMessaging && selectedQuote && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-full max-w-2xl max-h-96 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Messages: {selectedQuote.reference}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowMessaging(false)}
        >
          ✕
        </Button>
      </CardHeader>
      <CardContent>
        <QuoteMessaging quoteId={selectedQuote.id} />
      </CardContent>
    </Card>
  </div>
)}
```

---

## By-the-Numbers Integration

### Quotes Tab
```
Lines to add: ~40
Time: 10 minutes
Imports needed: DashboardFilters, ExportButton, QuoteMessaging
State additions: selectedQuote, showMessaging, displayedQuotes, quoteFilters
```

### Users Tab
```
Lines to add: ~20
Time: 5 minutes
Imports needed: DashboardFilters, ExportButton
State additions: userFilters, displayedUsers
```

### Forms Tab
```
Lines to add: ~20
Time: 5 minutes
Imports needed: DashboardFilters, ExportButton
State additions: formFilters, displayedForms
```

### Newsletter Tab
```
Lines to add: ~20
Time: 5 minutes
Imports needed: DashboardFilters, ExportButton
State additions: newsletterFilters, displayedSubscribers
```

**Total integration time**: 30 minutes ⏱️

---

## Add Notification Triggers

### 1. User Registration Notification

**File**: `src/app/api/auth/register/route.ts`

Find where user is created, then add:

```tsx
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';

// After user creation:
await broadcastAdminNotification(
  'new_user',
  `New User: ${firstName} ${lastName}`,
  `${email} just registered`,
  {
    userId: user.id,
    email,
    name: `${firstName} ${lastName}`
  },
  `/admin/dashboard?tab=users&id=${user.id}`
);
```

### 2. Newsletter Signup Notification

**File**: `src/app/api/newsletter-subscribe/route.ts`

Find where subscription is created, then add:

```tsx
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';

// After subscription created:
await broadcastAdminNotification(
  'new_newsletter',
  `Newsletter Signup: ${email}`,
  `${email} subscribed to newsletter`,
  { email },
  `/admin/dashboard?tab=newsletter`
);
```

**Total notification trigger time**: 10 minutes ⏱️

---

## Database Migration

**Before testing, run this**:

```bash
npx prisma migrate deploy
```

This creates:
- AdminNotification table (for storing notifications)
- QuoteMessage table (for quote messaging)
- All required indexes

**Verification**:
```bash
# Check if tables were created
npx prisma studio
# Look for AdminNotification and QuoteMessage in the database explorer
```

**Migration time**: 5 minutes ⏱️

---

## Testing Checklist

After integration, test these scenarios:

### Test 1: Notifications (5 mins)
```
□ Submit quote
  → Notification bell shows "1"
  → Click bell to open panel
  → See "New Quote Request" notification
  → Notification is purple badge
  → Click "✕" to delete
  → Notification disappears

□ Submit form
  → Same flow as quote
  → Notification badge is blue
  
□ Register new user (if you set that up)
  → Notification appears
  → Badge is green
```

### Test 2: Filters (5 mins)
```
□ Click "Filter" on Quotes tab
  → Filter dropdown opens
  
□ Type email filter
  → Type "test@" into Email field
  → Table updates to show only matching quotes
  
□ Add status filter
  → Select "draft" from Status dropdown
  → Table further filters by draft status
  
□ Clear all filters
  → Click "Clear All" button
  → Table shows all quotes again
```

### Test 3: Export (3 mins)
```
□ Click "Export CSV" on Quotes tab
  → quotes_2024-12-22.csv downloads
  → Open in Excel/Sheets
  → Verify all columns present
  
□ Click "Export JSON" on Quotes tab
  → quotes_2024-12-22.json downloads
  → Open in text editor
  → Verify JSON is valid
```

### Test 4: Quote Messaging (5 mins)
```
□ Click "Message" button on any quote
  → Modal opens
  → Shows empty message list
  
□ Type a message
  → Type "Test message" into input
  → Click "Send"
  → Message appears in list
  → Shows as "Admin" sender
```

**Total testing time**: 20 minutes ⏱️

---

## Import Checklist

Make sure these are imported in `AdminDashboardClient.tsx`:

```tsx
import { DashboardFilters } from './DashboardFilters';
import { ExportButton } from './ExportButton';
import { QuoteMessaging } from './QuoteMessaging';
import { AdminNotifications } from './AdminNotifications';
```

And in the API route files:
```tsx
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Filters don't work
**Problem**: `onFilter` callback not connected to data filtering
**Solution**: Make sure you're actually filtering the displayed data:
```tsx
const filtered = data.filter(item => 
  Object.entries(filters).every(([key, value]) => {
    if (!value) return true;
    return String(item[key] || '').includes(String(value));
  })
);
setDisplayedData(filtered);
```

### ❌ Mistake 2: Export shows wrong filename
**Problem**: Filename doesn't include timestamp
**Solution**: The component handles this automatically, just pass `filename="quotes"` and it becomes `quotes_2024-12-22.csv`

### ❌ Mistake 3: Message modal won't close
**Problem**: Modal state not managed
**Solution**: Wrap QuoteMessaging in a modal with close button:
```tsx
{showMessaging && (
  <Modal>
    <CloseButton onClick={() => setShowMessaging(false)} />
    <QuoteMessaging quoteId={selectedQuote.id} />
  </Modal>
)}
```

### ❌ Mistake 4: Notifications not appearing
**Problem**: `broadcastAdminNotification` import missing
**Solution**: Add import at top of API route file:
```tsx
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';
```

---

## Rollback Plan

If something breaks:

1. **Remove the components**:
   - Remove DashboardFilters code
   - Remove ExportButton code
   - Remove QuoteMessaging code
   
2. **Revert API changes**:
   - Remove broadcastAdminNotification calls
   - Remove imports

3. **Revert database** (if needed):
   - `npx prisma migrate resolve --rolled-back 20251222_add_admin_notifications`
   - `npx prisma migrate resolve --rolled-back 20251222_add_quote_messages`

4. **Redeploy**:
   - Push changes
   - Run migration if needed

---

## Success Indicators

You'll know Phase 2 integration is complete when:

✅ Notification bell appears in dashboard header  
✅ Submit quote → notification appears  
✅ Click "Filter" → options show  
✅ Type in filter → data filters  
✅ Click "Export CSV" → file downloads  
✅ Click "Message" → modal opens  
✅ Type message → message sends  
✅ No errors in browser console  
✅ All tests pass  

---

## Time Breakdown

```
Component Integration:   30 mins
Notification Triggers:   10 mins
Database Migration:       5 mins
Testing:                 20 mins
─────────────────────────────────
Total:                   65 mins
```

**Buffer for issues**: 25 mins
**Total estimated**: 90 mins (1.5 hours)

---

## Still Stuck?

### Problem: "DashboardFilters is not defined"
- Check import: `import { DashboardFilters } from './DashboardFilters';`
- Check file exists: `src/app/admin/_components/DashboardFilters.tsx`
- Check you're in correct component

### Problem: "broadcastAdminNotification is not defined"
- Check import: `import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';`
- Check file exists: `src/app/admin/_actions/notifications.ts`

### Problem: "Filter doesn't work"
- Add console.log in onFilter callback to debug
- Check filter definitions match data structure
- Verify filtering logic (string comparison case-insensitive)

### Problem: "Export downloads empty file"
- Check data is being passed correctly
- Verify data structure (array of objects)
- Check filename parameter

### Problem: "Message modal won't show"
- Verify selectedQuote state updates
- Check modal condition logic
- Add console.log to debug state changes

---

**Ready to integrate? Let's go!** 🚀

Follow the steps above and you'll have a fully functional Phase 2 dashboard in about 90 minutes.

