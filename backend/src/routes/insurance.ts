import { Router } from 'express';

const router = Router();

// POST /api/insurance
router.post('/', async (req, res) => {
  res.json({ message: 'Add insurance record endpoint' });
});

// GET /api/insurance/:vehicleId
router.get('/:vehicleId', async (req, res) => {
  res.json({ message: `Get insurance for vehicle ${req.params.vehicleId}` });
});

// GET /api/insurance/expiring
router.get('/expiring', async (req, res) => {
  res.json({ message: 'Get expiring insurance alerts' });
});

// PATCH /api/insurance/:id
router.patch('/:id', async (req, res) => {
  res.json({ message: `Update insurance ${req.params.id}` });
});

export const insuranceRoutes = router;
