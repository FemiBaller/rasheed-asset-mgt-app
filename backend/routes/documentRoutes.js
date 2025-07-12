const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  uploadDocument, 
  getAllDocuments, 
  downloadDocument,
  getDocumentById,
  deleteDocument,
  updateDocument,
  getDocumentStats,
  bulkDeleteDocuments
} = require('../controllers/documentController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double-check the directory exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const fileName = file.originalname.replace(fileExt, '') + '-' + uniqueSuffix + fileExt;
    cb(null, fileName);
  },
});

// Add file filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, and PowerPoint files are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
// Upload route (Admin only)
router.post('/upload', protect, authorizeRoles('admin'), upload.single('file'), uploadDocument);

// Get all documents (lecturers, admin, storekeeper can view)
router.get('/', protect, authorizeRoles('lecturer', 'admin', 'storekeeper'), getAllDocuments);

// Get single document details
router.get('/:id', protect, authorizeRoles('lecturer', 'admin', 'storekeeper'), getDocumentById);

// Download document (lecturers and admin can download)
router.get('/:id/download', protect, authorizeRoles('lecturer', 'admin'), downloadDocument);

// Admin only routes
router.put('/:id', protect, authorizeRoles('admin'), updateDocument);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDocument);
router.post('/bulk-delete', protect, authorizeRoles('admin'), bulkDeleteDocuments);
router.get('/admin/stats', protect, authorizeRoles('admin'), getDocumentStats);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Invalid file type. Only PDF, Word, Excel, PowerPoint, text, and image files are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const { uploadDocument, getAllDocuments, downloadDocument } = require('../controllers/documentController');
// const protect = require('../middleware/authMiddleware');
// const authorizeRoles = require('../middleware/roleMiddleware');

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });

// // Routes
// router.post('/upload', protect, authorizeRoles('admin'), upload.single('file'), uploadDocument);
// router.get('/', protect, authorizeRoles('lecturer', 'admin', 'storekeeper'), getAllDocuments);
// router.get('/:id/download', protect, authorizeRoles('lecturer', 'admin'), downloadDocument);

// module.exports = router;
