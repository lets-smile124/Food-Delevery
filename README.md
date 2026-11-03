# 🍔 Tomato — Full-Stack Food Delivery Platform

A modern, full-stack food delivery platform built with the **MERN stack**, featuring **JWT & OTP authentication, Stripe payments, comprehensive user & admin profile management, address book, dietary preferences, an AI culinary assistant, and an administrative restaurant operations dashboard**.

Customers can explore food items with customizable portions, manage their cart with a floating quick bar, apply first-time promo codes, securely complete checkout with Stripe, track live orders, and manage their profile and delivery addresses. Administrators have full control over food items, orders, restaurant operational settings, delivery charges, and store profiles.

---

## 🚀 Features

### 👤 Customer Features

* 🔐 **Authentication & Security** — Secure registration and login with JWT and bcrypt password hashing.
* 📧 **Email OTP Verification** — 6-digit OTP verification via Nodemailer for new account registration and password resets.
* 👤 **Complete Profile Management**:
  * View and update personal information (full name, phone, date of birth).
  * Email verification status indicator.
  * Profile picture upload and deletion with Cloudinary and fallback initials avatar.
* 📍 **Multiple Delivery Addresses**:
  * Add, edit, and delete categorized delivery addresses (Home, Work, Other).
  * Set a default address for 1-click checkout.
  * Store house number, street, city, state, zip code, landmark, and delivery instructions.
* 🍽️ **Portion Selection & Food Details** — Modal popups for food items with portion sizes (Small, Medium, Large) and dynamic pricing.
* 🛒 **Smart Shopping Cart** — Real-time cart calculations, item increment/decrement, and a floating quick-access cart bar during menu browsing.
* 🎟️ **First-Time Promo Code** — `new_user` promo granting a 20% discount exclusively on the customer's first order.
* 💳 **Stripe Payments** — Seamless online payments through Stripe Checkout with server-side verification.
* 📦 **Order Tracking & History**:
  * Track active order status (*Food Processing* → *Out for delivery* → *Delivered*).
  * Filter order history by status (*All*, *Processing*, *Delivered*, *Cancelled*).
  * Option to delete delivered orders from personal history.
* 🥗 **Dietary & Dining Preferences** — Save food preferences (Veg, Non-Veg, Vegan, Jain), food allergies, language, and notification settings.
* 🤖 **AI Culinary Assistant** — Conversational AI assistant powered by Google Gemini for dish recommendations, dietary inquiries, and meal suggestions.

### 👨‍💼 Administrator Features

* 📊 **Admin Dashboard** — Clean, dedicated administrative console for restaurant and catalog management.
* 🍔 **Food Catalog Management** — Add new food items with image uploads, list all dishes, and remove items with real-time UI updates.
* 📦 **Order Fulfillment**:
  * Live list of customer orders with itemized breakdowns and customer delivery addresses.
  * Status updater (*Food Processing*, *Out for delivery*, *Delivered*).
  * Ability to delete completed or cancelled orders from the administrative log.
* ⚙️ **Store & Admin Profile Management**:
  * Manage restaurant manager information, bio, and admin avatar (upload & delete).
  * Configure restaurant operational details: store name, address, support phone/email, operating hours, delivery fees, minimum order values, and estimated delivery times.
  * Store open/close toggle switch for accepting orders.
  * Change admin security passcodes with live strength validation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, React Router DOM v6, Vite, Context API, Vanilla CSS |
| **Admin Dashboard** | React 18, React Router DOM v6, Vite, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Email Services** | Nodemailer (SMTP OTP & welcome email dispatch) |
| **Media & Storage** | Cloudinary API, Multer (Memory & Disk Storage) |
| **Payments** | Stripe Checkout API |
| **AI Integration** | Google Gemini Generative AI API |
| **HTTP Client** | Axios |
| **Feedback & Notifications** | React Toastify |
| **Deployment Ready** | Vercel (Frontend & Admin), Render (Backend) |

---

## 🏗️ Project Architecture

The repository is organized as a clean, decoupled monorepo:

```text
Tomato/
│
├── frontend/                         # Customer-facing React SPA (Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── header_img.png
│   │   ├── icons.svg
│   │   └── _redirects
│   ├── src/
│   │   ├── assets/                   # Images, food photos, icons & brand graphics
│   │   ├── components/               # Reusable UI components
│   │   │   ├── AIAssistant/          # Floating AI chat assistant modal & trigger
│   │   │   ├── AIExperience/         # AI culinary banner & feature showcase
│   │   │   ├── AppDownload/          # Mobile app download CTA section
│   │   │   ├── ExploreMenu/          # Category filter navigation & scroll list
│   │   │   ├── FloatingCartBar/      # Sticky bottom floating cart preview & checkout pill
│   │   │   ├── FoodDetailModal/      # Item preview modal with size selection & pricing
│   │   │   ├── FoodDisplay/          # Grid displaying categorized food cards
│   │   │   ├── FoodItem/             # Individual dish card with add/remove counters
│   │   │   ├── Footer/               # Brand footer with links and contact info
│   │   │   ├── GuestLanding/         # Hero banner & value proposition for guests
│   │   │   ├── Header/               # Landing hero banner with call to action
│   │   │   ├── LoginPopup/           # Auth popup (Sign Up, Sign In, OTP, Forgot Password)
│   │   │   ├── Navbar/               # Responsive header navbar, cart icon, user profile menu
│   │   │   └── ProtectedRoute/       # Route guard for authenticated customer pages
│   │   ├── context/
│   │   │   └── StoreContext.jsx      # Global state (cart, auth token, food list, pricing)
│   │   ├── pages/                    # Routed application views
│   │   │   ├── Cart/                 # Cart breakdown, promo code (new_user), summary
│   │   │   ├── Home/                 # Landing view with category carousel and food grid
│   │   │   ├── MyOrders/             # Customer order history, status tracking & deletion
│   │   │   ├── PlaceOrder/           # Checkout form, address selection & payment initiation
│   │   │   ├── Profile/              # Comprehensive Profile Dashboard (Profile, Addresses, Security, Preferences)
│   │   │   └── Verify/               # Stripe payment verification redirect handler
│   │   ├── services/                 # Modular API service layer
│   │   │   ├── AIService.js          # AI Assistant chat API integration
│   │   │   ├── BaseApiService.js     # Axios client configuration & base headers
│   │   │   ├── CartService.js        # Cart sync endpoints
│   │   │   ├── FoodPricingService.js # Portion size & discount calculations
│   │   │   ├── FoodService.js        # Food catalog queries
│   │   │   ├── OrderService.js       # Order creation, verification, history & removal
│   │   │   └── UserService.js        # Profile, address book, preferences & security APIs
│   │   ├── utils/
│   │   │   └── CartCalculator.js     # Cart totals, taxes & promo calculations
│   │   ├── App.jsx                   # Main layout routing configuration
│   │   ├── App.css
│   │   ├── index.css                 # Global styling, tokens & CSS variables
│   │   └── main.jsx                  # Application entry point
│   ├── .env                          # Frontend environment variables (VITE_API_URL)
│   ├── package.json
│   └── vite.config.js
│
├── admin/                            # Administrative Management Dashboard (Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                   # Admin UI icons, parcel graphics & logos
│   │   ├── components/
│   │   │   ├── Navbar/               # Admin top navbar with store brand & manager profile pill
│   │   │   └── Sidebar/              # Navigation sidebar (Add, List, Orders, Profile)
│   │   ├── pages/
│   │   │   ├── Add/                  # Add new food item form with image upload
│   │   │   ├── List/                 # Food inventory list with delete action
│   │   │   ├── Orders/               # Order fulfillment management & live status updates
│   │   │   └── Profile/              # Admin profile, restaurant operations & security settings
│   │   ├── App.jsx                   # Admin app routing and view layout
│   │   ├── App.css
│   │   ├── index.css                 # Admin panel design tokens & styles
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/                          # Node.js & Express REST API Server
    ├── config/
    │   ├── cloudinary.js             # Cloudinary SDK credentials & setup
    │   ├── db.js                     # MongoDB connection initialization via Mongoose
    │   └── uploadToCloudinary.js      # Buffer/stream avatar upload pipeline
    ├── controlers/                   # Express request handlers & business logic
    │   ├── adminController.js        # Admin profile, store operations & security logic
    │   ├── aiController.js           # Google Gemini AI assistant processing
    │   ├── BaseController.js         # Base controller utility
    │   ├── cartControler.js          # Cart item additions, removals & sync
    │   ├── foodControlers.js         # Food catalog CRUD & image persistence
    │   ├── orderControler.js         # Order placement, Stripe session, status & deletion
    │   └── userControlers.js         # Auth, OTP, profile, addresses, preferences & password
    ├── middleware/
    │   └── auth.js                   # JWT authentication token verification middleware
    ├── models/                       # Mongoose data schemas
    │   ├── adminModel.js             # Admin manager info & restaurant operational settings
    │   ├── foodModels.js             # Food items schema (name, description, price, category, image)
    │   ├── orderModel.js             # Order schema (items, amount, address, payment, status)
    │   ├── otpModel.js               # One-time password verification codes with TTL
    │   └── userModel.js              # User schema (profile, addresses, preferences, avatar)
    ├── routes/                       # Express API route declarations
    │   ├── adminRoute.js             # /api/admin endpoints
    │   ├── aiRoute.js                # /api/ai chat endpoints
    │   ├── cartRoute.js              # /api/cart endpoints
    │   ├── foodRoute.js              # /api/food endpoints
    │   ├── orderRoute.js             # /api/order endpoints
    │   └── userRoute.js              # /api/user endpoints
    ├── services/                     # Standalone business & integration services
    │   ├── AIService.js              # Gemini API prompt formatting & response streaming
    │   ├── EmailService.js           # Nodemailer SMTP & OTP email delivery
    │   └── MediaService.js           # Media upload & Cloudinary asset management
    ├── uploads/                      # Local uploaded media directory (static serving)
    ├── App.js                        # Express application configuration & middleware mount
    ├── server.js                     # HTTP server bootstrapper & DB connection trigger
    ├── .env                          # Backend secrets (Mongo, JWT, Stripe, Gemini, Email, Cloudinary)
    └── package.json
```

---

# 🔐 Authentication & Security

The platform combines **JWT token-based authentication** with **Email OTP verification**:

```text
User Registration / Forgot Password
                 ↓
      OTP generated & saved with TTL
                 ↓
Nodemailer sends 6-digit OTP to user's email
                 ↓
      User submits OTP verification
                 ↓
Password hashed using bcrypt & user stored
                 ↓
          JWT token issued
                 ↓
Stored in client localStorage & attached via Authorization header
                 ↓
    Verified by auth.js middleware for protected routes
```

---

# 🛒 Cart, Portions & Checkout Flow

```text
Browse Food Catalog
        ↓
Select Portion Size (Small / Medium / Large)
        ↓
Add Items (reflected in Navbar & Floating Cart Bar)
        ↓
Review Cart (Apply "new_user" first-order promo)
        ↓
Select Saved Address or Enter New Delivery Details
        ↓
Stripe Checkout Session Created
        ↓
Customer Completes Payment
        ↓
Verify Redirect (/verify?success=true&orderId=...)
        ↓
Order Confirmed & Sent to Admin Dashboard
        ↓
Track Status in "My Orders" or "Profile > Orders"
```

---

# 🔌 REST API Specification

### 👤 User & Profile Endpoints (`/api/user`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | :---: |
| `POST` | `/api/user/register` | Register a new user | No |
| `POST` | `/api/user/login` | Login and receive JWT | No |
| `POST` | `/api/user/send-otp` | Request a 6-digit registration OTP | No |
| `POST` | `/api/user/verify-otp` | Verify registration OTP code | No |
| `POST` | `/api/user/forgot-password-otp`| Request password reset OTP | No |
| `POST` | `/api/user/reset-password-otp` | Reset password using verified OTP | No |
| `GET` | `/api/user/profile` | Retrieve authenticated user profile | **Yes** |
| `POST` | `/api/user/profile` | Update personal information (name, phone, DOB) | **Yes** |
| `POST` | `/api/user/address` | Add a new delivery address | **Yes** |
| `PUT` | `/api/user/address` | Edit an existing delivery address | **Yes** |
| `DELETE` | `/api/user/address` | Delete a delivery address | **Yes** |
| `PUT` | `/api/user/address/default` | Set an address as default | **Yes** |
| `POST` | `/api/user/preferences` | Update dietary, allergy & notification preferences | **Yes** |
| `POST` | `/api/user/change-password` | Update password with current password verification | **Yes** |
| `POST` | `/api/user/delete-account` | Permanently delete user account and data | **Yes** |
| `POST` | `/api/user/upload-avatar` | Upload profile photo (Cloudinary / buffer) | **Yes** |
| `POST` | `/api/user/delete-avatar` | Remove profile photo and reset to initials avatar | **Yes** |

### 👨‍💼 Admin Management Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | :---: |
| `GET` | `/api/admin/profile` | Fetch manager profile & restaurant operational details | No |
| `POST` | `/api/admin/profile` | Update manager details & restaurant configuration | No |
| `POST` | `/api/admin/upload-avatar` | Upload admin profile picture | No |
| `POST` | `/api/admin/delete-avatar` | Delete admin profile picture | No |
| `POST` | `/api/admin/security` | Update admin passcode with validation | No |

### 🍔 Food Catalog Endpoints (`/api/food`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | :---: |
| `POST` | `/api/food/add` | Add a new food item with image upload | No |
| `GET` | `/api/food/list` | Retrieve list of all available food items | No |
| `POST` | `/api/food/remove` | Delete a food item by ID | No |

### 🛒 Cart Endpoints (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | :---: |
| `POST` | `/api/cart/add` | Add or increment item in user cart | **Yes** |
| `POST` | `/api/cart/remove` | Decrement or remove item from user cart | **Yes** |
| `POST` | `/api/cart/get` | Retrieve the authenticated user's cart | **Yes** |

### 📦 Order Endpoints (`/api/order`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | :---: |
| `POST` | `/api/order/place` | Place order and create Stripe checkout session | **Yes** |
| `POST` | `/api/order/verify` | Verify Stripe payment success and confirm order | No |
| `POST` | `/api/order/userorders` | Retrieve authenticated customer's orders | **Yes** |
| `POST` | `/api/order/user-delete` | Delete delivered order from customer history | **Yes** |
| `GET` | `/api/order/list` | Retrieve all customer orders for admin panel | No |
| `POST` | `/api/order/status` | Update fulfillment status (*Processing* / *Delivered*) | No |
| `POST` | `/api/order/remove` | Permanently remove order record (Admin) | No |

### 🤖 AI Culinary Assistant Endpoints (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | :---: |
| `POST` | `/api/ai/chat` | Send conversational culinary query to Gemini AI | No |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

```env
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Google Gemini AI Integration
GEMINI_API_KEY=your_google_gemini_api_key

# Nodemailer SMTP Email Credentials (for OTP & Notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Storage (for Avatars & Food Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18.0 or newer recommended)
* **MongoDB** (Atlas cluster or local instance)
* **Stripe Account** (Test API keys)
* **Google Gemini API Key** (Google AI Studio)
* **Gmail App Password** (for Nodemailer SMTP OTP)
* **Cloudinary Account** (for cloud image storage)

### 1. Clone the Repository

```bash
git clone https://github.com/lets-smile124/Food-Delevery.git
cd Food-Delevery
```

### 2. Setup and Run Backend

```bash
cd backend
npm install
# Ensure .env is populated with credentials
npm run server
```

The backend server starts on `http://localhost:4000`.

### 3. Setup and Run Frontend (Customer App)

```bash
cd ../frontend
npm install
npm run dev
```

The customer application starts on `http://localhost:5173`.

### 4. Setup and Run Admin Dashboard

```bash
cd ../admin
npm install
npm run dev
```

The admin dashboard starts on `http://localhost:5174`.

---

## 🔒 Security Practices

* **Zero Plain-Text Passwords** — Hashed using bcryptjs with salt rounds.
* **JWT Protected Endpoints** — Strict authorization middleware extracting user identity from tokens.
* **OTP Rate-Limiting & Expiry** — MongoDB OTP collection with TTL auto-expiration.
* **Server-Side Payment Verification** — Stripe webhook/redirection validation preventing unauthorized order placement.
* **First-Time Promo Verification** — Verified directly in MongoDB against customer order records before applying discounts.
* **Data Privacy** — Sensitive credentials strictly encapsulated in `.env` and excluded via `.gitignore`.

---

## 📄 License

This project is licensed under the **MIT License**.

---

**Made with ❤️ and modern MERN architecture.**
