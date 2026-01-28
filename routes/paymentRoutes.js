const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const withdrawalController = require("../controllers/withdrawalController");

// Payment initiation
router.post("/initiate", paymentController.initiatePayment);

// Payment callback URLs
router.get("/success/:orderId", paymentController.handleSuccess);
router.post("/success/:orderId", paymentController.handleSuccess);

router.get("/fail/:orderId", paymentController.handleFailure);
router.post("/fail/:orderId", paymentController.handleFailure);

router.get("/cancel/:orderId", paymentController.handleCancel);
router.post("/cancel/:orderId", paymentController.handleCancel);

// IPN handler
router.post("/ipn", paymentController.handleIPN);

// Payment history and earnings
router.get("/history/:senderEmail", paymentController.getPaymentHistory);
router.get("/earnings/:travelerEmail", paymentController.getEarnings);
router.get("/all", paymentController.getAllPayments);
router.post("/create", paymentController.createPayment);

// Payout processing
router.post("/process-payout", paymentController.processTravelerPayout);

// Withdrawal routes
router.post("/withdrawals", withdrawalController.createWithdrawal);
router.get(
  "/withdrawals/:travelerEmail",
  withdrawalController.getWithdrawalsByTraveler
);
router.get("/withdrawals/admin/all", withdrawalController.getAllWithdrawals);
router.patch(
  "/withdrawals/:id/status",
  withdrawalController.updateWithdrawalStatus
);
router.post("/handle-bid-status", paymentController.handleBidStatusUpdate);
module.exports = router;
