# 💰 TravelTrade Server - P2P Logistics Backend

A robust and secure backend API for TravelTrade, powering the peer-to-peer logistics and travel platform. Built with Node.js, Express, TypeScript, and MongoDB.

## 🌐 Live URL

- **Backend API:** [https://travel-trade-server.vercel.app](https://travel-trade-server.vercel.app)
- **API Documentation:** `/api/v1`

---

## 🎯 Overview

TravelTrade Server is a production-ready RESTful API that handles all business logic, data persistence, and secure transaction processing for the TravelTrade ecosystem. It supports role-based access for Users (Senders/Travelers) and Admins, manages secure payments, and handles real-time bidding operations.

### Key Highlights

- ✅ **Role-Based Access Control** - Secure endpoints for Travelers, Senders, and Admins
- ✅ **Secure Authentication** - JWT-based auth with Firebase verification
- ✅ **Real-Time Bidding** - Efficient handling of parcel requests and traveler offers
- ✅ **Safe Transactions** - Integrated Stripe & SSLCommerz payment gateways
- ✅ **Chat System** - Backend support for messaging
- ✅ **Scalable Architecture** - Modular controller-service pattern
- ✅ **Input Validation** - Robust data validation
- ✅ **Database Design** - Optimized MongoDB schemas

---

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT Authentication** - Secure token-based access
- **Role Management** - Custom middleware for role verification
- **Social Auth Support** - Integration with Firebase Auth
- **User Verification** - Account status (verified/unverified) handling

### 💸 Transaction System

- **Bidding Engine** - Manage bids, accept/reject logic
- **Payment Processing** - Handle payment intents and webhooks
- **Wallet Management** - Track earnings and withdrawals
- **Order creation** - Secure order generation upon bid acceptance

### 📦 Logistics Management

- **Parcel Requests** - CRUD operations for shipment requests
- **Travel Plans** - CRUD operations for trip postings
- **Matching Algorithm** - Logic to match parcels with suitable travelers
- **Status Tracking** - Update and retrieve shipment status

### 👥 User Management

- **Profile Updates** - Manage user details and preferences
- **Admin Controls** - User ban/unban, role modifications
- **Review System** - Handle ratings and text reviews

### 📊 Admin Tools

- **Dashboard Analytics** - Aggregated data for platform insights
- **Dispute Resolution** - Endpoint support for managing conflicts
- **Financial Overview** - Track total transactions and revenue

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime | Latest LTS |
| **Express.js** | Web framework | v4.21.x |
| **MongoDB** | NoSQL database | v6.x |
| **Mongoose** | ODM for MongoDB | v8.x |
| **JWT** | Authentication tokens | v9.x |
| **Stripe** | Payment processing | v17.x |
| **SSLCommerz** | Local payment gateway | Integrated |
| **Firebase Admin** | Auth verification | Latest |
| **Axios** | External requests | v1.9.x |
| **Cors** | Cross-origin resource sharing | v2.8.x |
| **Dotenv** | Environment variables | v16.x |

---

## 📁 Project Structure

```
TravelTrade-Server/
├── src/
│   ├── config/           # App configuration (DB, Stripe, etc.)
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── travelPostController.js
│   │   ├── bidController.js
│   │   ├── paymentController.js
│   │   └── ...
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── TravelPost.js
│   │   ├── Order.js
│   │   └── ...
│   ├── routes/           # API routes definition
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── travelRoutes.js
│   │   └── ...
│   ├── middleware/       # Custom middleware (Auth, Error handling)
│   ├── utils/            # Utility functions
│   ├── index.js          # App entry point
│   └── app.js            # Express app setup
├── .env                  # Environment variables
├── package.json
└── README.md
```

---

## 🚦 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | ❌ |
| POST | `/api/v1/auth/login` | User login | ❌ |
| GET | `/api/v1/auth/me` | Get current user | ✅ |

### User Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | Get all users (Admin) | ✅ |
| PATCH | `/api/v1/users/profile` | Update profile | ✅ |

### Travel Requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/travel-posts` | Create travel plan | ✅ |
| GET | `/api/v1/travel-posts` | Get available trips | ❌ |

### Bidding

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/bids` | Place a bid | ✅ |
| GET | `/api/v1/bids/my-bids` | Get user bids | ✅ |
| PATCH | `/api/v1/bids/:id/accept` | Accept a bid | ✅ |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/create-payment-intent` | Intiial payment | ✅ |
| POST | `/api/v1/withdraw` | Withdraw earnings | ✅ |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/traveltrade

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_pass
SSLCOMMERZ_IS_SANDBOX=true

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Atlas or Local)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TravelTrade.git
   cd TravelTrade/TravelTrade-Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

---

## 🔒 Security Best Practices

1. **Environment Variables** - Never commit `.env` files
2. **JWT** - Secure token handling and verification
3. **Input Validation** - Prevention of injection attacks
4. **CORS** - Restricted to allowlisted origins
5. **Secure Payments** - Implementation of standard payment protocols

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## � License

This project is licensed under the ISC License.

---

## 👨💻 Author

**TravelTrade Team**
- GitHub: [Your Profile](https://github.com/yourusername)

---

## 📞 Support

For support, email support@traveltrade.com.
