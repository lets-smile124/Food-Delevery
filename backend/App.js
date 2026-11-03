import express from "express";
import cors from "cors";
import database from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import aiRouter from "./routes/aiRoute.js";
import adminRouter from "./routes/adminRoute.js";

class App {
  constructor(port = process.env.PORT || 4000) {
    this.app = express();
    this.port = port;

    this.configureMiddleware();
    this.configureRoutes();
  }

  // Configure Express middlewares

  configureMiddleware() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use("/images", express.static("uploads"));
  }

  /**
   * Configure API endpoints & routes
   */
  configureRoutes() {
    this.app.use("/api/food", foodRouter);
    this.app.use("/api/user", userRouter);
    this.app.use("/api/cart", cartRouter);
    this.app.use("/api/order", orderRouter);
    this.app.use("/api/ai", aiRouter);
    this.app.use("/api/admin", adminRouter);

    // Root test endpoint
    this.app.get("/", (req, res) => {
      res.send("API working");
    });
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    await database.connect();
  }

  /**
   * Start server listener
   */
  async start() {
    await this.initializeDatabase();

    return this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`Server started on port ${this.port}`);
    });
  }

  /**
   * Getter for internal Express instance (useful for testing)
   */
  getExpressApp() {
    return this.app;
  }
}

export default App;

