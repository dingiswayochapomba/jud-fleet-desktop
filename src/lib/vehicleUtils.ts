export interface VehicleFormData {
  registration_number?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel_type?: string;
}

export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'broken' | 'disposed';

const statusStyleMap: Record<VehicleStatus, { bg: string; text: string; border: string; badge: string; chart: string }> = {
  available: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', chart: '#10b981' },
  in_use: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', chart: '#3b82f6' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', chart: '#f59e0b' },
  broken: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800', chart: '#ef4444' },
  disposed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800', chart: '#6b7280' },
};

const fallbackStatusStyle = statusStyleMap.available;

export function normalizeVehicleStatus(status?: string | null): VehicleStatus {
  const normalized = (status || 'available').toString().trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'in-use' || normalized === 'in_use') return 'in_use';
  if (normalized === 'maintenance' || normalized === 'under_maintenance') return 'maintenance';
  if (normalized === 'broken' || normalized === 'out_of_service') return 'broken';
  if (normalized === 'disposed' || normalized === 'retired') return 'disposed';
  if (normalized === 'available') return 'available';
  return 'available';
}

export function getVehicleStatusStyle(status?: string | null) {
  return statusStyleMap[normalizeVehicleStatus(status)] || fallbackStatusStyle;
}

export function getVehicleMileageValue(value?: number | string | null): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatVehicleMileage(value?: number | string | null): string {
  return `${getVehicleMileageValue(value).toLocaleString()} km`;
}

export function validateVehicleForm(data: VehicleFormData) {
  const errors: string[] = [];
  if (!data.registration_number || !data.registration_number.toString().trim()) {
    errors.push('Registration number is required');
  }
  if (!data.make || !data.make.toString().trim()) {
    errors.push('Make is required');
  }
  if (!data.model || !data.model.toString().trim()) {
    errors.push('Model is required');
  }
  // optional: year must be a reasonable number
  if (data.year && (typeof data.year !== 'number' || data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
    errors.push('Year is invalid');
  }

  return { valid: errors.length === 0, errors };
}

export default { validateVehicleForm, normalizeVehicleStatus, getVehicleStatusStyle, getVehicleMileageValue, formatVehicleMileage };
