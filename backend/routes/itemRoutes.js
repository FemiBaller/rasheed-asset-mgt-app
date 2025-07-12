const express = require('express');
const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Public for viewing (requires login)
router.get('/', protect, getItems);
router.get('/:id', protect, getItemById);

// Admin or Storekeeper only
router.post('/', protect, authorizeRoles('admin', 'storekeeper'), createItem);
router.put('/:id', protect, authorizeRoles('admin', 'storekeeper'), updateItem);
router.delete('/:id', protect, authorizeRoles('admin', 'storekeeper'), deleteItem);

module.exports = router;
