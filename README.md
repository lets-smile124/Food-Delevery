# 🍔 Tomato — Full-Stack Food Delivery Platform

A full-stack food delivery platform built with the **MERN stack**, featuring **JWT authentication, Stripe online payments, delivery address management, an AI-powered food assistant, and a dedicated admin dashboard**. Users can browse food items, manage their cart, place orders, make secure online payments, and track their orders, while administrators can manage food items and customer orders.

---

## 🚀 Features

### 👤 User Features

* 🔐 **JWT Authentication** — Secure user registration and login with token-based authentication
* 🍕 **Food Browsing** — Browse available food items by category
* 🛒 **Shopping Cart** — Add, remove, and manage food items
* 📍 **Delivery Address** — Capture complete delivery information during checkout
* 💳 **Stripe Payments** — Secure online payments through Stripe Checkout
* 📦 **Order Management** — View order history and current order status
* 🔄 **Payment Verification** — Verify Stripe payments before confirming orders
* 🤖 **AI Food Assistant** — AI-powered conversational assistant for food-related user queries
* 🔔 **Toast Notifications** — Real-time feedback for user actions

### 👨‍💼 Admin Features

* 📊 **Admin Dashboard** — Dedicated dashboard for managing the platform
* 🍔 **Food Management** — Add, list, and remove food items
* 🖼️ **Image Uploads** — Upload food images using Multer
* 📦 **Order Management** — View all customer orders
* 🔄 **Order Status Updates** — Update the status of customer orders

---

## 🛠️ Tech Stack

| Layer              | Technologies                                  |
| ------------------ | --------------------------------------------- |
| **Frontend**       | React.js, React Router DOM, Context API       |
| **Backend**        | Node.js, Express.js                           |
| **Database**       | MongoDB, Mongoose                             |
| **Authentication** | JWT, bcrypt                                   |
| **Payments**       | Stripe Checkout                               |
| **AI**             | AI-powered conversational assistant / LLM API |
| **HTTP Client**    | Axios                                         |
| **File Uploads**   | Multer                                        |
| **Notifications**  | React Toastify                                |
| **Deployment**     | Render                                        |
| **Development**    | Vite, Git, GitHub                             |

---

## 🏗️ Project Architecture

The application consists of three main parts:

```text
Tomato/
│
├── frontend/                    # User-facing React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   ├── FoodItem/
│   │   │   └── LoginPopup/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Cart/
│   │   │   ├── PlaceOrder/
│   │   │   ├── MyOrders/
│   │   │   └── Verify/
│   │   │
│   │   └── context/
│   │       └── StoreContext.jsx
│   │
│   └── package.json
│
├── admin/                       # Admin dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Add/
│   │   │   ├── List/
│   │   │   └── Orders/
│   │   └── ...
│   │
│   └── package.json
│
└── backend/                     # Express REST API
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── foodController.js
    │   ├── orderController.js
    │   └── userController.js
    │
    ├── middleware/
    │   └── auth.js
    │
    ├── models/
    │   ├── foodModel.js
    │   ├── orderModel.js
    │   └── userModel.js
    │
    ├── routes/
    │   ├── foodRoute.js
    │   ├── orderRoute.js
    │   └── userRoute.js
    │
    ├── uploads/
    ├── server.js
    └── .env
```

---

# 🔐 Authentication & Authorization

The application uses **JWT-based authentication** to secure user-specific operations.

### Authentication Flow

```text
User Registration
       ↓
Password hashed using bcrypt
       ↓
User Login
       ↓
JWT generated
       ↓
Token stored on frontend
       ↓
Token sent with protected requests
       ↓
Backend authentication middleware
       ↓
JWT verification
       ↓
Authenticated request processed
```

The authentication middleware verifies the JWT using the server-side `JWT_SECRET` and attaches the authenticated user's ID to the request.

---

# 🛒 Cart & Order Flow

The complete ordering process is:

```text
Browse Food
     ↓
Add Items to Cart
     ↓
Review Cart
     ↓
Enter Delivery Address
     ↓
Place Order
     ↓
Create Stripe Checkout Session
     ↓
Complete Payment
     ↓
Redirect to Verification Page
     ↓
Verify Payment
     ↓
Confirm Order
     ↓
View Order History
```

The **React Context API** is used to manage global frontend state such as food items, cart items, authentication tokens, and cart operations.

---

# 💳 Stripe Payment Integration

The application integrates **Stripe Checkout** for online payments.

### Payment Flow

1. User reviews the cart and enters delivery information.
2. The frontend sends the order information to the backend.
3. The backend creates the order and prepares Stripe `line_items`.
4. Food prices are converted from INR to paise.
5. The user is redirected to Stripe Checkout.
6. Stripe processes the payment.
7. Stripe redirects the user back to the application's verification page.
8. The backend verifies the payment.
9. The order is confirmed after successful payment verification.

Stripe secret credentials are stored in environment variables and are never exposed to the frontend.

---

# 🤖 AI Food Assistant

Tomato also includes an **AI-powered conversational assistant** integrated into the food-delivery platform.

The assistant allows users to enter food-related queries and receive AI-generated responses through the application.

### AI Flow

```text
User Query
     ↓
React Frontend
     ↓
Backend API
     ↓
AI / LLM Service
     ↓
Generated Response
     ↓
Frontend
     ↓
User
```

The AI assistant is designed to provide a more interactive experience instead of limiting users to traditional food browsing and ordering workflows.

### Potential Extensions

The assistant can be further extended to support:

* Personalized food recommendations
* Context-aware recommendations based on cart items
* Dietary and nutritional information
* Multilingual food assistance
* Order-related conversational assistance

---

# 📍 Delivery Address Management

Delivery information is captured during checkout and stored with the corresponding order.

The order structure supports fields such as:

```text
firstName
lastName
email
street
city
state
zipCode
country
phone
```

Mongoose schema definitions ensure that the expected address fields are explicitly represented in the order data.

---

# 📦 Order Management

### User

Users can:

* Place food orders
* View previous orders
* View order details
* Track order status
* View delivery information

### Admin

Administrators can:

* View all customer orders
* View order details
* Update order status
* Manage food items
* Upload food images

### Order Lifecycle

```text
Processing
    ↓
Out for Delivery
    ↓
Delivered
```

---

# 🖼️ Food Image Upload

The admin application supports food image uploads.

The backend uses **Multer** to process multipart form-data and store uploaded food images in the `uploads` directory.

The Express server exposes these uploaded images through a static route so that they can be accessed by the frontend.

---

# 🔌 REST API

## 👤 User APIs

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| `POST` | `/api/user/register` | Register a new user   |
| `POST` | `/api/user/login`    | Login and receive JWT |

## 🍔 Food APIs

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| `POST` | `/api/food/add`    | Add a food item     |
| `GET`  | `/api/food/list`   | Retrieve food items |
| `POST` | `/api/food/remove` | Remove a food item  |

## 🛒 Cart APIs

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| `POST` | `/api/cart/add`    | Add an item to cart      |
| `POST` | `/api/cart/remove` | Remove an item from cart |
| `POST` | `/api/cart/get`    | Retrieve user's cart     |

## 📦 Order APIs

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| `POST` | `/api/order/place`      | Create an order and initiate payment |
| `POST` | `/api/order/verify`     | Verify Stripe payment                |
| `POST` | `/api/order/userorders` | Retrieve user's orders               |
| `GET`  | `/api/order/list`       | Retrieve all orders for admin        |
| `POST` | `/api/order/status`     | Update order status                  |

---

# 🧠 Key Implementation Concepts

### React Context API

Global state is managed using `StoreContext`, including:

* Food list
* Cart items
* Authentication token
* Cart operations

### JWT + bcrypt

Passwords are hashed using **bcrypt**, while JWT tokens are used to authenticate protected requests.

### Express REST APIs

The backend follows a modular architecture:

```text
Routes
  ↓
Controllers
  ↓
Models
  ↓
MongoDB
```

This separates routing, business logic, and database operations.

### Mongoose

Mongoose is used for:

* Schema definition
* Data validation
* MongoDB operations
* User, food, and order models

### Axios

Axios handles communication between the React frontend and Express backend.

### Multer

Multer processes food image uploads from the admin dashboard.

### Stripe

Stripe Checkout handles secure online payment processing and payment verification.

---

# ⚙️ Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=4000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

# Add your AI/LLM API key if required by the configured AI service
AI_API_KEY=your_ai_api_key
```

> ⚠️ **Never commit `.env` files or API keys to GitHub.**

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js
* MongoDB Atlas account
* Stripe account
* Required AI/LLM API credentials
* Git

## 1. Clone the Repository

```bash
git clone https://github.com/lets-smile124/Food-Delevery.git

cd Food-Delevery
```

## 2. Setup Backend

```bash
cd backend
npm install
```

Create the `.env` file and configure the required environment variables.

Start the backend:

```bash
npm run server
```

Backend:

```text
http://localhost:4000
```

## 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## 4. Setup Admin Panel

Open another terminal:

```bash
cd admin
npm install
npm run dev
```

---

# 🌐 Application Architecture

```text
                         ┌──────────────────┐
                         │      User        │
                         │     Frontend     │
                         └────────┬─────────┘
                                  │
                         REST API / Axios
                                  │
                                  ↓
                         ┌──────────────────┐
                         │     Express      │
                         │     Backend      │
                         └───────┬──┬───┬───┘
                                 │  │   │
                  ┌──────────────┘  │   └──────────────┐
                  ↓                 ↓                  ↓
          ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
          │   MongoDB   │   │   Stripe    │   │ AI / LLM    │
          │   Database  │   │  Payments   │   │   Service   │
          └─────────────┘   └─────────────┘   └─────────────┘
                  ↑
                  │
          ┌───────┴───────┐
          │     Admin     │
          │     Panel     │
          └───────────────┘
```

---

# 🐛 Development & Debugging

During development, several integration issues were identified and resolved, including:

* Fixed `fetchrders` → `fetchOrders` function naming issue
* Fixed `paument` → `payment` schema field typo
* Corrected Stripe `unit_amount` handling for INR
* Removed incorrect USD-to-INR conversion
* Fixed React Router `pathh` → `path` typo
* Added delivery address fields to the order schema
* Fixed JWT authentication and token handling
* Configured MongoDB Atlas connection
* Configured environment variables for sensitive credentials
* Implemented Multer-based image uploads
* Debugged frontend/backend API communication
* Implemented Stripe payment verification
* Fixed protected-route authentication issues
* Debugged frontend routing and refresh-related issues
* Integrated and debugged the AI assistant API flow

---

# 🔒 Security

The application implements several basic security practices:

* Password hashing using **bcrypt**
* JWT-based authentication
* Protected backend routes
* Environment variables for sensitive credentials
* `.env` excluded from Git
* Stripe secret key kept on the backend
* MongoDB credentials kept outside source code
* Server-side payment verification

---


# 🚀 Future Improvements

* 🔎 Advanced food search and filtering
* ⭐ Food ratings and reviews
* ❤️ Wishlist functionality
* 📧 Email notifications
* 🔔 Real-time order notifications
* 📊 Advanced admin analytics
* 🧾 Invoice generation
* 🗺️ Real-time delivery tracking
* 🤖 Personalized AI food recommendations
* 🌐 Multilingual AI assistance
* 🧪 Automated unit and API testing
* 🐳 Docker-based deployment

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

For major changes, please open an issue first to discuss the proposed changes.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ❤️ Acknowledgement

Tomato was developed as a full-stack project to gain practical experience with **React, Node.js, Express, MongoDB, REST APIs, authentication, payment gateway integration, file uploads, and AI integration**.

---

**Made with ❤️ and a lot of debugging.**
