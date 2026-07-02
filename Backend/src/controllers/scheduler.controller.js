import { runScheduler } from '../services/scheduler.service.js';

export const runSchedulerJob = async (req, res) => {
  try {
    const log = await runScheduler();
    return res.status(200).json({
      success: true,
      message: 'Scheduler job run completed.',
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Scheduler job run failed.',
      error: error.message,
    });
  }
};
