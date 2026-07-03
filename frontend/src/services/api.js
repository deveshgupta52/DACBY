import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

export const createOrder = async (orderData) => {
    const response = await api.post("/order/create", orderData);
    return response.data;
};

export const getOrders = async (status) => {
    const response = await api.get("/order", { params: status ? { status } : {} });
    return response.data;
};

export const runScheduler = async () => {
    const response = await api.post("/scheduler/run", {}, {
        headers: {
            "x-scheduler-key": "abc"
        }
    });
    return response.data;
};

export default api;