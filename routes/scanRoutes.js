import { Router } from "express";
import {
  createScanBatch,
  getScanBatches,
  getScanStats,
  getDistinctBinSizes,
  getRecentScanBatches,
  deleteScanBatch,
  updateScanBinSize,
} from "../controllers/scanController.js";

const router = Router();

// POST /api/scans - Create new scan batch
router.post("/", createScanBatch);

// GET /api/scans - Get all scan batches
router.get("/", getScanBatches);

// GET /api/scans/stats - Get scan statistics
router.get("/stats", getScanStats);

// GET /api/scans/bin-sizes - Get distinct bin sizes
router.get("/bin-sizes", getDistinctBinSizes);

// GET /api/scans/recent - Get all scan batches (newest first)
router.get("/recent", getRecentScanBatches);

// DELETE /api/scans/:id - Delete a scan batch by id
router.delete("/:id", deleteScanBatch);

// PUT /api/scans/:id - Update bin size for one scanned RFID
router.put("/:id", updateScanBinSize);

export default router;
