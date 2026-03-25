import BinScannerModel from "../models/BinScannerModel.js";

// Create new RFID scan batch
export const createBinScannerBatch = async (req, res) => {
    try {
        const inputRfids =
            (Array.isArray(req.body?.rfids) && req.body.rfids) ||
            (Array.isArray(req.body?.qrCodes) && req.body.qrCodes) ||
            [];
        const { binSize } = req.body;

        if (!inputRfids.length) {
            return res.status(400).json({
                success: false,
                message: "RFID array is required and cannot be empty",
            });
        }

        if (!binSize || !binSize.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bin size is required",
            });
        }

        const normalizedBinSize = binSize.trim();
        const cleanedRfids = inputRfids
            .map((rfid) => (typeof rfid === "string" ? rfid.trim() : ""))
            .filter(Boolean);

        if (cleanedRfids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "RFID array is required and cannot be empty",
            });
        }

        const uniqueRfids = [...new Set(cleanedRfids)];
        if (uniqueRfids.length !== cleanedRfids.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate RFIDs found in submission",
            });
        }

        const existingEntries = await BinScannerModel.find({
            rfid: { $in: uniqueRfids },
        });

        if (existingEntries.length > 0) {
            return res.status(400).json({
                success: false,
                message: `RFIDs already exist in database: ${existingEntries
                    .map((entry) => entry.rfid)
                    .join(", ")}`,
            });
        }

        const docsToInsert = uniqueRfids.map((rfid) => ({
            rfid,
            binSize: normalizedBinSize,
            scannedAt: Date.now(),
        }));

        const createdEntries = await BinScannerModel.insertMany(docsToInsert);

        return res.status(201).json({
            success: true,
            message: "RFIDs added successfully",
            data: createdEntries,
        });
    } catch (error) {
        console.error("Create bin scanner batch error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all RFID scan batches
export const getBinScannerBatches = async (req, res) => {
    try {
        const batches = await BinScannerModel.find().sort({ scannedAt: -1 });

        return res.json({
            success: true,
            data: batches,
            count: batches.length,
        });
    } catch (error) {
        console.error("Get bin scanner batches error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get RFID scan statistics
export const getBinScannerStats = async (req, res) => {
    try {
        const grouped = await BinScannerModel.aggregate([
            {
                $group: {
                    _id: "$binSize",
                    count: { $sum: 1 },
                    lastScannedAt: { $max: "$scannedAt" },
                },
            },
            { $sort: { lastScannedAt: -1 } },
        ]);

        const stats = grouped.map((item) => ({
            binSize: item._id,
            count: item.count,
            lastScannedAt: item.lastScannedAt,
        }));

        const totalRfids = stats.reduce((sum, stat) => sum + stat.count, 0);

        return res.json({
            success: true,
            data: {
                stats,
                totalRfids,
                totalQRCodes: totalRfids,
                totalBinSizes: stats.length,
            },
        });
    } catch (error) {
        console.error("Get bin scanner stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get distinct bin sizes
export const getDistinctBinSizes = async (req, res) => {
    try {
        const binSizes = await BinScannerModel.distinct("binSize");

        return res.json({
            success: true,
            data: {
                binSizes,
            },
        });
    } catch (error) {
        console.error("Get distinct bin sizes error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all scanned RFID entries sorted by newest first
export const getRecentBinScannerBatches = async (req, res) => {
    try {
        const recentScans = await BinScannerModel.find()
            .sort({ scannedAt: -1 })
            .select("_id rfid binSize scannedAt");

        const normalized = recentScans.map((entry) => ({
            _id: entry._id,
            rfid: entry.rfid,
            qrCode: entry.rfid,
            binSize: entry.binSize,
            scannedRfid: `${entry.rfid} (${entry.binSize})`,
            scannedAt: entry.scannedAt,
        }));

        return res.json({
            success: true,
            data: normalized,
            count: normalized.length,
        });
    } catch (error) {
        console.error("Get recent bin scanner batches error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Delete a scan batch by id or delete specific RFID from a batch
export const deleteBinScannerBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const inputRfid = (req.body && req.body.rfid) || req.query.rfid;

        const batch = await BinScannerModel.findById(id);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Scan batch not found",
            });
        }

        if (inputRfid && batch.rfid !== inputRfid.trim()) {
            return res.status(404).json({
                success: false,
                message: "RFID not found in selected scan batch",
            });
        }

        await BinScannerModel.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: "RFID deleted successfully",
            data: {
                _id: id,
                deletedRfid: batch.rfid,
                batchDeleted: true,
            },
        });
    } catch (error) {
        console.error("Delete bin scanner batch error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update bin size for a specific scanned RFID entry
export const updateBinScannerBinSize = async (req, res) => {
    try {
        const { id } = req.params;
        const inputRfid = req.body?.rfid || req.body?.qrCode;
        const { binSize } = req.body;

        if (!inputRfid || !inputRfid.trim()) {
            return res.status(400).json({
                success: false,
                message: "RFID is required",
            });
        }

        if (!binSize || !binSize.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bin size is required",
            });
        }

        const normalizedRfid = inputRfid.trim();
        const targetBinSize = binSize.trim();

        const sourceBatch = await BinScannerModel.findById(id);
        if (!sourceBatch) {
            return res.status(404).json({
                success: false,
                message: "Scan batch not found",
            });
        }

        if (sourceBatch.rfid !== normalizedRfid) {
            return res.status(404).json({
                success: false,
                message: "RFID not found in selected scan batch",
            });
        }

        if (sourceBatch.binSize === targetBinSize) {
            return res.json({
                success: true,
                message: "Bin size is unchanged",
            });
        }

        sourceBatch.binSize = targetBinSize;
        sourceBatch.scannedAt = Date.now();
        await sourceBatch.save();

        return res.json({
            success: true,
            message: "Bin size updated successfully",
        });
    } catch (error) {
        console.error("Update bin scanner bin size error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
