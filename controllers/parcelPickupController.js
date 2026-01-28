const ParcelPickupModel = require("../models/parcelPickupModel");
const BidModel = require("../models/bidModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const parcelPickupController = {
  createInstruction: asyncHandler(async (req, res) => {
    const instruction = req.body;
    const result = await ParcelPickupModel.createInstruction(instruction);
    
    // Update bid status to parcel_Pickup
    await BidModel.updateBidStatus(instruction.bidId, "parcel_Pickup");
    
    res.status(201).json(new ApiResponse(201, { instructionId: result.insertedId }, "Instruction created successfully"));
  }),

  getInstructionsByBid: asyncHandler(async (req, res) => {
    const bidId = req.params.bidId;
    const instruction = await ParcelPickupModel.getInstructionsByBid(bidId);
    if (!instruction) {
      throw new ApiError(404, "No instructions found");
    }
    res.status(200).json(new ApiResponse(200, instruction, "Instruction fetched successfully"));
  }),

  getInstructionsForTraveler: asyncHandler(async (req, res) => {
    const travelerEmail = req.params.travelerEmail;
    const instructions = await ParcelPickupModel.getInstructionsForTraveler(travelerEmail);
    res.status(200).json(new ApiResponse(200, instructions, "Instructions fetched successfully"));
  }),
};

module.exports = parcelPickupController;