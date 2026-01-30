import { Schema, model } from 'mongoose';

const scanBatchSchema = new Schema({
  qrCodes: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr && arr.length > 0;
      },
      message: 'QR codes array cannot be empty'
    },
    unique: true
  },
  binSize: {
    type: String,
    required: true,
    enum: ['small', 'medium', 'large', 'custom']
  },
  customBinValue: {
    type: String,
    default: null,
    validate: {
      validator: function (value) {
        // If binSize is 'custom', customBinValue is required
        if (this.binSize === 'custom') {
          return value && value.trim().length > 0;
        }
        return true;
      },
      message: 'Custom bin value is required when bin size is custom'
    }
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
scanBatchSchema.index({ scannedAt: -1 });
scanBatchSchema.index({ binSize: 1 });

export default model('ScanBatch', scanBatchSchema);