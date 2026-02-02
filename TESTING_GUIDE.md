# Testing Guide - Research or Report Reference Finder

This guide helps you test the extension thoroughly to ensure all features work correctly.

## 🧪 Test Environment Setup

### Prerequisites
- Chrome/Chromium browser (version 90+)
- Extension loaded in Developer mode
- Various websites with academic content

### Websites to Test On
1. **Google Search**: https://www.google.com/search?q=research+papers
2. **Google Scholar**: https://scholar.google.com
3. **arXiv**: https://arxiv.org
4. **ResearchGate**: https://www.researchgate.net
5. **Medium**: https://medium.com (for articles with years)
6. **News sites**: BBC, CNN (for dated articles)

## ✅ Test Cases

### Test 1: Basic Reference Extraction
**Objective**: Verify extension finds references on a page

**Steps**:
1. Go to Google Scholar and search for any topic
2. Click the extension icon
3. Wait for loading to complete

**Expected Result**:
- "Loading references..." message disappears
- Website dropdown is populated with domain names
- Result list shows at least one reference

**Pass/Fail**: ____

---

### Test 2: Website Filter Population
**Objective**: Verify website dropdown contains correct domains

**Steps**:
1. Open extension on a search results page
2. Look at website dropdown options

**Expected Result**:
- Multiple unique website domains appear
- Each domain appears only once
- Domains are sorted alphabetically
- (e.g., arxiv.org, scholar.google.com, researchgate.net)

**Pass/Fail**: ____

---

### Test 3: Website Filter Selection
**Objective**: Verify selecting a website filters results correctly

**Steps**:
1. Open extension on Google Scholar
2. Select "scholar.google.com" from website dropdown
3. Click "Apply Filter"

**Expected Result**:
- Only results from scholar.google.com appear
- Author and Year dropdowns automatically update
- Number of results decreases (showing filtered state)

**Pass/Fail**: ____

---

### Test 4: Author Filter Population
**Objective**: Verify author dropdown updates when website changes

**Steps**:
1. Select a website from dropdown (e.g., scholar.google.com)
2. Look at Author dropdown

**Expected Result**:
- Author dropdown now shows authors ONLY from selected website
- Authors are sorted alphabetically
- At least 3-5 different authors appear
- "Select Author" default option remains

**Pass/Fail**: ____

---

### Test 5: Year Filter Population
**Objective**: Verify year dropdown updates when website changes

**Steps**:
1. Select a website from dropdown
2. Look at Year dropdown

**Expected Result**:
- Year dropdown shows years ONLY from selected website
- Years are sorted in descending order (newest first)
- Years are between 1990-2030
- "Select Year" default option remains

**Pass/Fail**: ____

---

### Test 6: Author Selection
**Objective**: Verify filtering by author works

**Steps**:
1. Select a website
2. Select an author from Author dropdown
3. Click "Apply Filter"

**Expected Result**:
- Results show only that author
- Number of results decreases
- All results display the selected author name

**Pass/Fail**: ____

---

### Test 7: Year Selection
**Objective**: Verify filtering by year works

**Steps**:
1. Select a website
2. Select a year from Year dropdown
3. Click "Apply Filter"

**Expected Result**:
- Results show only that year
- Number of results decreases
- All results display the selected year

**Pass/Fail**: ____

---

### Test 8: Combined Filtering
**Objective**: Verify all filters work together

**Steps**:
1. Select a website
2. Select an author
3. Select a year
4. Click "Apply Filter"

**Expected Result**:
- Results show ONLY entries matching:
  - Selected website AND
  - Selected author AND
  - Selected year
- Number of results is smallest possible

**Pass/Fail**: ____

---

### Test 9: Copy Functionality
**Objective**: Verify copying references works

**Steps**:
1. Apply filters to get results
2. Click "Copy" button on a reference
3. Open a text editor (Notepad, Word, etc.)
4. Paste (Ctrl+V or Cmd+V)

**Expected Result**:
- Alert says "Reference copied!"
- Pasted text contains:
  - Author name
  - Year in parentheses
  - Reference title
  - Full URL
- Format example: `Smith, J. (2022)\nMachine Learning Study\nhttps://...`

**Pass/Fail**: ____

---

### Test 10: Link Click Functionality
**Objective**: Verify clicking references opens correct URL

**Steps**:
1. Get filtered results
2. Click on reference title/link
3. Check if page opens

**Expected Result**:
- New tab opens
- URL matches the reference link
- Target website loads correctly

**Pass/Fail**: ____

---

### Test 11: No Results Scenario
**Objective**: Verify extension handles pages with no references

**Steps**:
1. Go to a page with few/no academic links (e.g., CNN homepage)
2. Click extension

**Expected Result**:
- Message shows "No references found"
- No error messages in console
- Extension doesn't crash

**Pass/Fail**: ____

---

### Test 12: Empty Filter Selection
**Objective**: Verify extension works with filters left empty

**Steps**:
1. Leave all dropdowns as "Select X"
2. Click "Apply Filter"

**Expected Result**:
- Shows ALL references from all websites
- No errors occur
- All results display

**Pass/Fail**: ____

---

### Test 13: Console Error Check
**Objective**: Verify no errors appear in console

**Steps**:
1. Open extension
2. Right-click popup
3. Select "Inspect"
4. Click "Console" tab
5. Apply filters and interact with UI

**Expected Result**:
- No RED error messages
- Console shows information logs (OK if green)
- No "Uncaught Exception" messages

**Pass/Fail**: ____

---

### Test 14: Cross-Website Testing
**Objective**: Verify extension works on different websites

**Test on each**:
- [ ] Google Scholar
- [ ] arXiv.org
- [ ] ResearchGate
- [ ] Wikipedia (academic articles)
- [ ] Blog posts with dates
- [ ] News articles with authors

**Expected Result**:
- Extension works consistently on all sites
- Finds relevant references on each
- Filtering works smoothly

**Pass/Fail**: ____

---

### Test 15: UI Responsiveness
**Objective**: Verify popup UI appears correctly

**Steps**:
1. Click extension icon
2. Check popup appearance
3. Interact with dropdowns
4. Scroll through results

**Expected Result**:
- Popup is 450px wide
- All text readable
- Buttons clickable
- Dropdowns open smoothly
- Results list scrollable if needed
- No text overflow
- Colors are professional (green/blue/purple)

**Pass/Fail**: ____

---

## 🔍 Performance Tests

### Test 16: Load Time
**Objective**: Measure extension load time

**Steps**:
1. Open browser DevTools (F12)
2. Go to Google Scholar
3. Click extension icon
4. Time how long until results appear

**Expected Result**:
- Less than 1 second total
- Content script runs < 500ms
- Filter population < 200ms

**Actual Time**: ____ms

**Pass/Fail**: ____

---

### Test 17: Large Page Handling
**Objective**: Verify extension works on pages with many links

**Steps**:
1. Go to Google Search with many results
2. Click extension
3. Apply filters

**Expected Result**:
- Extension handles 100+ links efficiently
- No lag or freezing
- Results display quickly
- Memory usage stable

**Pass/Fail**: ____

---

## 🐛 Bug Testing

### Test 18: Malformed Data
**Objective**: Verify extension handles edge cases

**Test Cases**:
- [ ] Links with very long text (> 500 chars)
- [ ] Links with special characters
- [ ] Links with no visible text (empty)
- [ ] Links with URLs but no text
- [ ] Broken URLs
- [ ] Duplicate links

**Expected Result**:
- No crashes
- Invalid links are filtered out appropriately
- Valid links are captured

**Pass/Fail**: ____

---

## 📋 Test Summary

### Tests Completed: ____ / 18

### Critical Tests (Must Pass)
- [ ] Test 2: Website Filter Population
- [ ] Test 3: Website Filter Selection
- [ ] Test 9: Copy Functionality
- [ ] Test 13: Console Error Check

### Important Tests
- [ ] Test 1: Basic Reference Extraction
- [ ] Test 6: Author Selection
- [ ] Test 7: Year Selection
- [ ] Test 8: Combined Filtering

### Nice-to-Have Tests
- [ ] Test 4: Author Filter Population
- [ ] Test 5: Year Filter Population
- [ ] Test 14: Cross-Website Testing
- [ ] Test 15: UI Responsiveness

---

## 🎯 Sign-Off

**Tester Name**: ____________________

**Date**: ____________________

**Overall Status**: ☐ PASS ☐ FAIL ☐ NEEDS FIXES

**Critical Issues**: ____________________

**Notes**: ____________________

---

**Next Steps**:
1. Fix any failed tests
2. Re-test fixed functionality
3. Run full test suite again
4. Document any known limitations
5. Deploy to production

---

*Last Updated*: February 2, 2026
