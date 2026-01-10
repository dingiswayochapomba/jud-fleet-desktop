# Fuel Tracking - Quick Start Guide

**Status:** ✅ Live and Ready to Use  
**Last Updated:** January 10, 2026

---

## 🚀 Getting Started

### Access Fuel Tracking

1. **Log in to Fleet Management System**
   - Enter your credentials
   - Navigate to dashboard

2. **Open Fuel Tracking Module**
   - Click **"Fuel Tracking"** in the sidebar (Zap icon ⚡)
   - You'll see all fuel logs for the currently selected vehicle

3. **Open Fuel Analytics** (Optional)
   - Click **"Fuel Analytics"** in the sidebar (Trending Up icon 📈)
   - View comprehensive fuel consumption analytics and charts

---

## 📝 Adding Your First Fuel Log

1. **Click "Log Fuel" Button**
   - At the top of the Fuel Tracking page
   - A form will expand

2. **Fill Required Fields:**
   - **Refuel Date**: When you refueled (date picker)
   - **Litres**: Amount of fuel (decimal number)
   - **Cost (MWK)**: Amount paid in Malawi Kwacha

3. **Optional Fields:**
   - **Fuel Station**: Name of the station (e.g., "Shell Lilongwe")
   - **Driver**: Assign a driver to the refueling
   - **Odometer (km)**: Current vehicle mileage (important for efficiency)
   - **Receipt URL**: Link to receipt photo (for documentation)

4. **Click "Save Log"**
   - Log is saved immediately
   - Statistics update automatically
   - Table refreshes with new entry

---

## 📊 Understanding the Statistics

When you add fuel logs, 4 key metrics appear:

### 1. **Total Litres**
- Sum of all fuel purchased for selected vehicle
- Helps track overall consumption
- Example: `245.50L`

### 2. **Total Cost**
- Sum of all fuel costs
- Shows spending in Malawi Kwacha
- Example: `K50,000`

### 3. **Cost per Litre**
- Average price you paid per litre
- Formula: `Total Cost ÷ Total Litres`
- Helps identify price variations
- Example: `K204/L`

### 4. **Fuel Efficiency**
- How many kilometers per litre (km/L)
- Automatically calculated from odometer readings
- Example: `8.5 km/L`
- **How it works:**
  - Uses odometer readings from consecutive refuelings
  - Divides distance by litres used
  - Ignores unrealistic values

---

## 🔍 Filtering and Sorting

### Filter by Month
- Use the date picker to select a specific month
- Default shows current month
- Quickly find logs from a specific period

### Sort by Different Criteria
- **Date (Newest)** - Most recent refuelings first
- **Cost (Highest)** - Most expensive refuelings first
- **Litres (Most)** - Largest refuelings first

---

## ✏️ Editing Fuel Logs

1. Find the log you want to edit in the table
2. Click the **Edit** button (pencil icon ✏️)
3. Form opens with current values
4. Make your changes
5. Click **"Update Log"** to save
6. Statistics recalculate automatically

---

## 🗑️ Deleting Fuel Logs

1. Find the log in the table
2. Click **Delete** button (trash icon 🗑️)
3. Confirm deletion
4. Log is removed permanently
5. Statistics update

⚠️ **Warning:** Deletion cannot be undone. Make sure you want to remove the log.

---

## 📈 Using Fuel Analytics

### View Analytics Dashboard

1. Click **"Fuel Analytics"** in sidebar
2. Select a vehicle from dropdown
3. View statistics cards at the top:
   - Total Cost
   - Total Litres
   - Fuel Efficiency
   - Average Monthly Cost
   - Anomalies Detected

### Analyze Charts

**Fuel Consumption Trend**
- Shows litres consumed over time
- Identify consumption patterns
- Spot unusual activity

**Cost Trend**
- Visualize fuel cost changes
- Identify expensive periods
- Compare prices over time

**Fuel Efficiency Trend**
- Track km/L performance
- Monitor vehicle condition
- Identify declining efficiency

**Monthly Breakdown**
- Last 12 months of data
- Compare costs across months
- Track seasonal variations

**Refuelings by Month**
- How often vehicle was refueled
- Identify usage patterns
- Plan refueling schedule

---

## 🎯 Best Practices

### 1. **Always Record Odometer**
- Essential for efficiency calculation
- Enables accurate fuel tracking
- Helps detect mechanical issues

### 2. **Use Station Names**
- Track where you refuel
- Identify cost differences by station
- Useful for route optimization

### 3. **Assign Drivers**
- Helps track driver behavior
- Useful for multi-driver vehicles
- Enables driver-specific analytics

### 4. **Save Receipt URLs**
- Proof for accounting/audits
- Quick verification of costs
- Resolves disputes about prices

### 5. **Regular Updates**
- Log fuel immediately after refueling
- Don't delay entries
- Maintains accurate data

---

## 🔧 Common Tasks

### Check Average Fuel Efficiency
1. Go to Fuel Analytics
2. Look at "Fuel Efficiency" card
3. Shows current km/L average
4. Compare with previous months

### Find Most Expensive Refuelings
1. In Fuel Tracking, click "Log Fuel"
2. In the table, use Sort option
3. Select "Cost (Highest)"
4. Most expensive at top

### Compare Multiple Vehicles
1. Go to Fuel Analytics
2. Click vehicle buttons to select multiple
3. Charts update with all selected vehicles
4. Easy side-by-side comparison

### Detect Anomalies
1. Go to Fuel Analytics
2. Check "Anomalies" card
3. Shows number of unusual patterns
4. Investigate efficiency drops
5. Could indicate mechanical issues

### Export Last Month's Data
1. Go to Fuel Tracking
2. Select month with filter
3. Take screenshot of table
4. Or manually note values for reporting

---

## 💡 Tips & Tricks

### Efficiency Insights
- Normal range for vehicles: 6-12 km/L
- Decreasing efficiency = maintenance needed
- Sudden drop = possible mechanical issue
- Compare with baseline for your vehicle type

### Cost Optimization
- Track cost/L over time
- Identify expensive stations
- Plan refueling at cheaper locations
- Bulk refueling may have economies of scale

### Data Entry Speed
- Use Tab key to move between fields
- Date picker has calendar interface
- Decimal places auto-format
- Previous station name may auto-fill

### Troubleshooting Efficiency
- Ensure odometer readings are accurate
- Check for recent maintenance needs
- Monitor tire pressure
- Review driver behavior
- Consider road conditions

---

## 🚨 Common Issues

### "Fuel Log Won't Save"
- ❌ Missing required fields (date, litres, cost)
- ✅ Fill all required fields with valid numbers
- ✅ Ensure date is realistic

### "Efficiency Shows as 0"
- ❌ No odometer reading recorded
- ✅ Add odometer reading to all logs
- ✅ Odometer must increase for each refuel

### "Chart Data Not Showing"
- ❌ No logs in selected time range
- ✅ Adjust month filter
- ✅ Change time range in Analytics
- ✅ Add more fuel logs

### "Statistics Seem Wrong"
- ❌ Data still loading
- ✅ Wait for page to fully load
- ✅ Refresh page if needed
- ✅ Check data in table matches your entries

---

## 📞 Support

**Issues or Questions?**
- Check the main documentation: `FUEL_TRACKING_GUIDE.md`
- Review database schema: `DATABASE_SCHEMA.md`
- Check technical setup: `DATABASE_SETUP.md`

---

## ✅ Feature Checklist

- ✅ Log fuel purchases
- ✅ Track fuel costs
- ✅ Calculate fuel efficiency
- ✅ View consumption trends
- ✅ Compare vehicles
- ✅ Filter by month
- ✅ Sort logs
- ✅ Edit logs
- ✅ Delete logs
- ✅ View analytics charts
- ✅ Detect anomalies
- ✅ Assign drivers
- ✅ Store receipt links

---

## 🎓 Next Steps

1. **Add your first fuel log** - Get familiar with the form
2. **Explore the analytics** - See the charts in action
3. **Compare vehicles** - If you have multiple vehicles
4. **Set a baseline** - Record at least 5 logs to establish patterns
5. **Monitor trends** - Check regularly for improvements/issues
