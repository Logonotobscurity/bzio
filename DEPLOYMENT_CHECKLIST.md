# Dashboard Restructuring - Deployment Checklist

## ✅ Completed Tasks

- [x] Add UserActivity model to Prisma schema
- [x] Add relationship between User and UserActivity
- [x] Create activity service functions
- [x] Create/update activity API endpoints
- [x] Update cart API with activity logging
- [x] Update profile API with activity logging
- [x] Create Recent Activity component
- [x] Update OrderDashboard with Account Details section
- [x] Update OrderDashboard with Recent Activity integration
- [x] Rename "Profile" tab to "Account Details"
- [x] Add edit profile modal to dashboard
- [x] Create activity tracking guide
- [x] Create implementation summary
- [x] Create quick start guide

## 🚀 Pre-Deployment Checklist

### Code Review
- [ ] Review all schema changes in `prisma/schema.prisma`
- [ ] Review activity service in `src/lib/activity-service.ts`
- [ ] Review updated API endpoints for security
- [ ] Review UI components for accessibility
- [ ] Check error handling in all new code

### Testing
- [ ] Run TypeScript compiler: `tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Test build process: `npm run build`
- [ ] Manual testing of dashboard on desktop
- [ ] Manual testing of dashboard on mobile
- [ ] Test profile editing functionality
- [ ] Test activity tracking for cart operations

### Database
- [ ] Backup current database
- [ ] Test migration on development environment: `npx prisma migrate dev --name add_user_activity`
- [ ] Verify migration creates all required columns/indexes
- [ ] Test rollback capability (if needed): `npx prisma migrate resolve --rolled-back add_user_activity`

### Deployment Steps

#### 1. Pre-Production
```bash
# Backup database
# (database backup commands for your provider)

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev --name add_user_activity

# Build project
npm run build

# Test locally
npm run dev
```

#### 2. Production
```bash
# Deploy code
# (your deployment process)

# Run migrations
npx prisma migrate deploy

# Verify deployment
# (health checks, smoke tests)
```

### Post-Deployment Verification

- [ ] Access dashboard at `/dashboard`
- [ ] Verify Account Details card displays correctly
- [ ] Click Edit Profile and update a field
- [ ] Verify profile update succeeds
- [ ] Verify profile update activity appears in Recent Activity
- [ ] Add item to cart
- [ ] Verify cart_add activity appears in Recent Activity
- [ ] Remove item from cart
- [ ] Verify cart_remove activity appears in Recent Activity
- [ ] Test pagination of activities (if >10 items)
- [ ] Check browser console for any JavaScript errors
- [ ] Check server logs for any API errors
- [ ] Verify database queries are efficient (check query logs)

## 📋 Implementation Verification

### Schema
```sql
-- Verify UserActivity table exists
SELECT * FROM information_schema.tables WHERE table_name = 'user_activities';

-- Verify indexes
SELECT * FROM pg_indexes WHERE tablename = 'user_activities';
```

### API Endpoints
```bash
# Test get activities
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/user/activities

# Test create activity (should be automatic, but can test)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  https://your-domain.com/api/user/activities \
  -d '{"activityType":"test","description":"Test activity"}'
```

## 🆘 Rollback Plan

If issues occur after deployment:

### Quick Rollback
```bash
# Revert code to previous version
git revert <commit-hash>

# Rollback database migration
npx prisma migrate resolve --rolled-back add_user_activity

# Redeploy
npm run build && npm run start
```

### Data Safety Notes
- Activities already created will remain in database (safe to keep)
- UserActivity table can be safely dropped if needed
- No existing user data is affected by this change

## 📊 Monitoring After Deployment

### Key Metrics to Monitor
- [ ] Dashboard load time
- [ ] API response times for `/api/user/activities`
- [ ] Database query performance
- [ ] Error rates for profile/cart endpoints
- [ ] User adoption (activity creation rate)

### Logs to Check
- [ ] Server logs for `[USER_ACTIVITIES_GET]` or `[USER_ACTIVITIES_POST]` errors
- [ ] Database logs for slow queries
- [ ] Browser console errors in user dashboards

## 📝 Documentation Status

- [x] Quick Start Guide: `DASHBOARD_QUICKSTART.md`
- [x] Implementation Summary: `IMPLEMENTATION_SUMMARY_DASHBOARD_RESTRUCTURE.md`
- [x] Activity Tracking Guide: `docs/ACTIVITY_TRACKING_GUIDE.md`
- [x] This Checklist: `DEPLOYMENT_CHECKLIST.md`

## 👥 Communication

### Notify Teams
- [ ] Backend team of schema changes
- [ ] Frontend team of new components
- [ ] QA team of testing requirements
- [ ] DevOps team of migration steps
- [ ] Product team of new features

### Documentation Sharing
- [ ] Share `DASHBOARD_QUICKSTART.md` with QA
- [ ] Share `docs/ACTIVITY_TRACKING_GUIDE.md` with developers
- [ ] Share feature overview with product/design teams

## ⏱️ Timeline Estimates

| Task | Est. Time | Notes |
|------|-----------|-------|
| Code Review | 30 min | Review schema and API changes |
| Testing | 1-2 hours | Manual testing on different devices |
| Database Backup | 10 min | Provider-specific |
| Migration | 5-10 min | Usually fast on small to medium databases |
| Deployment | 15-30 min | Depends on deployment process |
| Post-Deploy Verification | 30 min | Smoke tests and verification |
| **Total** | **2-3 hours** | Conservative estimate |

## 🔒 Security Checklist

- [x] Activity API requires authentication
- [x] Users can only see their own activities
- [x] Profile updates require authentication
- [x] Cart operations require authentication
- [ ] Rate limiting configured for activities endpoint (if needed)
- [ ] Input validation in place for all endpoints
- [ ] CSRF protection enabled
- [ ] No sensitive data exposed in activity metadata

## ✨ Success Criteria

After deployment, confirm:
- ✅ Dashboard displays without errors
- ✅ Account Details section shows user information
- ✅ Edit Profile button works and updates profile
- ✅ Recent Activity section displays
- ✅ Activities are logged for cart operations
- ✅ Activities are logged for profile updates
- ✅ All components are responsive on mobile
- ✅ No console errors
- ✅ No server errors in logs
- ✅ Database queries performing well

## 📞 Support Contacts

| Role | Contact | Notes |
|------|---------|-------|
| Backend Lead | | Schema changes, API issues |
| Frontend Lead | | UI/component issues |
| DevOps Lead | | Deployment, migrations |
| QA Lead | | Testing coordination |
| Product Manager | | Feature verification |

---

## Final Steps

1. **Review**: Read through all sections of this checklist
2. **Prepare**: Gather team members and confirm readiness
3. **Backup**: Ensure database backup is complete
4. **Deploy**: Follow deployment steps in order
5. **Verify**: Complete post-deployment verification
6. **Monitor**: Watch metrics and logs for 24-48 hours
7. **Document**: Update any internal documentation
8. **Close**: Archive this checklist with deployment date/time

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
**Notes**: 

