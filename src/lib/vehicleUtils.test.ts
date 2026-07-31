import { describe, expect, it } from 'vitest';
import { formatVehicleMileage, getVehicleMileageValue, getVehicleStatusStyle, normalizeVehicleStatus } from './vehicleUtils';

describe('vehicle status helpers', () => {
  it('normalizes unknown vehicle statuses to a safe fallback', () => {
    expect(normalizeVehicleStatus('in-use')).toBe('in_use');
    expect(normalizeVehicleStatus('In Use')).toBe('in_use');
    expect(normalizeVehicleStatus('unknown-status')).toBe('available');
  });

  it('returns a fallback style for unknown statuses', () => {
    const style = getVehicleStatusStyle('unknown-status');
    expect(style.badge).toContain('bg-emerald-100');
    expect(style.text).toContain('emerald');
  });

  it('formats missing mileage safely', () => {
    expect(getVehicleMileageValue(undefined)).toBe(0);
    expect(formatVehicleMileage(null)).toBe('0 km');
    expect(formatVehicleMileage('1250')).toBe('1,250 km');
  });
});
