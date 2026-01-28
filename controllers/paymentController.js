const PaymentModel = require("../models/paymentModel");
const BidModel = require("../models/bidModel");
const UserModel = require("../models/userModel");
const axios = require("axios");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const paymentController = {
  initiatePayment: asyncHandler(async (req, res) => {
    const { orderId, amount, email, travelerEmail } = req.body;

    if (!orderId || !amount || !email || !travelerEmail) {
      throw new ApiError(400, "Missing required fields");
    }

    const transactionId = `TRADE_${Date.now()}_${orderId}`;
    const backendUrl = process.env.BACKEND_URL || "http://localhost:9000";

    const paymentData = new URLSearchParams({
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: amount.toString(),
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${backendUrl}/success/${orderId}`,
      fail_url: `${backendUrl}/fail/${orderId}`,
      cancel_url: `${backendUrl}/cancel/${orderId}`,
      ipn_url: `${backendUrl}/ipn`,
      cus_name: "TradeTravel Customer",
      cus_email: email,
      cus_phone: "01700000000",
      cus_add1: "TradeTravel Payment",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: "Parcel Delivery Service",
      product_category: "Service",
      product_profile: "general",
      value_a: orderId,
      value_b: travelerEmail,
      value_c: email,
      value_d: amount,
    });

    const response = await axios.post(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      paymentData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.status !== "SUCCESS") {
      throw new ApiError(400, response.data.failedreason || "Payment initiation failed");
    }

    await PaymentModel.createPayment({
      travelerEmail,
      senderEmail: email,
      orderId,
      paymentIntentId: transactionId,
      amount,
      status: "pending",
      paymentMethod: "sslcommerz",
    });

    res.status(200).json(new ApiResponse(200, {
      paymentUrl: response.data.GatewayPageURL,
      transactionId,
    }, "Payment initiated successfully"));
  }),

  handleSuccess: async (req, res) => {
    try {
      const { orderId } = req.params;
      let tran_id, amount;

      if (req.method === "GET") {
        tran_id = req.query.tran_id;
        amount = req.query.amount;
      } else if (req.method === "POST") {
        tran_id = req.body.tran_id;
        amount = req.body.amount;
      }

      if (!tran_id || !amount) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=missing_parameters&order_id=${orderId}`
        );
      }

      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=${tran_id}&store_id=${
        process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21"
      }&store_passwd=${
        process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl"
      }&format=json`;

      const verifyResponse = await axios.get(verifyUrl);
      const paymentData = verifyResponse.data?.element?.[0];

      if (
        !verifyResponse.data ||
        verifyResponse.data.APIConnect !== "DONE" ||
        !paymentData ||
        paymentData.status !== "VALID" ||
        paymentData.tran_id !== tran_id
      ) {
        await PaymentModel.updatePaymentStatus(tran_id, "failed");
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=verification_failed&order_id=${orderId}`
        );
      }

      await PaymentModel.updatePaymentStatus(
        tran_id,
        "completed",
        paymentData.val_id || null
      );

      // Add full amount to admin balance
      const totalAmount = parseFloat(amount);
      await UserModel.updateAdminBalance(totalAmount);

      const bid = await BidModel.getBidById(orderId);
      if (!bid) {
        throw new Error("Bid not found");
      }

      const status =
        bid.request_type === "send" && bid.isImportantParcel === true
          ? "payment_done_check_needed"
          : "paymentDone";

      const bidUpdateResult = await BidModel.updateBidStatus(orderId, status);

      if (!bidUpdateResult.modifiedCount) {
        console.error("Failed to update bid status - no document modified");
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=success&tran_id=${tran_id}&amount=${amount}&order_id=${orderId}`
      );
    } catch (error) {
      console.error("Payment success handling error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=failed&error=${encodeURIComponent(
          error.message
        )}&order_id=${req.params.orderId}`
      );
    }
  },

  handleFailure: async (req, res) => {
    try {
      const { orderId } = req.params;
      const tran_id = req.body.tran_id || req.query.tran_id;
      const error = req.body.error || req.query.error;

      console.log(
        "Payment failure - Order ID:",
        orderId,
        "Transaction ID:",
        tran_id
      );

      if (tran_id) {
        await PaymentModel.updatePaymentStatus(tran_id, "failed");
      }

      const errorMessage = error || "Payment failed due to unknown reason";
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/payment-result?payment=failed&orderId=${orderId}&error=${encodeURIComponent(
          errorMessage
        )}`
      );
    } catch (error) {
      console.error("Payment failure handling error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/payment-result?payment=failed&error=${encodeURIComponent(
          error.message
        )}`
      );
    }
  },

  handleCancel: async (req, res) => {
    try {
      const { orderId } = req.params;
      const tran_id = req.body.tran_id || req.query.tran_id;

      console.log(
        "Payment cancelled - Order ID:",
        orderId,
        "Transaction ID:",
        tran_id
      );

      if (tran_id) {
        await PaymentModel.updatePaymentStatus(tran_id, "cancelled");
      }

      res.redirect(
        `${process.env.FRONTEND_URL}/payment-result?payment=cancelled&orderId=${orderId}`
      );
    } catch (error) {
      console.error("Payment cancellation handling error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL}/payment-result?payment=cancelled&orderId=${orderId}`
      );
    }
  },

  handleIPN: async (req, res) => {
    try {
      console.log("IPN received:", req.body);

      const { tran_id, val_id, status, amount } = req.body;

      if (status !== "VALID") {
        console.log("Invalid IPN status:", status);
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;

      const verifyResponse = await axios.get(verifyUrl);

      if (verifyResponse.data.status !== "VALID") {
        console.log("IPN verification failed:", verifyResponse.data);
        return res.status(400).json({ error: "Payment verification failed" });
      }

      await PaymentModel.updatePaymentStatus(tran_id, "completed", val_id);

      console.log("IPN processed successfully for transaction:", tran_id);
      res.json({ success: true, message: "IPN processed successfully" });
    } catch (error) {
      console.error("IPN handling error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getPaymentHistory: asyncHandler(async (req, res) => {
    const { senderEmail } = req.params;
    const payments = await PaymentModel.getPaymentsBySender(senderEmail);
    res.status(200).json(new ApiResponse(200, payments, "Payment history fetched successfully"));
  }),

  getEarnings: asyncHandler(async (req, res) => {
    const { travelerEmail } = req.params;
    const payments = await PaymentModel.getPaymentsByTraveler(travelerEmail);

    const totalEarnings = payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    res.status(200).json(new ApiResponse(200, {
      payments,
      totalEarnings,
    }, "Earnings fetched successfully"));
  }),

  getAllPayments: asyncHandler(async (req, res) => {
    const payments = await PaymentModel.getAllPayments();

    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const bid = await BidModel.getBidsByPost(payment.orderId);
        const traveler = await UserModel.getUserByEmail(
          payment.travelerEmail
        );
        const sender = await UserModel.getUserByEmail(payment.senderEmail);

        return {
          ...payment,
          bidDetails: bid,
          travelerName: traveler ? traveler.name : "Unknown",
          senderName: sender ? sender.name : "Unknown",
        };
      })
    );

    res.status(200).json(new ApiResponse(200, enrichedPayments, "All payments fetched successfully"));
  }),

  createPayment: asyncHandler(async (req, res) => {
    const paymentData = req.body;
    const result = await PaymentModel.createPayment(paymentData);
    res.status(201).json(new ApiResponse(201, result, "Payment created successfully"));
  }),

  processTravelerPayout: asyncHandler(async (req, res) => {
    const { orderId, status } = req.body;

    if (status !== "completed" && status !== "delivered") {
      throw new ApiError(400, "Invalid status for payout");
    }

    const bid = await BidModel.getBidById(orderId);
    if (!bid) {
      throw new ApiError(404, "Bid not found");
    }

    if (bid.payoutProcessed) {
      throw new ApiError(400, "Payout already processed");
    }

    const payment = await PaymentModel.getPaymentByOrderId(orderId);
    if (!payment || payment.status !== "completed") {
      throw new ApiError(400, "Payment not found or not completed");
    }

    const totalAmount = parseFloat(payment.amount);
    const travelerEarnings = totalAmount * 0.9;

    await UserModel.deductAdminBalance(travelerEarnings);
    await UserModel.updateTravelerBalance(
      bid.travelerEmail,
      travelerEarnings
    );
    await BidModel.updateBidPayoutStatus(orderId, true);

    await PaymentModel.updatePaymentPayout(payment.paymentIntentId, {
      payoutProcessed: true,
      payoutDate: new Date(),
      travelerEarnings,
      adminRetained: totalAmount * 0.1,
    });

    res.status(200).json(new ApiResponse(200, {
      travelerEarnings,
      adminRetained: totalAmount * 0.1,
      orderId,
    }, "Traveler payout processed successfully"));
  }),

  handleBidStatusUpdate: async (orderId, newStatus) => {
    try {
      if (newStatus === "completed" || newStatus === "delivered") {
        const bid = await BidModel.getBidById(orderId);

        if (bid && !bid.payoutProcessed) {
          const payment = await PaymentModel.getPaymentByOrderId(orderId);

          if (payment && payment.status === "completed") {
            const totalAmount = parseFloat(payment.amount);
            const travelerEarnings = totalAmount * 0.9;

            await UserModel.deductAdminBalance(travelerEarnings);
            await UserModel.updateTravelerBalance(
              bid.travelerEmail,
              travelerEarnings
            );
            await BidModel.updateBidPayoutStatus(orderId, true);

            await PaymentModel.updatePaymentPayout(payment.paymentIntentId, {
              payoutProcessed: true,
              payoutDate: new Date(),
              travelerEarnings,
              adminRetained: totalAmount * 0.1,
            });

            console.log(
              `Auto-payout processed for order ${orderId}: Traveler received ${travelerEarnings}, Admin retained ${
                totalAmount * 0.1
              }`
            );
          }
        }
      }
    } catch (error) {
      console.error("Auto-payout error:", error);
    }
  },
};

module.exports = paymentController;
