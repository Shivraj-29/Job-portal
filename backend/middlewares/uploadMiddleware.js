const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (file.mimetype === 'application/pdf') {
      return {
        folder: 'job-board',
        resource_type: 'raw',
        public_id: `resume-${Date.now()}`, // Cloudinary handles extension for raw if we append it? NO, we must append it for raw.
        public_id: `resume-${Date.now()}.pdf`,
        format: undefined, // ensure no format transformation attempts
      };
    }
    return {
      folder: 'job-board',
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

// File filter (Optional, as allowed_formats in storage handles this, but good for custom error messages)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png, and .pdf formats are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;