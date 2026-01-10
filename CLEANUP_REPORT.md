# Code Cleanup Report - Duplicate & Unused Files

## Duplicate Service Files (DELETE THESE)

### 1. Analytics Services
- **KEEP**: `src/services/analytics.service.ts` (Repository pattern, class-based)
- **DELETE**: `src/services/analyticsService.ts` (Direct Prisma, function-based)

### 2. Error Logging Services
- **KEEP**: `src/services/error-logging.service.ts` (Repository pattern, comprehensive)
- **DELETE**: `src/services/errorLoggingService.ts` (Direct Prisma, basic)

### 3. Notification Services
- **KEEP**: `src/services/notification.service.ts` (Admin notifications, repository pattern)
- **DELETE**: `src/services/notificationService.ts` (User notifications, direct Prisma)

### 4. Quote Services
- **KEEP**: `src/services/quote.service.ts` (Full CRUD, repository pattern)
- **DELETE**: `src/services/quoteService.ts` (Single create function)

## Fixed Issues

### 1. Lead Service - Duplicate Function
- **File**: `src/services/lead.service.ts`
- **Issue**: Duplicate `getLeadCount()` function (lines 63-67 and 115-118)
- **Status**: ✅ FIXED - Removed first duplicate

## Files to Delete

```bash
# Delete duplicate service files
rm src/services/analyticsService.ts
rm src/services/errorLoggingService.ts
rm src/services/notificationService.ts
rm src/services/quoteService.ts
```

## Impact Analysis

### analyticsService.ts
- **Used by**: Check imports
- **Functions**: trackProductView, trackSearchQuery, getProductViewCount, getSearchQueryStats
- **Migration**: Use analytics.service.ts methods instead

### errorLoggingService.ts
- **Used by**: Check imports
- **Functions**: storeErrorLog, getErrorLogs, deleteErrorLog, sendAlert
- **Migration**: Use error-logging.service.ts methods instead

### notificationService.ts
- **Used by**: Check imports
- **Functions**: createNotification, getUserNotifications, markAsRead, deleteNotification
- **Migration**: Use notification.service.ts methods instead

### quoteService.ts
- **Used by**: Check imports
- **Functions**: createQuote (transaction-based)
- **Migration**: Use quote.service.ts createQuote method

## Search for Imports

Run these commands to find usages:

```bash
# Find analyticsService imports
grep -r "from.*analyticsService" src/

# Find errorLoggingService imports
grep -r "from.*errorLoggingService" src/

# Find notificationService imports
grep -r "from.*notificationService" src/

# Find quoteService imports (not quote.service)
grep -r "from.*quoteService" src/ | grep -v "quote.service"
```

## Recommended Actions

1. **Search for imports** of duplicate files
2. **Update imports** to use the kept files
3. **Delete duplicate files**
4. **Run tests** to ensure nothing breaks
5. **Commit changes**

## TypeScript Errors Fixed

- ✅ `src/services/lead.service.ts` - Removed duplicate getLeadCount function
