import { Router } from 'express';

const router = Router();

// GET /api/drivers
router.get('/', async (req, res) => {
  res.json({ message: 'Get all drivers endpoint' });
});

// POST /api/drivers
router.post('/', async (req, res) => {
  res.json({ message: 'Create driver endpoint' });
});

// GET /api/drivers/:id
router.get('/:id', async (req, res) => {
  res.json({ message: `Get driver ${req.params.id} endpoint` });
});

// PATCH /api/drivers/:id
router.patch('/:id', async (req, res) => {
  res.json({ message: `Update driver ${req.params.id} endpoint` });
});

// GET /api/drivers/:id/retirement-warning
router.get('/:id/retirement-warning', async (req, res) => {
  res.json({ message: `Get retirement warning for driver ${req.params.id}` });
});

export const driverRoutes = router;
