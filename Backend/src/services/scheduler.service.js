import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import OrderHistory from '../models/orderHistory.model.js';
import SchedulerLog from '../models/schedulerLog.model.js';
import { ORDER_STATUS, CHANGED_BY } from '../config/constants.js';

export const createSchedulerLog = async () => {
  return await SchedulerLog.create({
    startedAt: new Date(),
    status: 'RUNNING',
    message: 'Scheduler execution started.',
  });
};

export const processPlacedOrders = async (tenMinutesAgo) => {
  let count = 0;
  const orders = await Order.find({
    status: ORDER_STATUS.PLACED,
    lastStatusUpdatedAt: { $lte: tenMinutesAgo }
  });

  for (const order of orders) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          status: ORDER_STATUS.PLACED
        },
        {
          status: ORDER_STATUS.PROCESSING,
          lastStatusUpdatedAt: new Date()
        },
        { new: true, session }
      );

      if (updatedOrder) {
        await OrderHistory.create(
          [
            {
              order: order._id,
              fromStatus: ORDER_STATUS.PLACED,
              toStatus: ORDER_STATUS.PROCESSING,
              changedBy: CHANGED_BY.SCHEDULER,
              changedAt: updatedOrder.lastStatusUpdatedAt
            }
          ],
          { session }
        );
        await session.commitTransaction();
        count++;
      } else {
        await session.abortTransaction();
      }
    } catch (err) {
      await session.abortTransaction();
      console.error(`Error processing placed order ${order._id}:`, err);
    } finally {
      session.endSession();
    }
  }
  return count;
};

export const processProcessingOrders = async (twentyMinutesAgo) => {
  let count = 0;
  const orders = await Order.find({
    status: ORDER_STATUS.PROCESSING,
    lastStatusUpdatedAt: { $lte: twentyMinutesAgo }
  });

  for (const order of orders) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          status: ORDER_STATUS.PROCESSING
        },
        {
          status: ORDER_STATUS.READY_TO_SHIP,
          lastStatusUpdatedAt: new Date()
        },
        { new: true, session }
      );

      if (updatedOrder) {
        await OrderHistory.create(
          [
            {
              order: order._id,
              fromStatus: ORDER_STATUS.PROCESSING,
              toStatus: ORDER_STATUS.READY_TO_SHIP,
              changedBy: CHANGED_BY.SCHEDULER,
              changedAt: updatedOrder.lastStatusUpdatedAt
            }
          ],
          { session }
        );
        await session.commitTransaction();
        count++;
      } else {
        await session.abortTransaction();
      }
    } catch (err) {
      await session.abortTransaction();
      console.error(`Error processing processing order ${order._id}:`, err);
    } finally {
      session.endSession();
    }
  }
  return count;
};

export const updateSchedulerLog = async (logId, status, metrics, message = '') => {
  const finishedAt = new Date();
  const log = await SchedulerLog.findById(logId);
  const executionTime = finishedAt.getTime() - log.startedAt.getTime();

  return await SchedulerLog.findByIdAndUpdate(
    logId,
    {
      status,
      finishedAt,
      executionTime,
      placedToProcessing: metrics.placedToProcessing || 0,
      processingToReadyToShip: metrics.processingToReadyToShip || 0,
      ordersProcessed: (metrics.placedToProcessing || 0) + (metrics.processingToReadyToShip || 0),
      message: message || `Processed ${metrics.placedToProcessing + metrics.processingToReadyToShip} orders.`,
    },
    { new: true }
  );
};

export const runScheduler = async () => {
  const log = await createSchedulerLog();
  const startTime = Date.now();
  
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

    const placedToProcessingCount = await processPlacedOrders(tenMinutesAgo);
    const processingToReadyToShipCount = await processProcessingOrders(twentyMinutesAgo);

    const metrics = {
      placedToProcessing: placedToProcessingCount,
      processingToReadyToShip: processingToReadyToShipCount
    };

    const updatedLog = await updateSchedulerLog(
      log._id,
      'SUCCESS',
      metrics,
      `Scheduler completed successfully in ${Date.now() - startTime}ms.`
    );
    return updatedLog;
  } catch (error) {
    console.error('Scheduler failed:', error);
    await updateSchedulerLog(
      log._id,
      'FAILED',
      { placedToProcessing: 0, processingToReadyToShip: 0 },
      `Scheduler failed: ${error.message}`
    );
    throw error;
  }
};
