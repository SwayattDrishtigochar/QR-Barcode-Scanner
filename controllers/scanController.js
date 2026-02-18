import ScanBatchModel from "../models/ScanBatchModel.js";

// Create new scan batch
export const createScanBatch = async (req, res) => {
  try {
    const { qrCodes, binSize } = req.body;

    // Validation
    if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "QR codes array is required and cannot be empty",
      });
    }

    if (!binSize || binSize.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bin size is required",
      });
    }

    // Filter empty strings
    const cleanedQRCodes = qrCodes.filter((qr) => qr && qr.trim() !== "");

    // Check for duplicate QR codes in the submitted array
    const uniqueQRCodes = [...new Set(cleanedQRCodes)];
    if (uniqueQRCodes.length !== cleanedQRCodes.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate QR codes found in submission",
      });
    }

    // Check if any QR code already exists in the database (across all binSizes)
    const existingBatches = await ScanBatchModel.find({
      qrCodes: { $in: uniqueQRCodes },
    });

    if (existingBatches.length > 0) {
      const existingQRCodes = [];
      existingBatches.forEach((batch) => {
        batch.qrCodes.forEach((qr) => {
          if (uniqueQRCodes.includes(qr)) {
            existingQRCodes.push(qr);
          }
        });
      });

      return res.status(400).json({
        success: false,
        message: `QR codes already exist in database: ${[...new Set(existingQRCodes)].join(", ")}`,
      });
    }

    // Find or create document for this binSize
    let scanBatch = await ScanBatchModel.findOne({ binSize: binSize });

    if (scanBatch) {
      // Add new QR codes to existing batch
      scanBatch.qrCodes.push(...uniqueQRCodes);
      scanBatch.scannedAt = Date.now();
      await scanBatch.save();
    } else {
      // Create new batch for this binSize
      scanBatch = new ScanBatchModel({
        qrCodes: uniqueQRCodes,
        binSize: binSize,
      });
      await scanBatch.save();
    }

    res.status(201).json({
      success: true,
      message: "QR codes added successfully",
      data: scanBatch,
    });
  } catch (error) {
    console.error("Create scan batch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all scan batches
export const getScanBatches = async (req, res) => {
  try {
    const batches = await ScanBatchModel.find().sort({ scannedAt: -1 });

    res.json({
      success: true,
      data: batches,
      count: batches.length,
    });
  } catch (error) {
    console.error("Get scan batches error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get scan statistics
export const getScanStats = async (req, res) => {
  try {
    const batches = await ScanBatchModel.find();

    const stats = batches.map((batch) => ({
      binSize: batch.binSize,
      count: batch.qrCodes.length,
      lastScannedAt: batch.scannedAt,
    }));

    const totalQRCodes = stats.reduce((sum, stat) => sum + stat.count, 0);

    res.json({
      success: true,
      data: {
        stats: stats,
        totalQRCodes: totalQRCodes,
        totalBinSizes: stats.length,
      },
    });
  } catch (error) {
    console.error("Get scan stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get distinct bin sizes
export const getDistinctBinSizes = async (req, res) => {
  try {
    // Get all distinct bin sizes
    const binSizes = await ScanBatchModel.distinct("binSize");

    res.json({
      success: true,
      data: {
        binSizes: binSizes,
      },
    });
  } catch (error) {
    console.error("Get distinct bin sizes error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
