const Item = require('../models/item');

// @desc    Create a new item
// @route   POST /api/items
// @access  Admin or Storekeeper
const createItem = async (req, res) => {
  try {
    const { name, description, quantity, department } = req.body;

    const item = await Item.create({
      name,
      description,
      quantity,
      department,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create item', error: err.message });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Admin, Storekeeper, Lecturer
const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Admin, Storekeeper, Lecturer
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch item', error: err.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Admin or Storekeeper
const updateItem = async (req, res) => {
  try {
    const { name, description, quantity, department } = req.body;

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, quantity, department },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Item not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Admin or Storekeeper
const deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
