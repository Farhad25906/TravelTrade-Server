const { connectToDatabase, getObjectId } = require("../config/db");

class BidModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelBids");
  }

  static async getBidsInTravelerPosts(travelerEmail) {
    const collection = await this.getCollection();
    return collection.find({ travelerEmail }).toArray();
  }

  static async createBid(bid) {
    const collection = await this.getCollection();
    return collection.insertOne({
      ...bid,
      status: "travellerPending",
      createdAt: new Date(),
    });
  }

  static async updateBidPayoutStatus(bidId, payoutProcessed, travelerEarnings = null, platformFee = null) {
    const collection = await this.getCollection();
    const updateData = {
      payoutProcessed,
      payoutDate: new Date(),
    };

    if (travelerEarnings !== null) {
      updateData.travelerEarnings = travelerEarnings;
    }

    if (platformFee !== null) {
      updateData.platformFee = platformFee;
    }

    return collection.updateOne(
      { _id: getObjectId(bidId) },
      {
        $set: updateData,
      }
    );
  }

  static async getBidsByPost(postId) {
    const collection = await this.getCollection();
    return collection.findOne({ postId });
  }

  static async updateCheckStatus(bidId, status, checkImage = null) {
    const collection = await this.getCollection();
    const updateData = {
      checkStatus: status,
      status: status, // Also update the main status
      updatedAt: new Date(), // Add timestamp for when check was uploaded
    };

    if (checkImage) {
      updateData.checkImage = checkImage;
      updateData.checkUploadedAt = new Date(); // Track when check was uploaded
    }

    return collection.updateOne(
      { _id: getObjectId(bidId) },
      { $set: updateData }
    );
  }

  static async getAllBidsForAdmin() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  static async getBidById(bidId) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(bidId) });
  }

  static async updateBidStatus(bidId, status, travelerEarnings = null) {
    const collection = await this.getCollection();
    const updateData = { 
      status,
      updatedAt: new Date()
    };

    if (travelerEarnings !== null) {
      updateData.travelerEarnings = travelerEarnings;
    }

    const result = await collection.updateOne(
      { _id: getObjectId(bidId) },
      { $set: updateData }
    );
    return result;
  }

  static async getUserBids(email) {
    const collection = await this.getCollection();
    return collection
      .find({
        $or: [{ senderEmail: email }, { travelerEmail: email }],
      })
      .toArray();
  }
}

module.exports = BidModel;