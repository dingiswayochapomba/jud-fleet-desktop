import { describe, expect, it } from 'vitest';
import { calculateFuelStats, buildVehicleBreakdown, buildFuelTrendData } from './fuelStats';
import { filterFuelLogs } from './fuelSearch';

describe('fuel helper utilities', () => {
  it('summarizes fleet stats from fuel logs', () => {
    const stats = calculateFuelStats([
      { id: '1', vehicle_id: 'v1', driver_id: 'd1', litres: 40, cost: 2500, station_name: 'Fuel Station', odometer: 1000, receipt_url: null, refuel_date: '2026-07-01', created_at: '2026-07-01T00:00:00Z' },
      { id: '2', vehicle_id: 'v1', driver_id: 'd1', litres: 45, cost: 2800, station_name: 'Fuel Station', odometer: 1200, receipt_url: null, refuel_date: '2026-07-10', created_at: '2026-07-10T00:00:00Z' },
    ]);

    expect(stats.totalLitres).toBe(85);
    expect(stats.totalCost).toBe(5300);
    expect(stats.totalKm).toBe(200);
  });

  it('builds vehicle breakdowns and trend data', () => {
    const breakdown = buildVehicleBreakdown([
      { id: '1', vehicle_id: 'v1', driver_id: 'd1', litres: 40, cost: 2500, station_name: 'Fuel Station', odometer: 1000, receipt_url: null, refuel_date: '2026-07-01', created_at: '2026-07-01T00:00:00Z' },
      { id: '2', vehicle_id: 'v2', driver_id: 'd2', litres: 20, cost: 1200, station_name: 'Fuel Station', odometer: 500, receipt_url: null, refuel_date: '2026-07-02', created_at: '2026-07-02T00:00:00Z' },
    ], [
      { id: 'v1', registration_number: 'ABC123', make: 'Toyota', model: 'Hilux', mileage: 1000 },
      { id: 'v2', registration_number: 'XYZ789', make: 'Nissan', model: 'Navara', mileage: 500 },
    ]);

    expect(breakdown).toHaveLength(2);
    expect(buildFuelTrendData([
      { id: '1', vehicle_id: 'v1', driver_id: 'd1', litres: 40, cost: 2500, station_name: 'Fuel Station', odometer: 1000, receipt_url: null, refuel_date: '2026-07-01', created_at: '2026-07-01T00:00:00Z' },
      { id: '2', vehicle_id: 'v1', driver_id: 'd1', litres: 20, cost: 1200, station_name: 'Fuel Station', odometer: 1100, receipt_url: null, refuel_date: '2026-07-02', created_at: '2026-07-02T00:00:00Z' },
    ])).toEqual([
      expect.objectContaining({ date: '2026-07-01', litres: 40, cost: 2500 }),
      expect.objectContaining({ date: '2026-07-02', litres: 20, cost: 1200 }),
    ]);
  });

  it('filters logs by vehicle, driver, or station text', () => {
    const filtered = filterFuelLogs([
      { id: '1', vehicle_id: 'v1', driver_id: 'd1', litres: 40, cost: 2500, station_name: 'Shell', odometer: 1000, receipt_url: null, refuel_date: '2026-07-01', created_at: '2026-07-01T00:00:00Z' },
      { id: '2', vehicle_id: 'v2', driver_id: 'd2', litres: 20, cost: 1200, station_name: 'Total', odometer: 500, receipt_url: null, refuel_date: '2026-07-02', created_at: '2026-07-02T00:00:00Z' },
    ], 'shell', [{ id: 'd1', name: 'John', license_number: 'L1' }], [{ id: 'v1', registration_number: 'ABC123', make: 'Toyota', model: 'Hilux', mileage: 1000 }]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});
