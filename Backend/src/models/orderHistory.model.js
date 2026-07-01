import mongoose from 'mongoose';

const orderHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ['PLACED', 'PROCESSING', 'READY_TO_SHIP'],
      required: true,
    },
    toStatus: {
      type: String,
      enum: ['PLACED', 'PROCESSING', 'READY_TO_SHIP'],
      required: true,
    },
    changedBy: {
      type: String,
      enum: ['Scheduler', 'Admin'],
      default: 'Scheduler',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  }
);

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);

export default OrderHistory;
