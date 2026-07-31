import { describe, it, expect } from 'vitest';
import { validateVehicleForm } from '../vehicleUtils';

describe('validateVehicleForm', () => {
  it('fails when registration_number missing', () => {
    const { valid, errors } = validateVehicleForm({ make: 'Toyota', model: 'Corolla' });
    expect(valid).toBe(false);
    expect(errors).toContain('Registration number is required');
  });

  it('fails when make missing', () => {
    const { valid, errors } = validateVehicleForm({ registration_number: 'ABC-123', model: 'Corolla' });
    expect(valid).toBe(false);
    expect(errors).toContain('Make is required');
  });

  it('fails when model missing', () => {
    const { valid, errors } = validateVehicleForm({ registration_number: 'ABC-123', make: 'Toyota' });
    expect(valid).toBe(false);
    expect(errors).toContain('Model is required');
  });

  it('passes with valid data', () => {
    const { valid, errors } = validateVehicleForm({ registration_number: 'ABC-123', make: 'Toyota', model: 'Corolla', year: 2020 });
    expect(valid).toBe(true);
    expect(errors.length).toBe(0);
  });

  it('rejects invalid year', () => {
    const { valid, errors } = validateVehicleForm({ registration_number: 'ABC-123', make: 'Ford', model: 'F-150', year: 1800 as any });
    expect(valid).toBe(false);
    expect(errors).toContain('Year is invalid');
  });
});
