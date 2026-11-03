import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import fs from "fs";

class MediaService {
  constructor(client = cloudinary) {
    this.cloudinary = client;
    this.defaultFolder = "food-delivery";
  }

  /**
   * Upload image buffer to Cloudinary
   * @param {Buffer} buffer - image buffer
   * @param {string} [folder] - destination folder
   * @returns {Promise<object>} upload result
   */
  uploadFromBuffer(buffer, folder = this.defaultFolder) {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder },
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
  }

  /**
   * Extract public ID from a Cloudinary URL
   * @param {string} url - Cloudinary image URL
   * @returns {string|null} public ID
   */
  extractPublicId(url) {
    try {
      const uploadPart = url.split("/upload/")[1];
      if (!uploadPart) return null;

      const parts = uploadPart.split("/");
      // Remove version prefix like v1788855094
      if (parts[0] && parts[0].startsWith("v")) {
        parts.shift();
      }

      let publicId = parts.join("/");
      // Strip file extension
      const lastDotIndex = publicId.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        publicId = publicId.substring(0, lastDotIndex);
      }
      return publicId;
    } catch {
      return null;
    }
  }

  /**
   * Delete an image from Cloudinary by its public ID
   * @param {string} publicId
   */
  async deleteByPublicId(publicId) {
    if (!publicId) return null;
    return await this.cloudinary.uploader.destroy(publicId);
  }

  /**
   * Delete food image either from Cloudinary or local disk fallback
   * @param {string} imagePathOrUrl
   */
  async deleteImage(imagePathOrUrl) {
    if (!imagePathOrUrl) return;

    if (imagePathOrUrl.startsWith("http")) {
      const publicId = this.extractPublicId(imagePathOrUrl);
      if (publicId) {
        await this.deleteByPublicId(publicId);
      }
    } else {
      // Local fallback in uploads directory
      fs.unlink(`uploads/${imagePathOrUrl}`, (error) => {
        if (error) {
          console.log("Local image deletion warning:", error.message);
        }
      });
    }
  }
}

const mediaService = new MediaService();
export default mediaService;
export { MediaService };

