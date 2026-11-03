import mongoose from "mongoose";

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB Atlas using Mongoose
   */
  async connect() {
    if (this.isConnected) {
      console.log("Database already connected");
      return this.connection;
    }

    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      this.isConnected = true;
      console.log("db connected");
      return this.connection;
    } catch (error) {
      console.log("Database connection failed:", error.message);
      this.isConnected = false;
    }
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState
    };
  }
}

// Singleton instance
const database = new Database();

export const connectDB = () => database.connect();
export default database;
