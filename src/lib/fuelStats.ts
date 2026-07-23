export interface VehicleFuelBreakdown {
  vehicleId: string;
  registrationNumber: string;
  make: string;
  model: string;
  totalLitres: number;
  totalCost: number;
  averageCostPerLitre: number;
  totalKm: number;
  refuelCount: number;
}

interface FuelLogLike {
  id: string;
  vehicle_id: string;
  driver_id: string | null;
  litres: number;
  cost: number;
  station_name: string;
  odometer: number;
  receipt_url: string | null;
  refuel_date: string;
  created_at: string;
}

interface VehicleLike {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  mileage: number;
}

export function calculateFuelStats(logs: FuelLogLike[]) {
  if (!logs.length) {
    return {
      totalLitres: 0,
      totalCost: 0,
      avgCostPerLitre: 0,
      lastRefuel: null,
      avgKmPerLitre: 0,
      bestKmPerLitre: 0,
      worstKmPerLitre: 0,
      totalKm: 0,
      anomalies: [] as string[],
    };
  }

  const sortedByDate = [...logs].sort((a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime());
  const totalLitres = logs.reduce((sum, log) => sum + log.litres, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

  const efficiencies: number[] = [];
  let totalKm = 0;

  for (let i = 1; i < sortedByDate.length; i += 1) {
    const current = sortedByDate[i];
    const previous = sortedByDate[i - 1];

    if (current.odometer && previous.odometer) {
      const kmDriven = current.odometer - previous.odometer;
      const kml = kmDriven / current.litres;

      if (kml > 0 && kml < 100) {
        efficiencies.push(kml);
      }
    }
  }

  if (sortedByDate.length > 0) {
    const firstLog = sortedByDate[0];
    const lastLog = sortedByDate[sortedByDate.length - 1];
    if (firstLog.odometer && lastLog.odometer) {
      totalKm = Math.max(0, lastLog.odometer - firstLog.odometer);
    }
  }

  const avgKmPerLitre = efficiencies.length > 0 ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length : 0;
  const bestKmPerLitre = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;
  const worstKmPerLitre = efficiencies.length > 0 ? Math.min(...efficiencies) : 0;

  const anomalies: string[] = [];
  if (avgKmPerLitre > 0) {
    logs.forEach((log, idx) => {
      if (idx > 0) {
        const prevLog = logs[idx - 1];
        if (log.odometer && prevLog.odometer) {
          const kml = (log.odometer - prevLog.odometer) / log.litres;
          if (kml > avgKmPerLitre * 1.5) {
            anomalies.push(`Unusually high efficiency on ${new Date(log.refuel_date).toLocaleDateString()}`);
          } else if (kml < avgKmPerLitre * 0.5) {
            anomalies.push(`Unusually low efficiency on ${new Date(log.refuel_date).toLocaleDateString()}`);
          }
        }
      }
    });
  }

  return {
    totalLitres: parseFloat(totalLitres.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    avgCostPerLitre: parseFloat(avgCostPerLitre.toFixed(2)),
    lastRefuel: sortedByDate[sortedByDate.length - 1] || null,
    avgKmPerLitre: parseFloat(avgKmPerLitre.toFixed(2)),
    bestKmPerLitre: parseFloat(bestKmPerLitre.toFixed(2)),
    worstKmPerLitre: parseFloat(worstKmPerLitre.toFixed(2)),
    totalKm,
    anomalies: anomalies.slice(0, 3),
  };
}

export function buildVehicleBreakdown(logs: FuelLogLike[], vehicles: VehicleLike[]): VehicleFuelBreakdown[] {
  return vehicles
    .map((vehicle) => {
      const vehicleLogs = logs.filter((log) => log.vehicle_id === vehicle.id);
      if (!vehicleLogs.length) {
        return null;
      }

      const orderedLogs = [...vehicleLogs].sort((a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime());
      const totalLitres = orderedLogs.reduce((sum, log) => sum + log.litres, 0);
      const totalCost = orderedLogs.reduce((sum, log) => sum + log.cost, 0);
      const averageCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;
      const firstOdometer = orderedLogs[0]?.odometer || vehicle.mileage || 0;
      const lastOdometer = orderedLogs[orderedLogs.length - 1]?.odometer || firstOdometer;
      const totalKm = Math.max(0, lastOdometer - firstOdometer);

      return {
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registration_number,
        make: vehicle.make,
        model: vehicle.model,
        totalLitres: parseFloat(totalLitres.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        averageCostPerLitre: parseFloat(averageCostPerLitre.toFixed(2)),
        totalKm: parseFloat(totalKm.toFixed(2)),
        refuelCount: orderedLogs.length,
      };
    })
    .filter((entry): entry is VehicleFuelBreakdown => Boolean(entry));
}

export function calculateFuelAvailability(logs: FuelLogLike[], currentMileage: number) {
  const totalFuelUsed = logs.reduce((sum, log) => sum + log.litres, 0);
  const currentFuelAvailable = Math.max(0, totalFuelUsed - currentMileage / 100);
  const fuelLeft = Math.max(0, 100 - currentFuelAvailable);
  const consumptionRate = logs.length > 0 ? totalFuelUsed / Math.max(1, logs.length) : 0;

  return {
    currentFuelAvailable: parseFloat(currentFuelAvailable.toFixed(2)),
    fuelLeft: parseFloat(fuelLeft.toFixed(2)),
    consumptionRate: parseFloat(consumptionRate.toFixed(2)),
  };
}

export function buildFuelTrendData(logs: FuelLogLike[]) {
  return [...logs]
    .sort((a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime())
    .map((log) => ({
      date: log.refuel_date,
      label: new Date(log.refuel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      litres: log.litres,
      cost: log.cost,
    }));
}
