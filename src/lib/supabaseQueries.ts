/**
 * Supabase Database Query Functions
 * These functions handle all database operations for the Fleet Management System
 */

const SUPABASE_URL = 'https://ganrduvdyhlwkeiriaqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJkdXZkeWhsd2tlaXJpYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjQ3MjUsImV4cCI6MjA4MzU0MDcyNX0.ZSjqnzKQoWMVxNgalPCa4M3EbDVG57mnQyvqWE6FECU';

let supabase: any = null;

// Initialize Supabase client
export async function initSupabase() {
  if (supabase) return supabase;
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

// ====== USERS ======

export async function getCurrentUser() {
  const sb = await initSupabase();
  const { data: { user }, error } = await sb.auth.getUser();
  return { user, error };
}

export async function getUserProfile(userId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateUserProfile(userId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// ====== VEHICLES ======

export async function getAllVehicles() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getVehicleById(vehicleId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single();
  return { data, error };
}

export async function getVehiclesByStatus(status: 'available' | 'in_use' | 'maintenance' | 'broken' | 'disposed') {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createVehicle(vehicleData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles')
    .insert([vehicleData])
    .select()
    .single();
  return { data, error };
}

export async function updateVehicle(vehicleId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles')
    .update(updates)
    .eq('id', vehicleId)
    .select()
    .single();
  return { data, error };
}

export async function deleteVehicle(vehicleId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles')
    .delete()
    .eq('id', vehicleId);
  return { data, error };
}

// ====== DRIVERS ======

export async function getAllDrivers() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getDriverById(driverId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .single();
  return { data, error };
}

export async function getDriversByStatus(status: 'active' | 'retired' | 'suspended') {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('drivers')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createDriver(driverData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('drivers')
    .insert([driverData])
    .select()
    .single();
  return { data, error };
}

export async function updateDriver(driverId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('drivers')
    .update(updates)
    .eq('id', driverId)
    .select()
    .single();
  return { data, error };
}

// ====== VEHICLE ASSIGNMENTS ======

export async function getActiveAssignments() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('active_assignments')
    .select('*');
  return { data, error };
}

export async function createAssignment(assignmentData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_assignments')
    .insert([assignmentData])
    .select()
    .single();
  return { data, error };
}

export async function endAssignment(assignmentId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_assignments')
    .update({ status: 'completed', end_date: new Date().toISOString() })
    .eq('id', assignmentId)
    .select()
    .single();
  return { data, error };
}

export async function getAssignmentHistory(driverId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_assignments')
    .select('*')
    .eq('driver_id', driverId)
    .order('start_date', { ascending: false });
  return { data, error };
}

// ====== MAINTENANCE ======

export async function getMaintenanceByVehicle(vehicleId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('maintenance')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getOverdueMaintenance() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles_overdue_maintenance')
    .select('*');
  return { data, error };
}

export async function createMaintenanceRecord(maintenanceData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('maintenance')
    .insert([maintenanceData])
    .select()
    .single();
  return { data, error };
}

export async function updateMaintenanceRecord(maintenanceId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('maintenance')
    .update(updates)
    .eq('id', maintenanceId)
    .select()
    .single();
  return { data, error };
}

// ====== INSURANCE ======

export async function getInsuranceByVehicle(vehicleId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('insurance')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getExpiredInsurance() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles_expired_insurance')
    .select('*');
  return { data, error };
}

export async function createInsurancePolicy(policyData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('insurance')
    .insert([policyData])
    .select()
    .single();
  return { data, error };
}

export async function updateInsurancePolicy(policyId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('insurance')
    .update(updates)
    .eq('id', policyId)
    .select()
    .single();
  return { data, error };
}

export async function getAllInsurance() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('insurance')
    .select('*')
    .order('expiry_date', { ascending: true });
  return { data, error };
}

export async function deleteInsurancePolicy(policyId: string) {
  const sb = await initSupabase();
  const { error } = await sb
    .from('insurance')
    .delete()
    .eq('id', policyId);
  return { error };
}

// ====== FUEL LOGS ======

export async function getFuelLogsByVehicle(vehicleId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('fuel_logs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('refuel_date', { ascending: false });
  return { data, error };
}

export async function createFuelLog(fuelLogData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('fuel_logs')
    .insert([fuelLogData])
    .select()
    .single();
  return { data, error };
}

export async function updateFuelLog(fuelLogId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('fuel_logs')
    .update(updates)
    .eq('id', fuelLogId)
    .select()
    .single();
  return { data, error };
}

export async function deleteFuelLog(fuelLogId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('fuel_logs')
    .delete()
    .eq('id', fuelLogId);
  return { data, error };
}

export async function getFuelConsumptionStats(vehicleId: string) {
  const sb = await initSupabase();
  const { data: fuelLogs, error } = await sb
    .from('fuel_logs')
    .select('litres, cost, refuel_date')
    .eq('vehicle_id', vehicleId)
    .order('refuel_date', { ascending: false })
    .limit(30);

  if (error) return { data: null, error };

  if (!fuelLogs || fuelLogs.length === 0) {
    return { data: { totalLitres: 0, totalCost: 0, avgCostPerLitre: 0, refuelings: 0 }, error: null };
  }

  const totalLitres = fuelLogs.reduce((sum: number, log: any) => sum + log.litres, 0);
  const totalCost = fuelLogs.reduce((sum: number, log: any) => sum + log.cost, 0);
  const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

  return {
    data: {
      totalLitres: totalLitres.toFixed(2),
      totalCost: totalCost.toFixed(2),
      avgCostPerLitre: avgCostPerLitre.toFixed(2),
      refuelings: fuelLogs.length,
    },
    error: null,
  };
}

// ====== NOTIFICATIONS ======

export async function getNotificationsForUser(userId: string, unreadOnly = false) {
  const sb = await initSupabase();
  let query = sb
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

export async function createNotification(notificationData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();
  return { data, error };
}

export async function markNotificationAsRead(notificationId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();
  return { data, error };
}

export async function deleteNotification(notificationId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  return { data, error };
}

// ====== REPORTS & ANALYTICS ======

export async function getFleetSummary() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('fleet_summary')
    .select('*')
    .single();
  return { data, error };
}

export async function getDriversExpiringLicenses() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('drivers_expiring_licenses')
    .select('*');
  return { data, error };
}

export async function getExpiringInsurance() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles_expired_insurance')
    .select('*');
  return { data, error };
}

export async function getOverdueMaintenanceRecords() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicles_overdue_maintenance')
    .select('*');
  return { data, error };
}

// ====== DISPOSAL ======

export async function getAllDisposals() {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_disposal')
    .select('*')
    .order('disposal_date', { ascending: false });
  return { data, error };
}

export async function getDisposalByVehicle(vehicleId: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_disposal')
    .select('*')
    .eq('vehicle_id', vehicleId);
  return { data, error };
}

export async function createDisposal(disposalData: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_disposal')
    .insert([disposalData])
    .select()
    .single();
  return { data, error };
}

export async function updateDisposal(disposalId: string, updates: any) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('vehicle_disposal')
    .update(updates)
    .eq('id', disposalId)
    .select()
    .single();
  return { data, error };
}

export async function deleteDisposal(disposalId: string) {
  const sb = await initSupabase();
  const { error } = await sb
    .from('vehicle_disposal')
    .delete()
    .eq('id', disposalId);
  return { error };
}

// ====== AUTHENTICATION ======

export async function signOut() {
  const sb = await initSupabase();
  const { error } = await sb.auth.signOut();
  return { error };
}

export async function refreshSession() {
  const sb = await initSupabase();
  const { data, error } = await sb.auth.refreshSession();
  return { data, error };
}
