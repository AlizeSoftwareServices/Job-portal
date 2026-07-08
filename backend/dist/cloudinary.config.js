"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryAvatarStorage = exports.cloudinaryResumeStorage = exports.configureCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const configureCloudinary = () => {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};
exports.configureCloudinary = configureCloudinary;
exports.cloudinaryResumeStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'job_portal_resumes',
            allowed_formats: ['pdf', 'docx', 'doc'],
            resource_type: isPdf ? 'image' : 'raw',
            transformation: isPdf ? [{ quality: 'auto' }] : [],
        };
    },
});
exports.cloudinaryAvatarStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'job_portal_avatars',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});
//# sourceMappingURL=cloudinary.config.js.map