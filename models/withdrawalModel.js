const { connectToDatabase, getObjectId } = require("../config/db");

class WithdrawalModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelWithdrawals");
  }

  static async createWithdrawal(withdrawalData) {
    const collection = await this.getCollection();

    // Check if traveler has sufficient balance (added validation)
    const userCollection = await connectToDatabase().then((db) =>
      db.collection("tradeTravelUsers")
    );
    const traveler = await userCollection.findOne({
      email: withdrawalData.travelerEmail,
    });

    if (!traveler) {
      throw new Error("Traveler not found");
    }

    if (traveler.balance < withdrawalData.amount) {
      throw new Error("Insufficient balance for withdrawal");
    }

    // Deduct balance immediately (optional, or do it in controller after approval)
    // await userCollection.updateOne(
    //   { email: withdrawalData.travelerEmail },
    //   { $inc: { balance: -withdrawalData.amount } }
    // );

    return collection.insertOne({
      ...withdrawalData,
      status: "pending", // Default status
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async getWithdrawalsByTraveler(travelerEmail) {
    const collection = await this.getCollection();
    return collection.find({ travelerEmail }).sort({ createdAt: -1 }).toArray();
  }

  static async getAllWithdrawals() {
    const collection = await this.getCollection();
    return collection.find().sort({ createdAt: -1 }).toArray();
  }
  static async getWithdrawalById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(id) });
  }

  static async updateWithdrawalStatus(id, status) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
  }
}

module.exports = WithdrawalModel;
