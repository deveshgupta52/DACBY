import { Router } from "express";
import { runSchedulerJob } from "../controllers/scheduler.controller.js";
import { verifySecretKey } from "../middleware/verifySecretKey.js";

const schedulerRouter = Router();

schedulerRouter.post("/run", verifySecretKey, runSchedulerJob);

export default schedulerRouter;