import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import OrderHistory from '../models/orderHistory.model.js';
import { ORDER_STATUS, PAYMENT_STATUS, CHANGED_BY } from '../config/constants.js';
import { randomUUID } from "crypto";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {customerName, phoneNumber, productName, amount } = req.body;
    const orderId = `ORD-${randomUUID()}`;
    
    if (!customerName || !phoneNumber || !productName || amount === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: ' customerName, phoneNumber, productName, and amount are required.',
      });
    }

    
    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.',
      });
    }


    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (at least 10 digits).',
      });
    }


    const [newOrder] = await Order.create(
      [
        {
          orderId,
          customerName,
          phoneNumber,
          productName,
          amount,
          paymentStatus: PAYMENT_STATUS.PENDING,
          status: ORDER_STATUS.PLACED,
          lastStatusUpdatedAt: new Date(),
        },
      ],
      { session }
    );

    
    await OrderHistory.create(
      [
        {
          order: newOrder._id,
          fromStatus: null,
          toStatus: ORDER_STATUS.PLACED,
          changedBy: CHANGED_BY.SYSTEM,
          changedAt: newOrder.lastStatusUpdatedAt,
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    // Abort transaction in case of error
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};
