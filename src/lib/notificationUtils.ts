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
