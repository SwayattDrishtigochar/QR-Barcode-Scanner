import { Router } from "express";
import {
    createBinScannerBatch,
    getBinScannerBatches,
    getBinScannerStats,
    getDistinctBinSizes,
    getRecentBinScannerBatches,
    deleteBinScannerBatch,
    updateBinScannerBinSize,
} from "../controllers/binScannerController.js";

const router = Router();

// POST /api/bin-scans - Create new scan batch
router.post("/", createBinScannerBatch);

// GET /api/bin-scans - Get all scan batches
router.get("/", getBinScannerBatches);

// GET /api/bin-scans/stats - Get scan statistics
router.get("/stats", getBinScannerStats);

// GET /api/bin-scans/bin-sizes - Get distinct bin sizes
router.get("/bin-sizes", getDistinctBinSizes);

// GET /api/bin-scans/recent - Get all scan batches (newest first)
router.get("/recent", getRecentBinScannerBatches);

// DELETE /api/bin-scans/:id - Delete a scan batch by id
router.delete("/:id", deleteBinScannerBatch);

// PUT /api/bin-scans/:id - Update bin size for one scanned RFID
router.put("/:id", updateBinScannerBinSize);

export default router;
