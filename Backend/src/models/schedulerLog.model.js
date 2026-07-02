import mongoose from 'mongoose';

const schedulerLogSchema = new mongoose.Schema(
  {
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    finishedAt: {
      type: Date,
    },
    ordersProcessed: {
      type: Number,
      default: 0,
      required: true,
    },
    placedToProcessing: {
      type: Number,
      default: 0,
      required: true,
    },
    processingToReadyToShip: {
      type: Number,
      default: 0,
      required: true,
    },
    executionTime: {
      type: Number, // in milliseconds
      default: 0,
      required: true,
    },
    status: {
      type: String,
      enum: ['RUNNING', 'SUCCESS', 'FAILED'],
      required: true,
    },
    message: {
      type: String,
      required: false,
      trim: true,
    },
  }
);

schedulerLogSchema.index({ startedAt: -1 });

const SchedulerLog = mongoose.model('SchedulerLog', schedulerLogSchema);

export default SchedulerLog;
