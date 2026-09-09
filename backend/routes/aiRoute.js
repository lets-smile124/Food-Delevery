import express from "express";
import { aiChat } from "../controlers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", aiChat);

export default aiRouter;