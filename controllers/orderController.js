const OrderModel = require('../models/orderModel');
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const orderController = {
  createOrder: asyncHandler(async (req, res) => {
    const order = req.body;
    const result = await OrderModel.createOrder(order);
    res.status(201).json(new ApiResponse(201, result, "Order created successfully"));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const { orderId, status } = req.body;
    const result = await OrderModel.updateOrderStatus(orderId, status);
    res.status(200).json(new ApiResponse(200, result, "Order status updated successfully"));
  }),

  getUserOrders: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const result = await OrderModel.getOrdersByUser(email);
    res.status(200).json(new ApiResponse(200, result, "User orders fetched successfully"));
  })
};

module.exports = orderController;