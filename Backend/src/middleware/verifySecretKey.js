export const verifySecretKey = (req, res, next) => {
  const secretKey = req.headers['x-scheduler-key'];
  const expectedKey = process.env.SCHEDULER_SECRET_KEY || 'super-secret-key';

  if (!secretKey || secretKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing scheduler secret key.',
    });
  }

  next();
};
