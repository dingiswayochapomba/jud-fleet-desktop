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

interface DriverLike {
  id: string;
  name: string;
  license_number: string;
}

interface VehicleLike {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  mileage: number;
}

export function filterFuelLogs(logs: FuelLogLike[], searchTerm: string, drivers: DriverLike[], vehicles: VehicleLike[]) {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) {
    return logs;
  }

  const driverMap = new Map(drivers.map((driver) => [driver.id, driver.name.toLowerCase()]));
  const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle.registration_number.toLowerCase()]));

  return logs.filter((log) => {
    const text = [
      log.station_name,
      driverMap.get(log.driver_id || '') || '',
      vehicleMap.get(log.vehicle_id) || '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return text.includes(normalized);
  });
}
