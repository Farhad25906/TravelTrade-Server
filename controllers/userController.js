const UserModel = require("../models/userModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const userController = {
  getAllUsers: asyncHandler(async (req, res) => {
    const result = await UserModel.getAllUsers();
    res.status(200).json(new ApiResponse(200, result, "Users fetched successfully"));
  }),

  getUserByEmail: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const result = await UserModel.getUserByEmail(email);
    if (!result) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json(new ApiResponse(200, result, "User fetched successfully"));
  }),

  createUser: asyncHandler(async (req, res) => {
    const user = req.body;
    const existingUser = await UserModel.getUserByEmail(user.email);
    if (existingUser) {
      return res.status(200).json(new ApiResponse(200, { insertedId: null }, "User already exists"));
    }
    const result = await UserModel.createUser(user);
    res.status(201).json(new ApiResponse(201, result, "User created successfully"));
  }),

  deleteUser: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const result = await UserModel.deleteUser(id);
    res.status(200).json(new ApiResponse(200, result, "User deleted successfully"));
  }),

  updateUserRole: asyncHandler(async (req, res) => {
    const userEmail = req.params.email;
    const { role } = req.body;
    const result = await UserModel.updateUserRole(userEmail, role);
    res.status(200).json(new ApiResponse(200, result, "User role updated successfully"));
  }),

  checkAdminStatus: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const result = await UserModel.checkAdminStatus(email);
    res.status(200).json(new ApiResponse(200, result, "Admin status checked"));
  }),

  checkTravelerStatus: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const result = await UserModel.checkTravelerStatus(email);
    res.status(200).json(new ApiResponse(200, result, "Traveler status checked"));
  }),

  checkSenderStatus: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const result = await UserModel.checkSenderStatus(email);
    res.status(200).json(new ApiResponse(200, result, "Sender status checked"));
  }),

  updateUser: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const updateData = req.body;
    const result = await UserModel.updateUserByEmail(email, updateData);
    if (result.modifiedCount === 1) {
      res.status(200).json(new ApiResponse(200, null, "User updated successfully"));
    } else {
      throw new ApiError(404, "User not found or no changes made");
    }
  }),

  getAllVerifications: asyncHandler(async (req, res) => {
    const users = await UserModel.getAllUsers();
    const verifications = users.filter(
      (user) => user.verificationData?.status === "pending"
    );
    res.status(200).json(new ApiResponse(200, verifications, "Verifications fetched successfully"));
  }),

  updateVerificationstatus: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const { status } = req.body;
    const result = await UserModel.updateVerificationStatus(email, status);
    if (result.modifiedCount === 1) {
      res.status(200).json(new ApiResponse(200, null, "Verification status updated successfully"));
    } else {
      throw new ApiError(404, "User not found or no changes made");
    }
  }),

  getVerificationByEmail: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.verificationData) {
      throw new ApiError(404, "Verification data not found for this user");
    }

    res.status(200).json(new ApiResponse(200, user.verificationData, "Verification data fetched successfully"));
  }),

  addReview: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const reviewData = req.body;
    const result = await UserModel.addReview(email, reviewData);
    if (result.modifiedCount === 1) {
      res.status(200).json(new ApiResponse(200, null, "Review added successfully"));
    } else {
      throw new ApiError(404, "User not found");
    }
  }),

  getReviewsReceived: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const reviews = await UserModel.getReviewsReceived(email);
    res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
  }),

  getReviewsGiven: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const reviewsGiven = await UserModel.getReviewsGiven(email);
    res.status(200).json(new ApiResponse(200, reviewsGiven, "Reviews given fetched successfully"));
  }),

  getAllReviewsGivenBySenders: asyncHandler(async (req, res) => {
    const allReviewsBySenders = await UserModel.getAllReviewsGivenBySenders();
    res.status(200).json(new ApiResponse(200, { reviews: allReviewsBySenders, total: allReviewsBySenders.length }, "All sender reviews fetched successfully"));
  }),
};


module.exports = userController;