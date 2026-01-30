import { Router } from 'express';
import { createScanBatch, getScanBatches, getScanStats } from '../controllers/scanController.js';

const router = Router();

// POST /api/scans - Create new scan batch
router.post('/', createScanBatch);

// GET /api/scans - Get all scan batches
router.get('/', getScanBatches);

// GET /api/scans/stats - Get scan statistics
router.get('/stats', getScanStats);

export default router;