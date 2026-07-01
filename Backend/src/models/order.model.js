import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['PLACED', 'PROCESSING', 'READY_TO_SHIP'],
      default: 'PLACED',
      index: true, 
    },
    lastStatusUpdatedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true, 
    },
  },
  {
    timestamps: true, 
  }
);

orderSchema.index({ createdAt: 1 });


const Order = mongoose.model('Order', orderSchema);

export default Order;
