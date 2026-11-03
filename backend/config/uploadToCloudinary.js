import mediaService from "../services/MediaService.js";

/**
 * Upload image buffer to Cloudinary (OOP Service Adapter)
 */
const uploadToCloudinary = (buffer) => {
    return mediaService.uploadFromBuffer(buffer);
};

export default uploadToCloudinary;
