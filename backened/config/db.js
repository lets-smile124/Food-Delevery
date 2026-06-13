import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://AnkitaStack:Ankita500524@cluster0.a3uc66a.mongodb.net/food-delivery",
    )
    .then(() => console.log("db connected"));
};
