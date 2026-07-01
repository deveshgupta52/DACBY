import mongoose from 'mongoose';
import { ORDER_STATUS, CHANGED_BY } from '../config/constants.js';

const orderHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    fromStatus: {
      type: String,
      enum: [null, ...Object.values(ORDER_STATUS)],
      default: null,
    },
    toStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },
    changedBy: {
      type: String,
      enum: Object.values(CHANGED_BY),
      default: CHANGED_BY.SYSTEM,
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
