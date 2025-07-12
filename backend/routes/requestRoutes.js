const express = require('express');
const router = express.Router();
// backend/routes/requestRoutes.js
// backend/routes/requestRoutes.js

// 




const {
  createRequest,
  getAllRequests,
  updateRequestStatus,
  getMyRequests,
  getApprovedItemRequests,
  markItemAsIssued,
  markItemAsReturned,
  getIssuedItemRequests,
  getReturnedItemRequests,
} = require('../controllers/requestController');

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Lecturer creates a request (item/document)
router.post('/', protect, authorizeRoles('lecturer'), createRequest);

// Lecturer views own requests
router.get('/my', protect, authorizeRoles('lecturer'), getMyRequests);

// Admin views all requests
router.get('/', protect, authorizeRoles('admin'), getAllRequests);

// Admin approves or declines a request
router.put('/:id/status', protect, authorizeRoles('admin'), updateRequestStatus);

// Storekeeper views approved item requests
router.get('/storekeeper/approved-items', protect, authorizeRoles('storekeeper'), getApprovedItemRequests);

// Storekeeper marks item as issued
router.put('/:id/issue', protect, authorizeRoles('storekeeper'), markItemAsIssued);

// Storekeeper marks item as returned
router.put('/:id/return', protect, authorizeRoles('storekeeper'), markItemAsReturned);


router.get(
  '/storekeeper/issued-items',
  protect,
  authorizeRoles('storekeeper'),
  getIssuedItemRequests
);
router.get('/storekeeper/returned-items', protect, authorizeRoles('storekeeper'), getReturnedItemRequests);



module.exports = router;
