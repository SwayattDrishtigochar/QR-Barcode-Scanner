import ScanBatchModel from "../models/ScanBatchModel.js";

// Create new scan batch
export const createScanBatch = async (req, res) => {
  try {
    const { qrCodes, binSize, customBinValue } = req.body;

    // Validation
    if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'QR codes array is required and cannot be empty'
      });
    }

    if (!binSize || !['small', 'medium', 'large', 'custom'].includes(binSize)) {
      return res.status(400).json({
        success: false,
        message: 'Valid bin size is required (small, medium, large, custom)'
      });
    }

    if (binSize === 'custom' && (!customBinValue || customBinValue.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Custom bin value is required when bin size is custom'
      });
    }

    // Create scan batch
    const scanBatch = new ScanBatchModel({
      qrCodes: qrCodes.filter(qr => qr && qr.trim() !== ''), // Remove empty strings
      binSize,
      customBinValue: binSize === 'custom' ? customBinValue.trim() : null
    });

    const savedBatch = await scanBatch.save();

    res.status(201).json({
      success: true,
      message: 'Scan batch created successfully',
      data: savedBatch
    });

  } catch (error) {
    console.error('Create scan batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      count: batches.length
    });

  } catch (error) {
    console.error('Get scan batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
