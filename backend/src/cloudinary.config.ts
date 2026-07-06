import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const cloudinaryResumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
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

export const cloudinaryAvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'job_portal_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});
