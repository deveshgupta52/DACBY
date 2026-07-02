import cron from 'node-cron';
import { runScheduler } from '../services/scheduler.service.js';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log(`[Cron Job] Starting scheduler execution at ${new Date().toISOString()}...`);
  try {
    const log = await runScheduler();
    console.log(`[Cron Job] Scheduler execution completed. Log ID: ${log._id}, Status: ${log.status}, Processed: ${log.ordersProcessed} orders.`);
  } catch (error) {
    console.error('[Cron Job] Scheduler execution failed:', error.message);
  }
});

console.log('[Cron Job] Node-cron initialized to run every 5 minutes.');
