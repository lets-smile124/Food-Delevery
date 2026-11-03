import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables reliably from backend directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config(); // fallback

import App from "./App.js";

// Initialize and start application
const app = new App();
app.start();

export default app;
