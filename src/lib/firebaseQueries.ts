import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { buildDriverExpiryNotifications, buildDriverRetirementNotifications, buildVehicleStatusNotifications, dedupeNotificationsBySignature } from './notificationUtils';

type Result<T> = { data: T | null; error: any };

const offlineCache = new Map<string, any[]>();

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeRoleValue(role?: string | null): string {
  const value = (role || '').toString().trim().toLowerCase();
  if (value === 'system_admin' || value === 'admin') return 'system_admin';
  if (value === 'court_administrator' || value === 'manager') return 'court_administrator';
  if (value === 'transport_officer' || value === 'user') return 'transport_officer';
  return 'transport_officer';
}

export function buildUserProfilePayload(formData: Record<string, any>, firebaseUid?: string | null) {
  const { password: _password, ...rest } = formData || {};
  return {
    ...rest,
    email: (rest.email || '').trim().toLowerCase(),
    name: (rest.name || '').trim(),
    role: normalizeRoleValue(rest.role),
    status: rest.status || 'active',
    position: (rest.position || '').trim(),
    jurisdiction: (rest.jurisdiction || '').trim(),
    created_at: rest.created_at || nowIso(),
    last_login: rest.last_login || null,
    ...(firebaseUid ? { firebase_uid: firebaseUid, auth_provider: 'firebase' } : {}),
  };
}

export function buildActivityLogPayload(input: Record<string, any> = {}) {
  const createdAt = input.created_at || nowIso();
  return {
    actor_id: input.actor_id || null,
    actor_email: (input.actor_email || '').trim().toLowerCase() || null,
    actor_name: (input.actor_name || '').trim(),
    action: (input.action || 'unknown').trim().toLowerCase(),
    category: (input.category || 'general').trim().toLowerCase(),
    severity: (input.severity || 'info').trim().toLowerCase(),
    details: (input.details || '').trim(),
    target_user_id: input.target_user_id || null,
    target_user_email: input.target_user_email ? (input.target_user_email || '').trim().toLowerCase() : null,
    metadata: input.metadata || {},
    created_at: createdAt,
    timestamp: input.timestamp || createdAt,
  };
}

export function buildDriverPayload(input: Record<string, any> = {}) {
  const normalized = {
    name: (input.name || '').trim(),
    license_number: (input.license_number || '').trim(),
    phone: (input.phone || '').trim(),
    license_expiry: input.license_expiry || '',
    status: input.status || 'active',
    date_of_birth: input.date_of_birth || '',
    date_of_appointment: input.date_of_appointment || '',
    license_class: (input.license_class || '').trim(),
    cost_center: (input.cost_center || '').trim(),
    division: (input.division || '').trim(),
    created_at: input.created_at || nowIso(),
  };

  return normalized;
}

function withId<T extends Record<string, any>>(id: string, value: any): T {
  return { id, ...(value || {}) } as T;
}

function getOfflineCacheKey(name: string) {
  return `offline:${name}`;
}

export function setCachedCollection(name: string, data: any[]) {
  offlineCache.set(getOfflineCacheKey(name), data);
  if (typeof window !== 'undefined') {
    localStorage.setItem(getOfflineCacheKey(name), JSON.stringify(data));
  }
}

export function getCachedCollection<T>(name: string): T[] | null {
  const key = getOfflineCacheKey(name);
  if (offlineCache.has(key)) {
    return offlineCache.get(key) as T[];
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as T[];
        offlineCache.set(key, parsed);
        return parsed;
      } catch {
        localStorage.removeItem(key);
      }
    }
  }
  return null;
}

function createOfflineResult<T>(name: string, fallback?: T[] | null): Result<T[]> {
  const cached = getCachedCollection<T>(name) ?? fallback ?? [];
  if (cached && cached.length > 0) {
    return { data: cached, error: null };
  }
  return { data: [], error: { message: 'Offline mode: no cached data available', code: 'offline' } };
}

async function listDocs<T>(name: string, constraints: any[] = []): Promise<Result<T[]>> {
  try {
    const q = query(collection(firestoreDb, name), ...constraints);
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => withId<T>(d.id, d.data()));
    setCachedCollection(name, items as any[]);
    return { data: items, error: null };
  } catch (error) {
    return createOfflineResult<T>(name);
  }
}

async function listDocsByField<T>(name: string, field: string, value: any): Promise<Result<T[]>> {
  return listDocs<T>(name, [where(field, '==', value)]);
}

async function addOne<T extends Record<string, any>>(name: string, payload: T): Promise<Result<T>> {
  try {
    const normalized = { ...payload, created_at: payload.created_at || nowIso() };
    const ref = await addDoc(collection(firestoreDb, name), normalized);
    return { data: withId<T>(ref.id, normalized), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function updateOne<T>(name: string, id: string, updates: any): Promise<Result<T>> {
  try {
    await updateDoc(doc(firestoreDb, name, id), updates);
    const latest = await getDoc(doc(firestoreDb, name, id));
    return { data: withId<T>(id, latest.data()), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function removeOne(name: string, id: string): Promise<{ data: any; error: any }> {
  try {
    await deleteDoc(doc(firestoreDb, name, id));
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getUserProfileByFirebase(firebaseUid: string, email?: string | null): Promise<Result<any>> {
  const byUid = await listDocsByField<any>('users', 'firebase_uid', firebaseUid);
  if (byUid.data && byUid.data.length > 0) {
    return { data: byUid.data[0], error: null };
  }
  if (email) {
    const byEmail = await listDocsByField<any>('users', 'email', email);
    if (byEmail.data && byEmail.data.length > 0) {
      const matched = byEmail.data[0];
      if (!matched.firebase_uid) {
        await updateOne<any>('users', matched.id, { firebase_uid: firebaseUid, auth_provider: 'firebase' });
      }
      return { data: { ...matched, firebase_uid: firebaseUid, auth_provider: 'firebase' }, error: null };
    }
  }
  return { data: null, error: null };
}

export async function getUserProfile(userId: string) {
  try {
    const snap = await getDoc(doc(firestoreDb, 'users', userId));
    return { data: snap.exists() ? withId<any>(snap.id, snap.data()) : null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getAllUsers() {
  return listDocs<any>('users', [orderBy('created_at', 'desc')]);
}

export async function logActivity(activityData: Record<string, any>) {
  return addOne<any>('activity_logs', buildActivityLogPayload(activityData));
}

export async function getAllActivityLogs() {
  return listDocs<any>('activity_logs', [orderBy('created_at', 'desc')]);
}

export async function createUserProfile(userData: Record<string, any>, firebaseUid?: string | null) {
  return addOne<any>('users', buildUserProfilePayload(userData, firebaseUid));
}

export async function updateUserProfile(userId: string, updates: any) {
  return updateOne<any>('users', userId, updates);
}

export async function deleteUserProfile(userId: string) {
  return removeOne('users', userId);
}

export async function getAllVehicles() {
  return listDocs<any>('vehicles', [orderBy('created_at', 'desc'), limit(100)]);
}
export async function getAllVehiclesFull() {
  return listDocs<any>('vehicles', [orderBy('created_at', 'desc')]);
}
export async function getVehicleById(vehicleId: string) {
  try {
    const snap = await getDoc(doc(firestoreDb, 'vehicles', vehicleId));
    return { data: snap.exists() ? withId<any>(snap.id, snap.data()) : null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
export async function createVehicle(vehicleData: any) {
  return addOne<any>('vehicles', vehicleData);
}
export async function updateVehicle(vehicleId: string, updates: any) {
  return updateOne<any>('vehicles', vehicleId, updates);
}
export async function deleteVehicle(vehicleId: string) {
  return removeOne('vehicles', vehicleId);
}

export async function testConnection() {
  try {
    await getDocs(query(collection(firestoreDb, 'drivers'), limit(1)));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
export async function getAllDrivers() {
  return listDocs<any>('drivers', [orderBy('created_at', 'desc')]);
}
export async function createDriver(driverData: any) {
  return addOne<any>('drivers', driverData);
}
export async function updateDriver(driverId: string, updates: any) {
  return updateOne<any>('drivers', driverId, updates);
}
export async function deleteDriver(driverId: string) {
  return removeOne('drivers', driverId);
}

export async function getAllInsurance() {
  return listDocs<any>('insurance', [orderBy('expiry_date', 'asc')]);
}
export async function createInsurancePolicy(policyData: any) {
  return addOne<any>('insurance', policyData);
}
export async function updateInsurancePolicy(policyId: string, updates: any) {
  return updateOne<any>('insurance', policyId, updates);
}
export async function deleteInsurancePolicy(policyId: string) {
  return removeOne('insurance', policyId);
}

export async function getAllMaintenanceRecords() {
  return listDocs<any>('maintenance_logs', [orderBy('service_date', 'desc')]);
}
export async function createMaintenanceRecord(recordData: any) {
  return addOne<any>('maintenance_logs', recordData);
}
export async function updateMaintenanceRecord(recordId: string, updates: any) {
  return updateOne<any>('maintenance_logs', recordId, updates);
}
export async function deleteMaintenanceRecord(recordId: string) {
  return removeOne('maintenance_logs', recordId);
}

export async function getAllFuelLogs() {
  return listDocs<any>('fuel_logs', [orderBy('refuel_date', 'desc')]);
}

export async function getFuelLogsByVehicle(vehicleId: string) {
  // Query without orderBy to avoid composite index requirement
  // Sorting is done in-memory after fetching
  const result = await listDocs<any>('fuel_logs', [where('vehicle_id', '==', vehicleId)]);
  if (result.data) {
    result.data.sort((a: any, b: any) => {
      const dateA = new Date(a.refuel_date || 0).getTime();
      const dateB = new Date(b.refuel_date || 0).getTime();
      return dateB - dateA; // Descending order
    });
  }
  return result;
}
export async function createFuelLog(fuelLogData: any) {
  return addOne<any>('fuel_logs', fuelLogData);
}
export async function updateFuelLog(fuelLogId: string, updates: any) {
  return updateOne<any>('fuel_logs', fuelLogId, updates);
}
export async function deleteFuelLog(fuelLogId: string) {
  return removeOne('fuel_logs', fuelLogId);
}

export async function getNotificationsForUser(userId: string, unreadOnly = false) {
  // Single-field equality only — avoids composite index (user_id + created_at).
  // Sort by created_at in the client instead of orderBy in Firestore.
  const result = await listDocs<any>('notifications', [where('user_id', '==', userId)]);
  if (result.error || !result.data) return result;
  const sorted = [...result.data].sort((a, b) => {
    const ta = new Date(a.created_at ?? 0).getTime();
    const tb = new Date(b.created_at ?? 0).getTime();
    return tb - ta;
  });
  return { data: unreadOnly ? sorted.filter((n) => !n.is_read) : sorted, error: null };
}
export async function createNotification(notificationData: any) {
  return addOne<any>('notifications', notificationData);
}

export async function syncDriverExpiryNotifications(userId: string, drivers: any[]) {
  if (!userId) return { data: [], error: null };

  try {
    const existing = await listDocs<any>('notifications', [where('user_id', '==', userId)]);
    const existingSignatures = new Set(
      (existing.data || [])
        .map((item: any) => `${item.related_entity || 'global'}::${item.related_id || 'none'}::${item.message}`)
    );
    const generated = dedupeNotificationsBySignature(buildDriverExpiryNotifications(userId, drivers)).filter((item) => {
      const signature = `${item.related_entity || 'global'}::${item.related_id || 'none'}::${item.message}`;
      return !existingSignatures.has(signature);
    });

    const created = [] as any[];
    for (const notification of generated) {
      const result = await addOne<any>('notifications', notification);
      if (!result.error) created.push(result.data);
    }

    return { data: created, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

export async function syncDriverRetirementNotifications(userId: string, drivers: any[]) {
  if (!userId) return { data: [], error: null };

  try {
    const existing = await listDocs<any>('notifications', [where('user_id', '==', userId)]);
    const existingSignatures = new Set(
      (existing.data || [])
        .map((item: any) => `${item.related_entity || 'global'}::${item.related_id || 'none'}::${item.message}`)
    );
    const generated = dedupeNotificationsBySignature(buildDriverRetirementNotifications(userId, drivers)).filter((item) => {
      const signature = `${item.related_entity || 'global'}::${item.related_id || 'none'}::${item.message}`;
      return !existingSignatures.has(signature);
    });

    const created = [] as any[];
    for (const notification of generated) {
      const result = await addOne<any>('notifications', notification);
      if (!result.error) created.push(result.data);
    }

    return { data: created, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

export async function syncVehicleStatusNotifications(userId: string, vehicles: any[]) {
  if (!userId) return { data: [], error: null };

  try {
    const existing = await listDocs<any>('notifications', [where('user_id', '==', userId)]);
    const existingSignatures = new Set(
      (existing.data || [])
        .map((item: any) => `${item.related_entity || 'global'}::${item.related_id || 'none'}::${item.message}`)
    );
    const generated = dedupeNotificationsBySignature(buildVehicleStatusNotifications(userId, vehicles)).filter((item) => {
      const signature = `${item.related_entity || 'global'}::${item.related_id || 'none'}::${item.message}`;
      return !existingSignatures.has(signature);
    });

    const created = [] as any[];
    for (const notification of generated) {
      const result = await addOne<any>('notifications', notification);
      if (!result.error) created.push(result.data);
    }

    return { data: created, error: null };
  } catch (error) {
    return { data: [], error };
  }
}

export async function markDriverRetired(driverId: string) {
  try {
    await updateDoc(doc(firestoreDb, 'drivers', driverId), { status: 'retired' });
    const latest = await getDoc(doc(firestoreDb, 'drivers', driverId));
    return { data: withId<any>(latest.id, latest.data()), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  return updateOne<any>('notifications', notificationId, { is_read: true });
}
export async function deleteNotification(notificationId: string) {
  return removeOne('notifications', notificationId);
}

export async function getAllDisposals() {
  return listDocs<any>('vehicle_disposal', [orderBy('disposal_date', 'desc')]);
}
export async function createDisposal(disposalData: any) {
  return addOne<any>('vehicle_disposal', disposalData);
}
export async function updateDisposal(disposalId: string, updates: any) {
  return updateOne<any>('vehicle_disposal', disposalId, updates);
}
export async function deleteDisposal(disposalId: string) {
  return removeOne('vehicle_disposal', disposalId);
}
