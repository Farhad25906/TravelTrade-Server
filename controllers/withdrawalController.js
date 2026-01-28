const WithdrawalModel = require('../models/withdrawalModel');
const UserModel = require('../models/userModel');
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const withdrawalController = {
  createWithdrawal: asyncHandler(async (req, res) => {
    const { travelerEmail, amount, bankDetails } = req.body;
    
    if (!travelerEmail || !amount || !bankDetails) {
      throw new ApiError(400, 'Missing required fields');
    }

    const traveler = await UserModel.getUserByEmail(travelerEmail);
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    if (traveler.balance < amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    const withdrawal = await WithdrawalModel.createWithdrawal({
      travelerEmail,
      amount,
      bankDetails,
    });

    res.status(201).json(new ApiResponse(201, withdrawal, "Withdrawal created successfully"));
  }),

  getWithdrawalsByTraveler: asyncHandler(async (req, res) => {
    const { travelerEmail } = req.params;
    const withdrawals = await WithdrawalModel.getWithdrawalsByTraveler(travelerEmail);
    res.status(200).json(new ApiResponse(200, withdrawals, "Withdrawals fetched successfully"));
  }),

  getAllWithdrawals: asyncHandler(async (req, res) => {
    const withdrawals = await WithdrawalModel.getAllWithdrawals();
    res.status(200).json(new ApiResponse(200, withdrawals, "All withdrawals fetched successfully"));
  }),

  updateWithdrawalStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const withdrawal = await WithdrawalModel.getWithdrawalById(id);
    if (!withdrawal) {
      throw new ApiError(404, 'Withdrawal not found');
    }

    if (status === 'approved') {
      await UserModel.updateUserBalance(
        withdrawal.travelerEmail,
        -withdrawal.amount
      );
    }

    await WithdrawalModel.updateWithdrawalStatus(id, status);

    res.status(200).json(new ApiResponse(200, null, "Withdrawal status updated successfully"));
  }),
};

module.exports = withdrawalController;