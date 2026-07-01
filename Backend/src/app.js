import express from "express"
import orderRouter from "./routes/order.routes.js";
import schedulerRouter from "./routes/scheduler.routes.js";

const app=express()


app.use(express.json());
app.use("/api/order",orderRouter)
app.use("/api/scheduler",schedulerRouter)



export default app