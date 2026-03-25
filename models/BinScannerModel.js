import { Schema, model } from "mongoose";

const scanBatchSchema = new Schema(
    {
        rfid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        binSize: {
            type: String,
            required: true,
            trim: true,
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

export default model("BinScannerBatch", scanBatchSchema);
