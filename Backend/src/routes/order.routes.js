import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/create", createOrder);

export default orderRouter;