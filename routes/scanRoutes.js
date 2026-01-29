import { Router } from 'express';
import { createScanBatch, getScanBatches } from '../controllers/scanController.js';

const router = Router();

// POST /api/scans - Create new scan batch
router.post('/', createScanBatch);

// GET /api/scans - Get all scan batches
router.get('/', getScanBatches);

export default router;