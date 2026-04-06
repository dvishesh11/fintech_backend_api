# 🏦 Fintech Backend API

A **production-ready RESTful API** built with Node.js, Express, and MongoDB — featuring JWT authentication, role-based access control, input validation, request sanitization, rate limiting, structured logging, and graceful shutdown.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Documentation](#-api-documentation)
  - [Auth Endpoints](#auth-endpoints)
  - [User Endpoints](#user-endpoints)
- [Authentication](#-authentication)
- [Role-Based Access Control](#-role-based-access-control)
- [Error Handling](#-error-handling)
- [Security](#-security)
- [Logging](#-logging)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login and registration with token-based auth
- 👑 **Role-Based Access Control** — `user` and `admin` roles with route-level protection
- ✅ **Input Validation** — Schema-based validation using Joi on all endpoints
- 🛡️ **Security Hardened** — Helmet, XSS protection, NoSQL injection prevention, CORS
- 🚦 **Rate Limiting** — Global + stricter auth-route rate limiting
- 📝 **Structured Logging** — Winston with daily rotating log files
- 🗜️ **Response Compression** — Gzip compression via `compression`
- 📄 **Pagination & Filtering** — Built-in for all list endpoints
- 💤 **Soft Delete** — Users are deactivated, not permanently deleted
- 🔄 **Graceful Shutdown** — Handles `SIGTERM`/`SIGINT` cleanly
- ❌ **Centralized Error Handling** — Consistent error response format across all routes

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 18 |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Validation | Joi |
| Password Hashing | bcryptjs |
| Logging | Winston + Daily Rotate File |
| Security | Helmet, xss, CORS, Rate Limit |
| Dev Tool | Nodemon |

---

## 📁 Project Structure

```
fintech_backend/
├── logs/                          # Auto-generated log files
│   ├── combined-YYYY-MM-DD.log
│   └── error-YYYY-MM-DD.log
├── src/
│   ├── config/
│   │   ├── config.js              # Centralized env config + validation
│   │   └── db.js                  # MongoDB connection with events
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   └── userController.js      # CRUD operations for users
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize (RBAC)
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── rateLimiter.js         # Global + auth-specific rate limits
│   │   └── validate.js            # Joi validation middleware
│   ├── models/
│   │   └── User.js                # Mongoose user schema + methods
│   ├── routes/
│   │   ├── index.js               # Route aggregator
│   │   ├── authRoutes.js          # /auth endpoints
│   │   └── userRoutes.js          # /users endpoints
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standardized response wrapper
│   │   └── logger.js              # Winston logger setup
│   ├── validators/
│   │   └── userValidator.js       # Joi schemas for all user inputs
│   └── app.js                     # Express app setup + middleware chain
├── .env                           # Local environment variables (gitignored)
├── .env.example                   # Environment variable template
├── .gitignore
├── package.json
└── server.js                      # Entry point — DB connect + server start
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm >= 9

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/fintech_backend.git
cd fintech_backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

---

### Environment Variables

Create a `.env` file in the root directory. All variables below are required:

```env
# App
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/fintech_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d

# CORS (comma-separated origins, or * for all)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

### Running the App

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server will start at: `http://localhost:5000`

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "env": "development",
  "timestamp": "2026-04-06T10:00:00.000Z"
}
```

---

### Auth Endpoints

#### Register
```http
POST /api/v1/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@1234"
}
```

> Password must be at least 8 characters and contain uppercase, lowercase, and a number.

**Response `201`:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-04-06T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Login
```http
POST /api/v1/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Test@1234"
}
```

**Response `200`:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get My Profile
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

### User Endpoints

> All user endpoints require `Authorization: Bearer <token>` header.

#### Get All Users — 👑 Admin Only
```http
GET /api/v1/users
Authorization: Bearer <admin_token>
```

**Query Params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |
| `search` | string | Search by name |
| `role` | string | Filter by role (`user` / `admin`) |
| `isActive` | boolean | Filter by active status |

**Example:**
```http
GET /api/v1/users?page=1&limit=5&search=john&role=user
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 5,
      "totalPages": 5
    }
  }
}
```

---

#### Get User by ID — 👑 Admin Only
```http
GET /api/v1/users/:id
Authorization: Bearer <admin_token>
```

---

#### Update User — 🔒 Own Profile or Admin
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Updated"
}
```

---

#### Delete (Deactivate) User — 👑 Admin Only
```http
DELETE /api/v1/users/:id
Authorization: Bearer <admin_token>
```

> Users are **soft-deleted** (isActive set to false), not permanently removed.

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for stateless authentication.

1. Register or Login to receive a token
2. Include the token in all protected requests:
```
Authorization: Bearer <your_token_here>
```
3. Tokens expire after `7d` by default (configurable via `JWT_EXPIRES_IN`)

---

## 👑 Role-Based Access Control

| Endpoint | Public | User | Admin |
|---|:---:|:---:|:---:|
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `GET /auth/me` | ❌ | ✅ | ✅ |
| `GET /users` | ❌ | ❌ | ✅ |
| `GET /users/:id` | ❌ | ❌ | ✅ |
| `PUT /users/:id` | ❌ | ✅ (own) | ✅ |
| `DELETE /users/:id` | ❌ | ❌ | ✅ |

### Promoting a User to Admin

```bash
# Using MongoDB shell
mongosh
use fintech_db
db.users.updateOne({ email: "john@example.com" }, { $set: { role: "admin" } })
```

> After updating role, log in again to receive a new token with updated claims.

---

## ❌ Error Handling

All errors follow a consistent response format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": ["field-level errors if validation failed"],
  "stack": "stack trace (development only)"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad Request / Invalid ID |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Resource not found |
| `409` | Conflict — duplicate email |
| `422` | Validation failed |
| `429` | Too many requests |
| `500` | Internal server error |

---

## 🛡️ Security

| Measure | Implementation |
|---|---|
| Security Headers | `helmet` |
| NoSQL Injection | Custom sanitizer (strips `$` and `.` keys) |
| XSS Protection | Custom sanitizer using `xss` package |
| Rate Limiting | `express-rate-limit` (100 req/15min global, 10 req/15min auth) |
| Password Hashing | `bcryptjs` with salt rounds 12 |
| Token Security | JWT signed with secret, never stored in DB |
| CORS | Configurable allowed origins |
| Body Size Limit | 10kb max request body |
| Sensitive Fields | `password` and `refreshToken` excluded from all queries by default |

---

## 📝 Logging

Logs are written to the `logs/` directory with daily rotation:

```
logs/
├── combined-2026-04-06.log   # All levels
└── error-2026-04-06.log      # Errors only
```

- Logs older than **14 days** are automatically deleted
- Archived logs are **gzip compressed**
- Console output is **colorized** in development

---

## 📜 Scripts

```bash
npm start       # Start with node (production)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---



