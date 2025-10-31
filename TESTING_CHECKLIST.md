# Testing Checklist for Airsoft Burza

## Overview
This checklist covers manual testing of the recent changes:
1. Authentication logic for sign-in vs registration
2. Contact information auto-fill from profile
3. Product condition system updates

## Environment Setup
- [ ] Ensure `.env.local` is configured with database credentials
- [ ] Database migration completed: `node scripts/migrate-database.js`
- [ ] Development server running: `npm run dev`
- [ ] Browser console open for error checking

---

## 1. Authentication Testing

### 1.1 Sign In Flow
- [ ] Navigate to `/auth/signin`
- [ ] Click "Přihlásit se s Google"
- [ ] Sign in with existing Google account
- [ ] Verify: User is logged in
- [ ] Verify: Console shows "👤 Uživatel již existuje v databázi: [email]"
- [ ] Verify: No new user created in database

### 1.2 Sign Up Flow
- [ ] Navigate to `/auth/signup`
- [ ] Click "Registrovat se s Google"
- [ ] Sign in with NEW Google account (not in database)
- [ ] Verify: User is logged in
- [ ] Verify: Console shows "✅ Nový uživatel vytvořen v databázi: [email]"
- [ ] Verify: New user appears in database

### 1.3 Duplicate Prevention
- [ ] Try to sign in again with the same account
- [ ] Verify: No duplicate users created
- [ ] Verify: Existing user ID is used

---

## 2. Product Creation - Contact Information

### 2.1 Profile Setup
- [ ] Navigate to `/profile`
- [ ] Fill in phone number: `+420 123 456 789`
- [ ] Save profile
- [ ] Verify: Phone is saved

### 2.2 Auto-fill Testing
- [ ] Navigate to `/products/new`
- [ ] Wait for page to load
- [ ] Scroll to "Kontaktní informace" section
- [ ] Verify: Email field is automatically filled
- [ ] Verify: Phone field is automatically filled
- [ ] Verify: Fields can still be manually edited

### 2.3 Contact Display
- [ ] Create a product with filled contact info
- [ ] Navigate to `/products/[created-product-id]`
- [ ] Scroll down to "Kontaktní informace prodejce"
- [ ] Verify: Email is displayed
- [ ] Verify: Phone is displayed
- [ ] Verify: Email link works (`mailto:`)
- [ ] Verify: Phone link works (`tel:`)

---

## 3. Product Condition Testing

### 3.1 Standard Conditions
- [ ] Navigate to `/products/new`
- [ ] Fill basic product info
- [ ] Select "Nový" from condition dropdown
- [ ] Verify: No custom field appears
- [ ] Submit product
- [ ] Verify: Product created successfully
- [ ] Verify: "Nový" badge displays correctly

- [ ] Repeat for "Lehké poškození"
- [ ] Verify: Green badge color
- [ ] Repeat for "Větší poškození"
- [ ] Verify: Orange badge color
- [ ] Repeat for "Nefunkční"
- [ ] Verify: Red badge color

### 3.2 Custom Condition
- [ ] Navigate to `/products/new`
- [ ] Fill basic product info
- [ ] Select "Vlastní stav" from condition dropdown
- [ ] Verify: Custom condition field appears
- [ ] Enter text: "Poškozený kryt"
- [ ] Verify: Character limit (20) works
- [ ] Submit product
- [ ] Verify: Product created successfully
- [ ] Verify: Custom condition displays on product page

### 3.3 Custom Condition Validation
- [ ] Try to submit with "Vlastní stav" selected but empty
- [ ] Verify: Error message shown
- [ ] Try to enter text over 20 characters
- [ ] Verify: Input is limited to 20 characters

### 3.4 Condition Display
- [ ] Navigate to `/products` page
- [ ] Verify: All conditions display correctly
- [ ] Navigate to `/my-products` page
- [ ] Verify: All conditions display correctly
- [ ] Navigate to specific product page
- [ ] Verify: Condition badge displays with correct color

---

## 4. API Testing

### 4.1 Product Creation API
```bash
# Test with standard condition
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: multipart/form-data" \
  -d "title=Test Product" \
  -d "description=Test Description" \
  -d "price=1000" \
  -d "listingType=nabizim" \
  -d "category=airsoft-weapons" \
  -d "condition=new" \
  -d "location=Praha"

# Test with custom condition
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: multipart/form-data" \
  -d "title=Test Custom" \
  -d "description=Test Description" \
  -d "price=1000" \
  -d "listingType=nabizim" \
  -d "category=airsoft-weapons" \
  -d "condition=custom-Test custom status" \
  -d "location=Praha"
```

### 4.2 Product Retrieval API
```bash
# Test GET endpoint
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products/[product-id]

# Verify JSON response structure
# Verify condition mapping works correctly
```

---

## 5. Integration Testing

### 5.1 Full Product Flow
- [ ] Sign up with new Google account
- [ ] Fill profile with contact information
- [ ] Create product with custom condition
- [ ] View product page
- [ ] Verify: All information displays correctly
- [ ] Send message via contact form
- [ ] Verify: Message appears in chat

### 5.2 Database Verification
```sql
-- Check users table
SELECT * FROM users WHERE email = '[your-test-email]';

-- Check products table
SELECT id, title, condition FROM products WHERE userId = '[your-user-id]';

-- Verify condition values
SELECT DISTINCT condition FROM products;
```

---

## 6. Error Handling

### 6.1 API Errors
- [ ] Try to create product without login
- [ ] Verify: 401 Unauthorized error
- [ ] Try to create product with invalid data
- [ ] Verify: 400 Bad Request with error message
- [ ] Try to create product with missing required fields
- [ ] Verify: Appropriate error messages

### 6.2 Frontend Errors
- [ ] Check browser console for errors
- [ ] Verify: No TypeScript errors
- [ ] Verify: No React warnings
- [ ] Verify: No network errors

---

## 7. Build Verification

### 7.1 Production Build
```bash
npm run build
```
- [ ] Verify: Build completes successfully
- [ ] Verify: No TypeScript errors
- [ ] Verify: All pages compiled

### 7.2 Type Checking
```bash
npm run type-check
```
- [ ] Verify: No type errors

### 7.3 Linting
```bash
npm run lint
```
- [ ] Verify: No linting errors

---

## 8. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

Verify:
- [ ] All forms work
- [ ] Styling displays correctly
- [ ] JavaScript functions work
- [ ] No console errors

---

## 9. Mobile Responsiveness

Test on mobile/tablet viewports:
- [ ] Product creation form
- [ ] Product listing pages
- [ ] Product detail page
- [ ] Profile page
- [ ] Messages/Chat page

---

## 10. Edge Cases

### 10.1 Empty States
- [ ] Navigate to empty product category
- [ ] Verify: Appropriate empty state message

### 10.2 Long Text
- [ ] Try to enter very long custom condition (test 20 char limit)
- [ ] Verify: Limit enforced

### 10.3 Special Characters
- [ ] Try custom condition with special chars: "Test-&*@#"
- [ ] Verify: Sanitization works

### 10.4 Concurrent Edits
- [ ] Have multiple tabs open
- [ ] Edit product in one tab
- [ ] Verify: Changes reflect in other tabs

---

## Notes
- Document any issues found during testing
- Take screenshots of bugs
- Note browser and OS version for each test
- Record timestamps for performance testing

---

## Test Results Summary

**Date:** _______________
**Tester:** _______________
**Build Version:** _______________

| Feature | Passed | Failed | Notes |
|---------|--------|--------|-------|
| Authentication | ☐ | ☐ | |
| Contact Auto-fill | ☐ | ☐ | |
| Standard Conditions | ☐ | ☐ | |
| Custom Conditions | ☐ | ☐ | |
| API Endpoints | ☐ | ☐ | |
| Error Handling | ☐ | ☐ | |
| Build Process | ☐ | ☐ | |

**Overall Status:** ☐ Pass ☐ Fail

**Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

