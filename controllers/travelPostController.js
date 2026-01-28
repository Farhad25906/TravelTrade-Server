const TravelPostModel = require("../models/travelPostModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const travelPostController = {
  createPost: asyncHandler(async (req, res) => {
    const post = req.body;
    const result = await TravelPostModel.createPost(post);
    res.status(201).json(new ApiResponse(201, { postId: result.insertedId }, "Post created successfully"));
  }),

  getMyPosts: asyncHandler(async (req, res) => {
    const posts = await TravelPostModel.getPostsByTraveler(req.params.email);
    res.status(200).json(new ApiResponse(200, posts, "My posts fetched successfully"));
  }),

  getPostById: asyncHandler(async (req, res) => {
    const posts = await TravelPostModel.getPostById(req.params.postId);
    if (!posts) {
      throw new ApiError(404, "Post not found");
    }
    res.status(200).json(new ApiResponse(200, posts, "Post fetched successfully"));
  }),

  searchPosts: asyncHandler(async (req, res) => {
    const { departure, arrival } = req.query;
    const posts = await TravelPostModel.getApprovedPosts(departure, arrival);
    res.status(200).json(new ApiResponse(200, posts, "Posts searched successfully"));
  }),

  getPendingPosts: asyncHandler(async (req, res) => {
    const posts = await TravelPostModel.getPendingPosts();
    res.status(200).json(new ApiResponse(200, posts, "Pending posts fetched successfully"));
  }),

  updatePostStatus: asyncHandler(async (req, res) => {
    const { postId, status } = req.body;
    const result = await TravelPostModel.setPostStatus(postId, status);
    res.status(200).json(new ApiResponse(200, result, "Post status updated successfully"));
  }),

  getAllPublicPosts: asyncHandler(async (req, res) => {
    const posts = await TravelPostModel.getAllPublicPosts();
    res.status(200).json(new ApiResponse(200, posts, "Public posts fetched successfully"));
  }),
};

module.exports = travelPostController;
