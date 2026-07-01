import { Router } from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/create", createOrder);
orderRouter.get("/", getOrders);

export default orderRouter;