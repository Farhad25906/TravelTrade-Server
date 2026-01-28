const { connectToDatabase, getObjectId } = require("../config/db");

class PaymentModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelPayments");
  }

  static async createPayment(paymentData) {
    const collection = await this.getCollection();
    return collection.insertOne(paymentData);
  }

  static async getPaymentsBySender(senderEmail) {
    const collection = await this.getCollection();
    return collection.find({ senderEmail }).toArray();
  }

  static async updatePaymentStatus(transactionId, status, valId = null) {
    const collection = await this.getCollection();
    const updateData = { status };

    if (valId) {
      updateData.valId = valId;
      updateData.paidAt = new Date();
    }

    return collection.updateOne(
      { paymentIntentId: transactionId },
      { $set: updateData }
    );
  }

  static async getPaymentsByTraveler(travelerEmail) {
    const collection = await this.getCollection();
    return collection.find({ travelerEmail, status: "completed" }).toArray();
  }

  static async getAllPayments() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  static async getPaymentByOrderId(orderId) {
    const collection = await this.getCollection();
    return collection.findOne({ orderId });
  }

  static async updatePaymentPayout(paymentIntentId, payoutData) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { paymentIntentId },
      { $set: payoutData }
    );
  }
}

module.exports = PaymentModel;