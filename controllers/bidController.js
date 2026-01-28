const BidModel = require("../models/bidModel");
const UserModel = require("../models/userModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const bidController = {
  createBid: asyncHandler(async (req, res) => {
    const bid = req.body;
    const result = await BidModel.createBid(bid);
    res.status(201).json(new ApiResponse(201, { bidId: result.insertedId }, "Bid created successfully"));
  }),

  getBidsInTravelerPosts: asyncHandler(async (req, res) => {
    const travelerEmail = req.params.travelerEmail;
    const bids = await BidModel.getBidsInTravelerPosts(travelerEmail);
    res.status(200).json(new ApiResponse(200, bids, "Bids fetched successfully"));
  }),

  getBidsByPost: asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const bid = await BidModel.getBidsByPost(postId);
    if (!bid) {
      throw new ApiError(404, "No bid found for this post");
    }
    res.status(200).json(new ApiResponse(200, bid, "Bid fetched successfully"));
  }),

  getBidById: asyncHandler(async (req, res) => {
    const bidId = req.params.bidId;
    const bid = await BidModel.getBidById(bidId);
    if (!bid) {
      throw new ApiError(404, "Bid not found");
    }
    res.status(200).json(new ApiResponse(200, bid, "Bid fetched successfully"));
  }),

  updateCheckStatus: asyncHandler(async (req, res) => {
    const bidId = req.params.bidId;
    const { status, checkImage } = req.body;

    await BidModel.updateCheckStatus(bidId, status, checkImage);
    const bid = await BidModel.getBidById(bidId);

    if (status === "received" && bid && bid.amount && !bid.payoutProcessed) {
      const totalAmount = parseFloat(bid.amount);
      const travelerEarnings = totalAmount * 0.9;
      const platformFee = totalAmount * 0.1;

      await UserModel.deductAdminBalance(travelerEarnings);
      await UserModel.updateTravelerBalance(bid.travelerEmail, travelerEarnings);

      await BidModel.updateBidPayoutStatus(
        bidId,
        true,
        travelerEarnings,
        platformFee
      );
    }
    res.status(200).json(new ApiResponse(200, null, "Check status updated successfully"));
  }),

  getAllBidsForAdmin: asyncHandler(async (req, res) => {
    const bids = await BidModel.getAllBidsForAdmin();
    res.status(200).json(new ApiResponse(200, bids, "All bids fetched for admin"));
  }),

  updateBidStatus: asyncHandler(async (req, res) => {
    const bidId = req.params.bidId;
    let { status } = req.body;

    const result = await BidModel.updateBidStatus(bidId, status);

    if (result.modifiedCount === 0) {
      throw new ApiError(400, "No changes made to bid");
    }

    const updatedBid = await BidModel.getBidById(bidId);

    if (
      status === "received" &&
      updatedBid.totalCost &&
      !updatedBid.payoutProcessed
    ) {
      const totalAmount = parseFloat(updatedBid.totalCost);
      const travelerEarnings = totalAmount * 0.9;
      const platformFee = totalAmount * 0.1;

      try {
        await UserModel.deductAdminBalance(travelerEarnings);
        await UserModel.updateTravelerBalance(updatedBid.travelerEmail, travelerEarnings);
        await BidModel.updateBidPayoutStatus(bidId, true, travelerEarnings, platformFee);
      } catch (balanceError) {
        // Potentially revert if needed, but asyncHandler will catch and respond
        throw balanceError;
      }
    }
    res.status(200).json(new ApiResponse(200, updatedBid, "Bid status updated successfully"));
  }),

  getUserBids: asyncHandler(async (req, res) => {
    const email = req.params.email;
    const bids = await BidModel.getUserBids(email);
    res.status(200).json(new ApiResponse(200, bids, "User bids fetched successfully"));
  }),
};

module.exports = bidController;
