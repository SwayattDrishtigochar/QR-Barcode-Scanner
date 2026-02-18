import { Schema, model } from "mongoose";

const scanBatchSchema = new Schema(
  {
    qrCodes: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "QR codes array cannot be empty",
      },
    },
    binSize: {
      type: String,
      required: true,
      unique: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
scanBatchSchema.index({ scannedAt: -1 });
scanBatchSchema.index({ binSize: 1 });

export default model("ScanBatch", scanBatchSchema);
