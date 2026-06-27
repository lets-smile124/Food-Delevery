# 🍔 Tomato — Full Stack Food Delivery App

A complete food ordering and delivery platform built with the MERN stack and Stripe payment integration. Users can browse food items, add to cart, place orders, and pay securely online — while admins can manage and track all orders from a dedicated panel.

---

## 🚀 Live Features

- 🛒 **Add to Cart & Place Orders** — Browse food items, manage your cart, and checkout seamlessly
- 💳 **Stripe Payment Gateway** — Secure online payments in INR with real-time verification
- 📦 **Order Tracking** — Users can view their order history and live status
- 🔐 **JWT Authentication** — Secure login and signup with token-based auth
- 👨‍💼 **Admin Panel** — Full order management dashboard for admins to list and update orders
- 📬 **Delivery Address Capture** — Full address form saved with every order

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router DOM, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Payments | Stripe Checkout |
| Auth | JWT Tokens |
| HTTP Client | Axios |
| Notifications | React Toastify |

---

## 📁 Project Structure

```
tomato/
├── frontend/          # React user-facing app
│   ├── src/
│   │   ├── components/    # Navbar, Footer, LoginPopup
│   │   ├── pages/         # Home, Cart, PlaceOrder, MyOrders, Verify
│   │   └── context/       # StoreContext (cart, token, food list)
│
├── admin/             # React admin dashboard
│   ├── src/
│   │   └── pages/
│   │       └── Orders/    # View and manage all orders
│
└── backend/           # Express REST API
    ├── models/        # User, Order, Food schemas
    ├── routes/        # Auth, Order, Food routes
    └── controllers/  # Business logic
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Stripe account

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tomato.git
cd tomato
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

```bash
npm run server
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Setup Admin Panel

```bash
cd admin
npm install
npm run dev
```

---

## 🔌 API Endpoints

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/order/place` | Place a new order |
| POST | `/api/order/verify` | Verify Stripe payment |
| POST | `/api/order/userorders` | Get orders for logged-in user |
| GET | `/api/order/list` | Get all orders (admin) |
| POST | `/api/order/status` | Update order status (admin) |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | Login and receive JWT |

---

## 💡 Key Implementation Details

- Cart state is managed globally via **React Context API**
- On checkout, cart items are converted to Stripe `line_items` with INR pricing (paise conversion `× 100`)
- After payment, Stripe redirects to `/verify` which confirms or cancels the order
- JWT token is stored in `localStorage` and sent via request headers for protected routes
- Mongoose **strict mode** enforces schema — all address fields are explicitly defined

---

## 📸 Screenshots

> _Add your screenshots here_

| Home Page | Cart | Order Tracking |
|---|---|---|
| ![home]() | ![cart]() | ![orders]() |

---

## 🐛 Known Issues Fixed During Development

- Typo in function name (`fetchrders` → `fetchOrders`) causing silent failure
- `paument` field typo in Mongoose schema (corrected to `payment`)
- Stripe `unit_amount` incorrectly multiplied by 80 (USD→INR conversion removed since prices were already in INR)
- Route prop typo (`pathh` → `path`) in App.jsx causing no-match error
- Missing `address` field in old test orders (resolved by clearing DB and placing fresh orders)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">Made with ❤️ and a lot of debugging</p>
