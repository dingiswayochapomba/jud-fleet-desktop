// Compatibility layer: Firebase exports with Supabase-style interface
// This file bridges old Supabase imports to new Firebase backend

export { 
  // Users
  getUserProfile,
  updateUserProfile,
  getUserProfileByFirebase,
  
  // Vehicles
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  
  // Drivers
  getAllDrivers,
  createDriver,
  updateDriver,
  
  // Fuel
  getFuelLogsByVehicle,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
  
  // Insurance
  getAllInsurance,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  
  // Disposal
  getAllDisposals,
  createDisposal,
  updateDisposal,
  deleteDisposal,
  
  // Notifications
  getNotificationsForUser,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
} from './firebaseQueries';

// Auth functions for Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from './firebase';

export async function loginWithREST(email: string, password: string) {
  try {
    const userCred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return { 
      data: { user: userCred.user }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function signOut() {
  try {
    await firebaseAuth.signOut();
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
