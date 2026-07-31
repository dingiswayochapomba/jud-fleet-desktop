export interface DriverExpiryNotificationCandidate {
  id?: string;
  name?: string;
  license_expiry?: string;
}

export interface NotificationPayload {
  user_id: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  is_read: boolean;
  created_at: string;
  related_entity: string;
  related_id?: string;
}

export function dedupeNotificationsBySignature(notifications: NotificationPayload[]): NotificationPayload[] {
  const seen = new Set<string>();

  return notifications.filter((notification) => {
    const signature = `${notification.related_entity || 'global'}::${notification.related_id || 'none'}::${notification.message}`;
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}

function getDaysUntilExpiry(value?: string): number | null {
  if (!value) return null;
  const expiryDate = new Date(value);
  if (Number.isNaN(expiryDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  return Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function resolveNotificationTarget(notification: { related_entity?: string; related_id?: string }) {
  if (notification.related_entity === 'drivers' && notification.related_id) {
    return { tab: 'drivers' as const, detailId: notification.related_id };
  }
  if (notification.related_entity === 'vehicles' && notification.related_id) {
    return { tab: 'vehicles' as const, detailId: notification.related_id };
  }
  if (notification.related_entity === 'maintenance' && notification.related_id) {
    return { tab: 'maintenance' as const, detailId: notification.related_id };
  }
  return null;
}

export function buildDriverExpiryNotifications(userId: string, drivers: DriverExpiryNotificationCandidate[]): NotificationPayload[] {
  return drivers.flatMap((driver) => {
    const daysLeft = getDaysUntilExpiry(driver.license_expiry);
    const name = driver.name || 'Unnamed driver';

    if (daysLeft === null) return [];
    if (daysLeft < 0) {
      return [{
        user_id: userId,
        message: `${name}'s driver license has expired.`,
        type: 'alert',
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity: 'drivers',
        related_id: driver.id,
      }];
    }
    if (daysLeft <= 15) {
      return [{
        user_id: userId,
        message: `${name}'s driver license expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity: 'drivers',
        related_id: driver.id,
      }];
    }
    return [];
  });
}

function getAgeFromDob(dob?: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

export function buildDriverRetirementNotifications(userId: string, drivers: (DriverExpiryNotificationCandidate & { date_of_birth?: string })[], retirementAge = 65): NotificationPayload[] {
  return drivers.flatMap((driver) => {
    const age = getAgeFromDob(driver.date_of_birth);
    const name = driver.name || 'Unnamed driver';
    if (age === null) return [];
    if (age >= retirementAge) {
      return [{
        user_id: userId,
        message: `${name} is ${age} years old and has reached retirement age (${retirementAge}). Consider retiring this driver.`,
        type: 'alert',
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity: 'drivers',
        related_id: driver.id,
      }];
    }
    return [];
  });
}

function getVehicleDaysUntilDate(value?: string): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const HIGH_MILEAGE_THRESHOLD = 5000;

export function buildVehicleStatusNotifications(userId: string, vehicles: { id?: string; registration_number?: string; status?: string; insurance_expiry?: string; mileage?: number | string | null; }[]): NotificationPayload[] {
  return vehicles.flatMap((vehicle) => {
    const name = vehicle.registration_number || 'Unnamed vehicle';
    const status = (vehicle.status || '').toString().toLowerCase();
    const notifications: NotificationPayload[] = [];
    const mileageValue = Number(vehicle.mileage ?? 0);

    if (Number.isFinite(mileageValue) && mileageValue >= HIGH_MILEAGE_THRESHOLD) {
      notifications.push({
        user_id: userId,
        message: `Vehicle ${name} has reached ${mileageValue.toLocaleString()} km and should be reviewed for maintenance planning.`,
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity: 'vehicles',
        related_id: vehicle.id,
      });
    }

    if (status === 'broken') {
      notifications.push({
        user_id: userId,
        message: `Vehicle ${name} is currently broken down and needs immediate attention.`,
        type: 'alert',
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity: 'vehicles',
        related_id: vehicle.id,
      });
    }

    if (status === 'maintenance') {
      notifications.push({
        user_id: userId,
        message: `Vehicle ${name} is due for maintenance.`,
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity: 'vehicles',
        related_id: vehicle.id,
      });
    }

    const insuranceDays = getVehicleDaysUntilDate(vehicle.insurance_expiry);
    if (insuranceDays !== null) {
      if (insuranceDays < 0) {
        notifications.push({
          user_id: userId,
          message: `Vehicle ${name}'s insurance has expired. Please renew coverage immediately.`,
          type: 'alert',
          is_read: false,
          created_at: new Date().toISOString(),
          related_entity: 'vehicles',
          related_id: vehicle.id,
        });
      } else if (insuranceDays <= 15) {
        notifications.push({
          user_id: userId,
          message: `Vehicle ${name}'s insurance expires in ${insuranceDays} day${insuranceDays === 1 ? '' : 's'}.`,
          type: 'warning',
          is_read: false,
          created_at: new Date().toISOString(),
          related_entity: 'vehicles',
          related_id: vehicle.id,
        });
      }
    }

    return notifications;
  });
}
