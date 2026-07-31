import { describe, expect, it } from 'vitest';
import { buildDriverExpiryNotifications, buildVehicleStatusNotifications, resolveNotificationTarget } from '../notificationUtils';

describe('resolveNotificationTarget', () => {
  it('returns the drivers tab and detail id for driver-linked notifications', () => {
    const target = resolveNotificationTarget({ related_entity: 'drivers', related_id: 'driver-123' });

    expect(target).toEqual({ tab: 'drivers', detailId: 'driver-123' });
  });

  it('returns the vehicles tab and detail id for vehicle-linked notifications', () => {
    const target = resolveNotificationTarget({ related_entity: 'vehicles', related_id: 'vehicle-123' });

    expect(target).toEqual({ tab: 'vehicles', detailId: 'vehicle-123' });
  });

  it('returns the maintenance tab and detail id for maintenance-linked notifications', () => {
    const target = resolveNotificationTarget({ related_entity: 'maintenance', related_id: 'maintenance-123' });

    expect(target).toEqual({ tab: 'maintenance', detailId: 'maintenance-123' });
  });
});

describe('buildDriverExpiryNotifications', () => {
  it('creates warning notifications for drivers with expiring licenses', () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 10);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 3);

    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 90);

    const notifications = buildDriverExpiryNotifications('user-1', [
      { id: '1', name: 'Alice', license_expiry: soonDate.toISOString() },
      { id: '2', name: 'Bob', license_expiry: expiredDate.toISOString() },
      { id: '3', name: 'Carol', license_expiry: validDate.toISOString() },
    ]);

    expect(notifications.length).toBeGreaterThanOrEqual(2);
    expect(notifications.some((n) => n.message.includes('Alice'))).toBe(true);
    expect(notifications.some((n) => n.message.includes('Bob'))).toBe(true);
    expect(notifications.some((n) => n.type === 'alert' || n.type === 'warning')).toBe(true);
  });
});

describe('buildVehicleStatusNotifications', () => {
  it('creates a mileage notification for vehicles that reached the maintenance threshold', () => {
    const notifications = buildVehicleStatusNotifications('user-1', [
      { id: 'vehicle-1', registration_number: 'JJ-01-ABC', status: 'available', mileage: 5000 },
    ]);

    expect(notifications.some((n) => n.message.includes('reached 5,000 km'))).toBe(true);
    expect(notifications.some((n) => n.related_id === 'vehicle-1')).toBe(true);
  });
});
