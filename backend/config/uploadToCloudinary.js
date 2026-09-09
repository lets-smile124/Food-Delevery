import cloudinary from "./cloudinary.js";
import { Readable } from "stream";

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "food-delivery"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

export default uploadToCloudinary;