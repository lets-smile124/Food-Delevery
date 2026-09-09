import express from "express";
import { addFood, listFood, removeFood } from "../controlers/foodControlers.js";
import multer from "multer";

const foodRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

foodRouter.post("/add", upload.single("image"), addFood);

foodRouter.get("/list", listFood);

foodRouter.post("/remove", removeFood);

export default foodRouter;