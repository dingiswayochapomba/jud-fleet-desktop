# 🚀 Vehicles Page - Quick Testing Guide

## Access the App

### Dev Server URL
**http://localhost:5176** (or check terminal for exact port)

### Login Credentials
```
Email: dingiswayochapomba@gmail.com
Password: @malawi2017
```

---

## Expected Behavior

### ✅ Page Load (First 3 seconds)
1. **Loading Screen** appears with spinner
   - Text: "Loading Vehicles"
   - Subtitle: "Fetching data from database..."
   - Hint: "This may take a few seconds"

2. **Data Loads** automatically
   - Vehicles table appears
   - Stats cards show counts
   - Charts appear (Pie chart + Bar chart)

### ✅ Vehicles Table
Should display columns:
- Registration (e.g., "MZ001")
- Vehicle (e.g., "Toyota Land Cruiser")
- Year
- Mileage (formatted with commas)
- Status (colored badge)
- Actions (eye, edit, trash icons)

### ✅ Stats Cards
Shows 6 cards:
- **Total:** All vehicles
- **Available:** Green
- **In Use:** Blue
- **Maintenance:** Amber
- **Broken:** Red
- **Disposed:** Gray

### ✅ Charts
**Pie Chart (Left):**
- Shows status distribution
- Labeled with count
- Color-coded sections

**Bar Chart (Right):**
- Shows average mileage by vehicle make
- X-axis: Make names
- Y-axis: Mileage (km)

---

## Interactive Tests

### 1️⃣ Search
**Action:** Type "Toyota" in search box
**Expected:** Table updates immediately, showing only Toyota vehicles

### 2️⃣ Filter by Status
**Action:** Select "Available" from dropdown
**Expected:** Table shows only available vehicles

### 3️⃣ Add New Vehicle
**Steps:**
1. Click **"+ Add Vehicle"** button
2. Fill form fields:
   - Registration: `TEST001`
   - Make: `Nissan`
   - Model: `Navara`
   - Year: `2023`
   - Status: `Available`
   - Mileage: `5000`
   - Fuel: `Diesel`
3. Click **"Add Vehicle"**

**Expected:**
- Modal closes
- New vehicle appears at TOP of table
- Stats cards update (+1 to Total)
- Pie chart updates (Available count +1)

### 4️⃣ View Details
**Steps:**
1. Click **eye icon** on any vehicle
2. Review details in modal

**Expected:**
- Modal shows full vehicle details
- All fields populated correctly
- Close button works
- Edit button available

### 5️⃣ Edit Vehicle
**Steps:**
1. Click **edit icon** on any vehicle
2. Change any field (e.g., Mileage)
3. Click **"Update Vehicle"**

**Expected:**
- Modal closes
- Table updates with new data
- Changes persist

### 6️⃣ Delete Vehicle
**Steps:**
1. Click **trash icon** on any vehicle
2. Confirmation modal appears
3. Click **"Delete"**

**Expected:**
- Modal closes
- Vehicle removed from table
- Stats cards update
- Charts update

---

## Performance Test

### First Load (Cold)
**Expected Time:** 2-3 seconds
**Indication:** Will see database query messages in browser console

### Second Load (Warm - within 5 min)
**How:** 
1. Click another tab
2. Come back to Vehicles tab

**Expected Time:** < 100ms
**Indication:** Console shows "💾 Using cached result"

---

## Error Scenarios

### Test 1: Add without Required Field
**Steps:**
1. Click "Add Vehicle"
2. Leave "Make" field empty
3. Click "Add Vehicle"

**Expected:** 
- Form error message: "Make is required"
- Modal stays open

### Test 2: Network Error
**Steps:**
1. Open Dev Tools (F12)
2. Go to Network tab
3. Set to "Offline"
4. Refresh page

**Expected:**
- Error message displays
- Suggestion to retry

---

## Browser Console Messages (Debug Info)

### Expected Log Messages

**On Load:**
```
📡 Fetching vehicles from database...
📡 Attempt 1: Fetching vehicles (limit 100)...
✅ Loaded 14 vehicles
```

**On Add/Edit/Delete:**
```
📝 Submitting vehicle form...
✅ Vehicle created successfully
✅ Vehicle updated successfully
🗑️ Deleting vehicle...
✅ Vehicle deleted successfully
```

**On Second Load (Cached):**
```
💾 Using cached result
✅ Loaded 14 vehicles
```

---

## Known Good State

If you see this, everything is working:

✅ Vehicles load within 3 seconds
✅ Table shows data
✅ Stats cards show numbers
✅ Charts render without errors
✅ Search works instantly
✅ Filter updates table
✅ Add/Edit/Delete work
✅ Modals open and close smoothly
✅ No console errors (except GPU warnings, which are fine)
✅ Colors match coral theme (#EA7B7B)

---

## Troubleshooting

### Page Won't Load
- Check console for errors (F12 → Console)
- Check network tab for failed requests
- Restart dev server: `npm run dev`

### Data Won't Show
- Check Supabase connection (look for REST API fallback messages in console)
- Verify Supabase credentials in `.env`
- Check if vehicles table has data

### Forms Not Working
- Check for validation error messages
- Verify all required fields filled
- Check console for errors

### Charts Blank
- Check if you have vehicles in database
- Status distribution pie needs at least 1 vehicle
- Mileage chart needs at least 2 different makes

---

## Success Criteria

✅ **Page loads in < 3 seconds**
✅ **All CRUD operations work (Create, Read, Update, Delete)**
✅ **Search and filter work instantly**
✅ **Charts display correctly**
✅ **No console errors (GPU warnings OK)**
✅ **Responsive on mobile and desktop**
✅ **Coral theme colors consistent**
✅ **Error messages helpful and clear**

---

**This version is production-ready and fully functional!** 🎉
