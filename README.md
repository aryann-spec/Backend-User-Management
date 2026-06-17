# Backend User Management API

A secure, production-ready RESTful API for user management and authentication.

## 🚀 Features
- **User Authentication**: Secure registration and login using JWT (JSON Web Tokens).
- **Role-Based Access Control (RBAC)**: Middleware-protected routes to distinguish between 'admin' and 'user' roles.
- **RESTful Architecture**: Clean endpoints for managing user profiles.
- **Data Security**: Password hashing and environment variable configuration.

## 🛠️ Tech Stack
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **JSON Web Tokens (JWT)**

## 📦 Getting Started
1. Clone the repository: `git clone https://github.com/aryann-spec/Backend-User-Management.git`
2. Install dependencies: `npm install`
3. Create a `.env` file with your `MONGO_URI`, `JWT_SECRET`, and `PORT`.
4. Run the server: `npm run dev`