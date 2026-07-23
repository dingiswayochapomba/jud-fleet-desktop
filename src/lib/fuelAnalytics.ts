export interface FuelAnalyticsLog {
  id: string;
  vehicle_id: string;
  litres: number;
  cost: number;
  refuel_date: string;
  odometer: number;
}

export interface FuelAnalyticsChartPoint {
  date: string;
  litres: number;
  cost: number;
  efficiency: number;
}

export interface FuelAnalyticsMonthlyPoint {
  month: string;
  totalCost: number;
  totalLitres: number;
  refuelings: number;
  [key: string]: string | number;
}

export interface FuelAnalyticsStats {
  avgFuelEfficiency: number;
  avgMonthlyCost: number;
  totalCost: number;
  totalLitres: number;
  anomalies: number;
}

export interface FuelAnalyticsData {
  chartData: FuelAnalyticsChartPoint[];
  monthlyData: FuelAnalyticsMonthlyPoint[];
  stats: FuelAnalyticsStats;
}

export function buildFuelAnalyticsData(logs: FuelAnalyticsLog[]): FuelAnalyticsData {
  if (!logs.length) {
    return {
      chartData: [],
      monthlyData: [],
      stats: {
        avgFuelEfficiency: 0,
        avgMonthlyCost: 0,
        totalCost: 0,
        totalLitres: 0,
        anomalies: 0,
      },
    };
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime());

  const chartData = sortedLogs.map((log, index) => {
    let efficiency = 0;
    if (index > 0) {
      const previous = sortedLogs[index - 1];
      const kmDriven = log.odometer - previous.odometer;
      efficiency = log.litres > 0 ? kmDriven / log.litres : 0;
      if (efficiency < 0 || efficiency > 50) {
        efficiency = 0;
      }
    }

    return {
      date: new Date(log.refuel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      litres: log.litres,
      cost: Math.round(log.cost),
      efficiency: Number(efficiency.toFixed(2)),
    };
  });

  const monthMap: Record<string, FuelAnalyticsMonthlyPoint> = {};
  sortedLogs.forEach((log) => {
    const date = new Date(log.refuel_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = {
        month: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        totalCost: 0,
        totalLitres: 0,
        refuelings: 0,
      };
    }
    monthMap[monthKey].totalCost += log.cost;
    monthMap[monthKey].totalLitres += log.litres;
    monthMap[monthKey].refuelings += 1;
  });

  const monthlyData = Object.values(monthMap)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-12);

  let totalEfficiency = 0;
  let efficiencyCount = 0;
  const efficiencies: number[] = [];
  for (let i = 1; i < sortedLogs.length; i++) {
    const current = sortedLogs[i];
    const previous = sortedLogs[i - 1];
    const kmDriven = current.odometer - previous.odometer;
    const efficiency = current.litres > 0 ? kmDriven / current.litres : 0;
    if (efficiency > 0 && efficiency < 50) {
      totalEfficiency += efficiency;
      efficiencyCount += 1;
      efficiencies.push(efficiency);
    }
  }

  const avgFuelEfficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 0;
  const monthCostTotals = Object.values(monthMap).map((entry) => entry.totalCost);
  const avgMonthlyCost = monthCostTotals.length > 0 ? monthCostTotals.reduce((a, b) => a + b, 0) / monthCostTotals.length : 0;

  let anomalies = 0;
  if (efficiencies.length > 1) {
    const mean = totalEfficiency / efficiencyCount;
    const variance = efficiencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / efficiencies.length;
    const stdDev = Math.sqrt(variance);
    anomalies = efficiencies.filter((e) => Math.abs(e - mean) > 2 * stdDev).length;
  }

  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const totalLitres = logs.reduce((sum, log) => sum + log.litres, 0);

  return {
    chartData,
    monthlyData,
    stats: {
      avgFuelEfficiency: Number(avgFuelEfficiency.toFixed(2)),
      avgMonthlyCost: Math.round(avgMonthlyCost),
      totalCost: Math.round(totalCost),
      totalLitres: Number(totalLitres.toFixed(2)),
      anomalies,
    },
  };
}
