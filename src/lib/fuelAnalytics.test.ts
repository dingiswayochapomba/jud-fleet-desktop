import { describe, it, expect } from 'vitest';
import { buildFuelAnalyticsData } from './fuelAnalytics';

describe('buildFuelAnalyticsData', () => {
  it('builds chart, monthly and summary data from fuel logs', () => {
    const logs = [
      {
        id: '1',
        vehicle_id: 'vehicle-1',
        litres: 20,
        cost: 100,
        refuel_date: '2024-01-10',
        odometer: 1000,
      },
      {
        id: '2',
        vehicle_id: 'vehicle-1',
        litres: 10,
        cost: 150,
        refuel_date: '2024-02-10',
        odometer: 1200,
      },
      {
        id: '3',
        vehicle_id: 'vehicle-1',
        litres: 10,
        cost: 100,
        refuel_date: '2024-03-10',
        odometer: 1300,
      },
    ];

    const result = buildFuelAnalyticsData(logs);

    expect(result.chartData).toHaveLength(3);
    expect(result.chartData[1].efficiency).toBeGreaterThan(0);
    expect(result.monthlyData).toHaveLength(3);
    expect(result.stats.totalCost).toBe(350);
    expect(result.stats.totalLitres).toBe(40);
    expect(result.stats.avgMonthlyCost).toBe(117);
  });
});
