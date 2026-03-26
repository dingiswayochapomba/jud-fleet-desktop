# Notifications Feature - Visual & UX Guide

## 🎨 UI Component Hierarchy

```
App.tsx
├─ Sidebar.tsx
│  └─ "Notifications" menu item (with Bell icon)
│
├─ Header.tsx
│  ├─ Bell icon button
│  │  └─ Red badge (unread count)
│  │
│  └─ NotificationsPanel.tsx (dropdown)
│     ├─ Filter tabs (All / Unread)
│     ├─ Search notifications
│     └─ Notification list (max 4 visible in dropdown)
│
└─ Main content area
   └─ NotificationsPage.tsx (when "Notifications" tab active)
      ├─ Header with stats
      ├─ 4 KPI cards (Alerts, Warnings, Unread, Read)
      ├─ Search + 6 filter buttons
      └─ Full notification list with actions
```

---

## 📱 Visual Layout

### Header (Notifications Panel Dropdown)

```
┌─────────────────────────────────────────────────────────┐
│  Company Logo  Page Title        🔔(3) [V] [☰]          │  ← Bell shows unread count
└─────────────────────────────────────────────────────────┘
                                      ↓
                            ┌──────────────────┐
                            │  🔔 Notifications│ (panel)
                            ├──────────────────┤
                            │ [All] [Unread(3)]│
                            ├──────────────────┤
                            │ ⛔ Maintenance   │ (unread)
                            │    overdue...    │
                            ├──────────────────┤
                            │ ⚠️  Insurance    │ (unread)
                            │    expires soon  │
                            ├──────────────────┤
                            │ ⚠️  Fuel anomaly │ (unread)
                            │    detected      │
                            ├──────────────────┤
                            │ ℹ️  Fuel log     │ (read)
                            │    recorded      │
                            └──────────────────┘
```

### Full Page (NotificationsPage)

```
┌──────────────────────────────────────────────────────────┐
│ 🔔 Notifications              Total Notifications: 7    │ ← Header
└──────────────────────────────────────────────────────────┘

┌──────┬──────┬──────┬──────┐
│Alerts│Warns │Unread│ Read │ ← KPI Cards (4 columns)
│  2   │  3   │  4   │  3   │
└──────┴──────┴──────┴──────┘

┌─────────────────────────────┐
│ 🔍 Search notifications...   │ ← Search bar
│ [All][Unread][Alerts]        │
│ [Warnings][Info][Success]    │ ← Filter buttons
└─────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⛔ Maintenance overdue: Toyota Hilux  ⋮│ ← Notification item
│    Vehicle TJ 20 DJ - Last serviced    │    with menu (⋮)
│    [Alert] 2 hours ago                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠️  Insurance policy expiring soon   ⋮│
│    Toyota Hilux - Expires in 15 days    │
│    [Warning] 5 hours ago                │
└─────────────────────────────────────────┘

[... more notifications ...]
```

---

## 🎯 User Workflows

### Workflow 1: Check Unread Notifications (Quick)
1. User sees Bell icon in header with "3" badge
2. Clicks Bell to open NotificationsPanel
3. Reads notification previews (first 50 chars)
4. Clicks "Eye" icon to mark as read
5. Badge count updates automatically

### Workflow 2: Full Notification Review (Comprehensive)
1. User clicks "Notifications" in sidebar menu
2. NotificationsPage loads with all notifications
3. Scans 7 KPI stats at top
4. Uses search bar to find specific notification
5. Uses filter buttons to narrow by type
6. Clicks dropdown menu (⋮) on notification
7. Chooses "Mark as read" or "Delete"

### Workflow 3: Dismiss All Unread
1. Filters to "Unread" tab
2. Marks each notification as read
3. Unread count in header updates
4. Returns to "All" view

---

## 🎨 Color Coding

### Notification Type Indicators

```
Alert (Red)
├─ Background: Red-50 (light red)
├─ Border: Red-200
├─ Icon: AlertCircle (red-600)
├─ Badge: Red-100
└─ Use: Critical issues requiring immediate action

Warning (Amber)
├─ Background: Amber-50 (light amber)
├─ Border: Amber-200
├─ Icon: AlertCircle (amber-600)
├─ Badge: Amber-100
└─ Use: Important warnings with deadlines

Info (Blue)
├─ Background: Blue-50 (light blue)
├─ Border: Blue-200
├─ Icon: Info (blue-600)
├─ Badge: Blue-100
└─ Use: Informational updates

Success (Emerald)
├─ Background: Emerald-50 (light emerald)
├─ Border: Emerald-200
├─ Icon: CheckCircle (emerald-600)
├─ Badge: Emerald-100
└─ Use: Completed tasks/positive updates
```

---

## ⚡ Interactive Elements

### Bell Icon States

```
┌─ Idle State (0 unread)
│  🔔 (gray, outline only)
│
├─ Unread Present (1-9 unread)
│  🔔 with badge: "3" (red background, white text)
│
└─ Many Unread (10+ unread)
   🔔 with badge: "9+" (red background, white text)
```

### Notification Item Hover States

```
Default State:
┌──────────────────────────┐
│ ⚠️  Warning message...   │
│    [Warning] 2 hrs ago   │
└──────────────────────────┘

Hover State (shows actions):
┌──────────────────────────┐
│ ⚠️  Warning message...  ⋮│ ← Menu appears
│    [Warning] 2 hrs ago   │
└──────────────────────────┘

Click Menu (⋮):
┌──────────────────────────┐
│ 👁️  Mark as read        │
├──────────────────────────┤
│ 🗑️  Delete             │
└──────────────────────────┘
```

---

## 📊 Mock Data Examples

### Alert Example
```
⛔ Vehicle maintenance overdue: Toyota Hilux (TJ 20 DJ)
   Last serviced 90 days ago
   [Alert] Unread | 2 hours ago
```

### Warning Example
```
⚠️  Insurance policy expiring soon: Toyota Hilux
    Expires in 15 days
    [Warning] Unread | 5 hours ago
```

### Info Example
```
ℹ️  New fuel log recorded: Vehicle TJ 20 DJ
    Refueled 50L at Caltex
    [Info] Read | 2 days ago
```

### Success Example
```
✅ Maintenance completed: Oil change service
   Finished for Nissan Patrol
   [Success] Read | 3 days ago
```

---

## 🔔 Badge Counter Logic

```javascript
// Badge display algorithm
const unreadCount = notifications.filter(n => !n.is_read).length;

if (unreadCount === 0) {
  showBadge = false; // No badge
} else if (unreadCount > 9) {
  badgeText = "9+"; // Cap at 9+
} else {
  badgeText = unreadCount.toString(); // Show actual number
}

// Badge styling
badgeClass = "absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
```

---

## 🎯 Responsive Behavior

### Desktop View (md and up)
```
Header: Full layout with Bell icon + NotificationsPanel
KPI Cards: 4 columns
Filters: All on one line
List: Full width with hover effects
```

### Tablet View (sm to md)
```
Header: Compact Bell icon
KPI Cards: 2 columns stacked
Filters: Wrapped on multiple lines
List: Full width
```

### Mobile View (xs)
```
Header: Hamburger menu, Bell icon compressed
KPI Cards: 2 columns
Filters: Scrollable horizontal list
List: Full width, optimized for touch
```

---

## 🖱️ Keyboard Navigation (Future Enhancement)

```
Key | Action
─────────────────────────────────────
n   | Focus notifications dropdown
↑   | Previous notification in list
↓   | Next notification in list
r   | Mark current as read
d   | Delete current notification
esc | Close dropdown/modal
```

---

## 📈 Demo Mode Indicators

### Notice Banner
```
┌──────────────────────────────────────────┐
│ 📌 Demo Mode                             │
│ Showing sample notifications. Real       │
│ notifications will appear here once      │
│ created in the system.                   │
└──────────────────────────────────────────┘
```

### Mock Data Badge
All mock notifications have IDs starting with "mock-" prefix for identification.

---

## 🚀 Animation States

### Loading State
```
┌──────────────────────────────────────┐
│          🔄 (spinning)               │
│                                      │
│   Loading notifications...           │
└──────────────────────────────────────┘
```

### Empty State
```
┌──────────────────────────────────────┐
│                                      │
│         ✅ (large checkmark)         │
│                                      │
│     No notifications found           │
│   You're all caught up!             │
└──────────────────────────────────────┘
```

### Error State
```
┌──────────────────────────────────────┐
│ ❌ Error loading notifications       │
│ TypeError: fetch failed              │
│ [Retry] button                       │
└──────────────────────────────────────┘
```

---

## 🎨 Design System Integration

**Consistent with:**
- Status card gradients (Dashboard)
- Color scheme (emerald/amber/red/blue)
- Icon sizes (16-20px for consistency)
- Spacing (p-3, gap-2, rounded-lg)
- Typography (text-sm for labels, text-xs for timestamps)
- Border styles (border-200 for cards, rounded-lg)

---

## 📝 Accessibility Features

- ✅ Color + icon combination (not color-only)
- ✅ Readable text contrast (WCAG AA compliant)
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Focus states visible on buttons
- ✅ Keyboard dismissible dropdown

---

**Last Updated:** January 11, 2026
