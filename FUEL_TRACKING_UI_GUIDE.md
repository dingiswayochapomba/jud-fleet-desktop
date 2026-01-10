# Fuel Tracking System - UI/UX Guide

**Last Updated:** January 10, 2026  
**Component:** Fuel Tracking Module

---

## 🎨 UI Overview

### Navigation Structure
```
Dashboard
├── Fuel Tracking (NEW) ⚡
│   ├── Fuel Log Input Form
│   ├── Statistics Cards (4)
│   ├── Filter & Sort Controls
│   └── Fuel Logs Table
└── Fuel Analytics (NEW) 📈
    ├── Vehicle Selector
    ├── Statistics Cards (5)
    ├── Time Range Selector
    └── Charts (6 types)
```

---

## 📱 Fuel Tracking Page Layout

### 1. Page Header
```
┌─────────────────────────────────────────────────┐
│ ⚡ Fuel Tracking                    [+ Log Fuel]│
│ Monitor fuel consumption and costs across fleet │
└─────────────────────────────────────────────────┘
```
- Component title with icon
- Description text
- Primary action button (Log Fuel)
- Color: Header uses brand colors

### 2. Vehicle Selector
```
┌─────────────────────────────────────────────────┐
│ Select Vehicle                                  │
│ [▼ ABC 1234 - Toyota Hilux        ________]    │
└─────────────────────────────────────────────────┘
```
- Dropdown with all fleet vehicles
- Shows registration + make + model
- Default: First vehicle selected
- Updates all data when changed

### 3. Error Alert (if applicable)
```
┌─────────────────────────────────────────────────┐
│ ⚠️  Error                                        │
│ Failed to load fuel logs                        │
│ [Try refreshing or contact support]             │
└─────────────────────────────────────────────────┘
```
- Red background (#FEE2E2)
- Warning icon
- Error message
- Appears when issues occur

### 4. Fuel Log Form (Collapsed by Default)
```
┌─────────────────────────────────────────────────┐
│ New Fuel Log                      [Cancel]      │
├─────────────────────────────────────────────────┤
│ Refuel Date *          │ Fuel Station           │
│ [2026-01-10 ________] │ [Shell Lilongwe ___]   │
│                                                  │
│ Litres *               │ Cost (MWK) *           │
│ [50.00 ___________]    │ [10000.00 ___________] │
│                                                  │
│ Odometer (km)          │ Driver                 │
│ [45000 ____________]   │ [Select driver ____]   │
│                                                  │
│ Receipt URL / Photo Link                        │
│ [https://example.com/receipt.jpg ___________]   │
│                                                  │
│ [Save Log]  [Cancel]                            │
└─────────────────────────────────────────────────┘
```
- Grid layout: 2 columns on desktop, 1 on mobile
- Required fields marked with *
- Color scheme: White background, gray borders
- Form expands when "Log Fuel" clicked
- Collapses when canceled or saved

### 5. Statistics Cards (4-Column Grid)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Litr. │ Total Cost  │ Cost/Litre  │ Efficiency  │
│             │             │             │             │
│   245.50L   │   K50,000   │   K204/L    │  8.5 km/L   │
│             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```
- 4 cards in row (responsive: 1 col mobile, 2 col tablet)
- Each card has:
  - Title at top
  - Large bold number
  - Unit label below
- Card colors: White background, subtle hover effect
- Icons: Lucide React icons on right side

### 6. Filters & Sort Bar
```
┌─────────────────────────────────────────────────┐
│ 🔍 Month: [Jan 2026 ▼] 
│ ▼ Sort by: [Date (Newest) ▼]  
│ Showing 15 entries
└─────────────────────────────────────────────────┘
```
- Left side: Filter controls
- Right side: Entry count
- Compact horizontal layout
- Dropdowns for interaction

### 7. Fuel Logs Table
```
┌────────┬──────────┬────────┬──────┬────────┬───────┬────────┬─────────┐
│ Date   │ Station  │ Litres │ Cost │ Cost/L │ Odo.  │ Driver │ Actions │
├────────┼──────────┼────────┼──────┼────────┼───────┼────────┼─────────┤
│ 10 Jan │ Shell    │ 50.00L │K9500 │ K190/L │ 45000 │ John   │ ✏️ 🗑️  │
│ 08 Jan │ Bp       │ 45.50L │K8900 │ K195/L │ 44500 │ Mary   │ ✏️ 🗑️  │
│ 05 Jan │ Shell    │ 52.00L │K10100│ K194/L │ 43980 │ John   │ ✏️ 🗑️  │
└────────┴──────────┴────────┴──────┴────────┴───────┴────────┴─────────┘
```
- Column headers bold and gray background
- Data rows with alternating hover effects
- Numbers aligned right
- Action buttons (edit/delete) on right
- Scrollable on mobile
- Sorted by selected criteria

### 8. Last Refuel Info Bar (Bottom)
```
┌─────────────────────────────────────────────────┐
│ Last Refueling                                  │
│ Date: 10 Jan │ Amount: 50.00L │ Cost: K9500    │
│ Station: Shell Lilongwe                         │
└─────────────────────────────────────────────────┘
```
- Coral gradient background (#EA7B7B to #D65A5A)
- White text
- Shows most recent refueling
- Quick reference for driver

---

## 📊 Fuel Analytics Page Layout

### 1. Page Header
```
┌─────────────────────────────────────────────────┐
│ 📈 Fuel Analytics                               │
│ Comprehensive fuel consumption and cost analysis│
└─────────────────────────────────────────────────┘
```

### 2. Vehicle Selector
```
┌─────────────────────────────────────────────────┐
│ Select Vehicle                                  │
│ [▼ ABC 1234 - Toyota Hilux        ________]    │
└─────────────────────────────────────────────────┘
```

### 3. Statistics Cards (5-Column Grid)
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Total    │ Total    │ Fuel     │ Avg      │ Anomal.  │
│ Cost     │ Litres   │ Efficien │ Monthly  │ Detected │
│          │          │ cy       │          │          │
│ K50,000  │ 245.50L  │ 8.5km/L  │ K8,200   │ 0        │
│          │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```
- 5 cards (responsive layout)
- Last card (Anomalies) changes color if > 0 (yellow)
- Icons relevant to each metric

### 4. Vehicle Multi-Select
```
┌─────────────────────────────────────────────────┐
│ Select Vehicles to Compare                      │
│ [ABC1234] [XYZ5678] [DEF9012] [GHI3456] [JKL7890]
└─────────────────────────────────────────────────┘
```
- Button-style toggles
- Active: Coral background (#EA7B7B)
- Inactive: Gray background
- Multiple selection allowed
- Updates charts in real-time

### 5. Time Range Selector
```
┌─────────────────────────────────────────────────┐
│ Time Range: [Last 7 Days] [Last 30 Days] [Last 90]
└─────────────────────────────────────────────────┘
```
- Three quick-select buttons
- Active: Coral background
- Changes chart data range

### 6. Charts Layout (Responsive Grid)
```
Desktop (2 columns):
┌──────────────────────────┬──────────────────────────┐
│   Fuel Consumption       │   Cost Trend             │
│        (Line Chart)      │   (Bar Chart)            │
├──────────────────────────┼──────────────────────────┤
│   Fuel Efficiency Trend  │   Monthly Breakdown      │
│        (Line Chart)      │   (Dual Bar Chart)       │
├──────────────────────────┴──────────────────────────┤
│   Refuelings by Month    │   Cost Distribution      │
│   (Bar Chart)            │   (Pie Chart)            │
└──────────────────────────┴──────────────────────────┘

Tablet (1-2 columns):
┌──────────────────────────┐
│ Chart 1                  │
├──────────────────────────┤
│ Chart 2                  │
├──────────────────────────┤
│ Chart 3                  │
└──────────────────────────┘
```

---

## 🎨 Color Scheme

### Primary Colors
- **Main Coral:** `#EA7B7B`
- **Dark Coral:** `#D65A5A`
- **Gradient:** from #EA7B7B to #D65A5A

### Neutral Colors
- **Text Dark:** `#111827` (gray-900)
- **Text Secondary:** `#4B5563` (gray-600)
- **Background Light:** `#F3F4F6` (gray-100)
- **White:** `#FFFFFF`

### Status Colors
- **Success Green:** `#16A34A`
- **Error Red:** `#B91C1C`
- **Warning Yellow:** `#CA8A04`
- **Info Blue:** `#3B82F6`

### Component-Specific
- **Card Background:** White
- **Card Border:** Gray-200
- **Hover State:** Slight shadow increase
- **Active Button:** Coral #EA7B7B
- **Inactive Button:** Gray-100

---

## 🎯 Interactive Elements

### Buttons
```
Primary Button:
┌──────────────┐
│ + Log Fuel   │  Color: #EA7B7B, White text, hover: #D65A5A
└──────────────┘

Secondary Button:
┌──────────────┐
│ Cancel       │  Color: Gray-300, Gray-700 text
└──────────────┘

Icon Button:
┌─┐
│✏│  Pencil for edit (Blue-600)
└─┘

┌─┐
│🗑│  Trash for delete (Red-600)
└─┘
```

### Form Elements
- **Input Fields:** 2px border gray-300, 4px focus ring #EA7B7B
- **Dropdown Select:** Same border as inputs
- **Date Picker:** Calendar interface, date selection
- **Text Areas:** Not used currently

### Icons (Lucide React)
- **Fuel:** ⚡ Zap (blue background)
- **Analytics:** 📈 TrendingUp (coral background)
- **Efficiency:** 📊 TrendingUp with km/L label
- **Cost:** 💰 DollarSign (green background)
- **Warning:** ⚠️ AlertTriangle (red background)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px (md)
- **Tablet:** 768px - 1024px (lg)
- **Desktop:** > 1024px

### Layout Changes

**Mobile:**
```
Cards: 1 column
Form: 1 column
Table: Horizontal scroll
Charts: Full width, reduced height
```

**Tablet:**
```
Cards: 2 columns
Form: 1-2 columns (staggered)
Table: Full width
Charts: Full width
```

**Desktop:**
```
Cards: 4-5 columns
Form: 2 columns (side by side)
Table: Full width
Charts: 1-2 per row (responsive grid)
```

---

## ⚡ Performance Visual Feedback

### Loading States
```
┌─────────────────────────────────────┐
│         ⚡ Spinning                 │
│   Loading fuel tracking...          │
└─────────────────────────────────────┘
```

### Empty States
```
┌─────────────────────────────────────┐
│            ⚡ (grayed out)          │
│       No fuel logs yet              │
│  Start tracking by adding a new log │
└─────────────────────────────────────┘
```

### Success States
- ✅ Toast notification (briefly)
- Data automatically updates
- Statistics recalculate
- No reload needed

### Error States
```
┌──────────────────────────────────────┐
│ ⚠️  Error                             │
│ Failed to save fuel log              │
│ Please try again                     │
└──────────────────────────────────────┘
```

---

## 🎓 Visual Hierarchy

1. **Page Title** (Largest, bold)
2. **Section Headers** (Large, bold)
3. **Card Titles** (Medium, bold)
4. **Data Values** (Large numbers, bold)
5. **Labels** (Small, gray text)
6. **Helper Text** (Extra small, lighter gray)

---

## ♿ Accessibility Features

- ✅ High contrast text (WCAG AA)
- ✅ Form labels properly associated
- ✅ Icon buttons have titles
- ✅ Color not only differentiator
- ✅ Keyboard navigation supported
- ✅ Focus states visible
- ✅ Error messages descriptive
- ✅ Required fields marked

---

## 🔄 Interaction Flows

### Adding a Fuel Log
```
1. User clicks "Log Fuel" button
   ↓
2. Form expands with input fields
   ↓
3. User fills required fields
   ↓
4. User clicks "Save Log"
   ↓
5. Data validates client-side
   ↓
6. Sends to database
   ↓
7. Receives confirmation
   ↓
8. Table updates with new entry
   ↓
9. Statistics recalculate
   ↓
10. Form resets and collapses
```

### Viewing Analytics
```
1. User navigates to Fuel Analytics
   ↓
2. Selects vehicle from dropdown
   ↓
3. Fetches fuel logs from database
   ↓
4. Displays statistics cards
   ↓
5. Renders charts from data
   ↓
6. User can select multiple vehicles
   ↓
7. Charts update with comparison data
   ↓
8. User adjusts time range
   ↓
9. Charts re-render with filtered data
```

---

## 📐 Spacing & Sizing

### Card Padding
- Top/Bottom: 24px (p-6)
- Left/Right: 24px (p-6)

### Form Input Height
- Standard: 40px (py-2 with 2px border)
- With label: 60px total

### Button Sizing
- Height: 40px
- Padding: 12px horizontal
- Font: 14px medium

### Chart Height
- Default: 300px
- Adjusts for responsive

### Border Radius
- Cards: 8px
- Buttons: 8px
- Inputs: 8px

---

## 🌙 Dark Mode Support

**Current Status:** Not implemented (light mode only)  
**Future Enhancement:** CSS variables can enable dark mode

---

## Summary

The Fuel Tracking UI provides:
- **Clear Information Hierarchy** - Important data stands out
- **Efficient Navigation** - Two-tab system (Tracking & Analytics)
- **Responsive Design** - Works on all devices
- **Consistent Styling** - Coral theme throughout
- **Interactive Feedback** - Loading, errors, success states
- **Accessibility** - WCAG AA compliant
- **Professional Appearance** - Modern, clean design
