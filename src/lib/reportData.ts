export interface ReportVehicleStats {
  id: string;
  registration: string;
  totalMaintenance: number;
  totalFuel: number;
  totalCost: number;
  status: string;
  mileage: number;
}

export interface ReportMonthlyData {
  month: string;
  maintenance: number;
  fuel: number;
  insurance: number;
  total: number;
}

export interface ReportDriverStats {
  id: string;
  name: string;
  vehiclesAssigned: number;
  tripsCompleted: number;
  averageRating: number;
  status: string;
}

export interface FleetReportData {
  vehicleStats: ReportVehicleStats[];
  monthlyData: ReportMonthlyData[];
  driverStats: ReportDriverStats[];
  costBreakdownData: Array<{ name: string; value: number; color: string }>;
  vehicleStatusData: Array<{ name: string; value: number; color: string }>;
}

export function buildFleetReportData(params: {
  vehicles: Array<any>;
  drivers: Array<any>;
  maintenanceRecords: Array<any>;
  fuelLogs: Array<any>;
  insurancePolicies: Array<any>;
}): FleetReportData {
  const vehicleStats = (params.vehicles || []).map((vehicle: any) => {
    const maintenance = (params.maintenanceRecords || []).filter((record: any) => record.vehicle_id === vehicle.id);
    const fuel = (params.fuelLogs || []).filter((log: any) => log.vehicle_id === vehicle.id);
    const insurance = (params.insurancePolicies || []).filter((policy: any) => policy.vehicle_id === vehicle.id);

    const totalMaintenance = maintenance.reduce((sum: number, record: any) => sum + Number(record.cost || 0), 0);
    const totalFuel = fuel.reduce((sum: number, log: any) => sum + Number(log.cost || 0), 0);
    const totalCost = totalMaintenance + totalFuel + insurance.reduce((sum: number, policy: any) => sum + Number(policy.premium_amount || 0), 0);

    return {
      id: vehicle.id,
      registration: vehicle.registration_number || vehicle.registration || 'Unknown Vehicle',
      totalMaintenance,
      totalFuel,
      totalCost,
      status: vehicle.status || 'unknown',
      mileage: Number(vehicle.mileage || 0),
    };
  });

  const driverStats = (params.drivers || []).map((driver: any) => ({
    id: driver.id,
    name: driver.name || 'Unknown Driver',
    vehiclesAssigned: 1,
    tripsCompleted: 0,
    averageRating: 4.5,
    status: driver.status || 'active',
  }));

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maintenanceByMonth = (params.maintenanceRecords || []).reduce((acc: Record<string, number>, record: any) => {
    const month = new Date(record.service_date || record.created_at || '').toLocaleString('en-US', { month: 'short' });
    if (!month) return acc;
    acc[month] = (acc[month] || 0) + Number(record.cost || 0);
    return acc;
  }, {});

  const fuelByMonth = (params.fuelLogs || []).reduce((acc: Record<string, number>, log: any) => {
    const month = new Date(log.refuel_date || log.created_at || '').toLocaleString('en-US', { month: 'short' });
    if (!month) return acc;
    acc[month] = (acc[month] || 0) + Number(log.cost || 0);
    return acc;
  }, {});

  const insuranceByMonth = (params.insurancePolicies || []).reduce((acc: Record<string, number>, policy: any) => {
    const month = new Date(policy.expiry_date || policy.created_at || '').toLocaleString('en-US', { month: 'short' });
    if (!month) return acc;
    acc[month] = (acc[month] || 0) + Number(policy.premium_amount || 0);
    return acc;
  }, {});

  const monthNames = Array.from(new Set([...Object.keys(maintenanceByMonth), ...Object.keys(fuelByMonth), ...Object.keys(insuranceByMonth)]));
  const reportMonths = (monthNames.length > 0 ? monthNames : monthOrder.slice(-3)).sort((left, right) => {
    const leftIndex = monthOrder.indexOf(left);
    const rightIndex = monthOrder.indexOf(right);
    return leftIndex - rightIndex;
  }).map((month) => {
    const maintenance = maintenanceByMonth[month] || 0;
    const fuel = fuelByMonth[month] || 0;
    const insurance = insuranceByMonth[month] || 0;
    return {
      month,
      maintenance,
      fuel,
      insurance,
      total: maintenance + fuel + insurance,
    };
  });

  const totalMaintenance = vehicleStats.reduce((sum, vehicle) => sum + vehicle.totalMaintenance, 0);
  const totalFuel = vehicleStats.reduce((sum, vehicle) => sum + vehicle.totalFuel, 0);
  const totalInsurance = (params.insurancePolicies || []).reduce((sum, policy) => sum + Number(policy.premium_amount || 0), 0);

  return {
    vehicleStats,
    monthlyData: reportMonths,
    driverStats,
    costBreakdownData: [
      { name: 'Maintenance', value: totalMaintenance, color: '#f59e0b' },
      { name: 'Fuel', value: totalFuel, color: '#3b82f6' },
      { name: 'Insurance', value: totalInsurance, color: '#10b981' },
    ],
    vehicleStatusData: [
      { name: 'Active', value: vehicleStats.filter((vehicle) => vehicle.status === 'available' || vehicle.status === 'in_use').length, color: '#10b981' },
      { name: 'Inactive', value: vehicleStats.filter((vehicle) => vehicle.status !== 'available' && vehicle.status !== 'in_use').length, color: '#ef4444' },
    ],
  };
}
