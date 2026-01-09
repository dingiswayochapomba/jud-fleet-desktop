import { Router } from 'express';

const router = Router();

// GET /api/vehicles
router.get('/', async (req, res) => {
  // TODO: Get all vehicles with status and alerts
  res.json({ message: 'Get vehicles endpoint' });
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  // TODO: Add new vehicle
  res.json({ message: 'Create vehicle endpoint' });
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  // TODO: Get vehicle details
  res.json({ message: `Get vehicle ${req.params.id} endpoint` });
});

// PATCH /api/vehicles/:id
router.patch('/:id', async (req, res) => {
  // TODO: Update vehicle (status, maintenance, insurance)
  res.json({ message: `Update vehicle ${req.params.id} endpoint` });
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  // TODO: Delete vehicle
  res.json({ message: `Delete vehicle ${req.params.id} endpoint` });
});

export const vehicleRoutes = router;
