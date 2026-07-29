import { describe, expect, it } from 'vitest';
import { buildFleetReportData } from '../reportData';

describe('buildFleetReportData', () => {
  it('aggregates vehicle, driver, maintenance, fuel and insurance data for reports', () => {
    const data = buildFleetReportData({
      vehicles: [
        { id: 'v1', registration_number: 'JJ-16-AB', status: 'available', mileage: 45200 },
        { id: 'v2', registration_number: 'JJ-16-AC', status: 'in_use', mileage: 62600 },
      ],
      drivers: [
        { id: 'd1', name: 'John Banda', status: 'active' },
      ],
      maintenanceRecords: [
        { id: 'm1', vehicle_id: 'v1', cost: 15000, service_date: '2026-01-05', status: 'completed' },
      ],
      fuelLogs: [
        { id: 'f1', vehicle_id: 'v1', cost: 25000, refuel_date: '2026-01-10' },
        { id: 'f2', vehicle_id: 'v2', cost: 18000, refuel_date: '2026-01-15' },
      ],
      insurancePolicies: [
        { id: 'i1', vehicle_id: 'v1', premium_amount: 35000, expiry_date: '2026-01-01' },
      ],
    });

    expect(data.vehicleStats).toHaveLength(2);
    expect(data.vehicleStats[0]).toMatchObject({
      registration: 'JJ-16-AB',
      totalMaintenance: 15000,
      totalFuel: 25000,
      totalCost: 75000,
      status: 'available',
    });
    expect(data.driverStats).toHaveLength(1);
    expect(data.monthlyData).toEqual(expect.arrayContaining([
      expect.objectContaining({ month: 'Jan', maintenance: 15000, fuel: 43000, insurance: 35000, total: 93000 }),
    ]));
    expect(data.costBreakdownData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Maintenance', value: 15000 }),
        expect.objectContaining({ name: 'Fuel', value: 43000 }),
        expect.objectContaining({ name: 'Insurance', value: 35000 }),
      ])
    );
  });
});
