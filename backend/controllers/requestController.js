const Request = require('../models/request');
const Item = require('../models/item');
const Document = require('../models/exclusiveDocument');
const User = require('../models/user'); // Add this import for lecturer details
const emailService = require('../utils/emailService'); // Add this import

// Lecturer submits a new request
const createRequest = async (req, res) => {
  try {
    const { type, itemOrDocument, quantityRequested, duration } = req.body;

    console.log('🔍 req.user:', req.user);

    const lecturerId = req.user._id || req.user.id;

    if (!req.user || !lecturerId) {
      return res.status(401).json({ message: 'Unauthorized: No lecturer found on request.' });
    }

    if (!['Item', 'ExclusiveDocument'].includes(type)) {
      return res.status(400).json({ message: 'Invalid request type.' });
    }

    if (!itemOrDocument) {
      return res.status(400).json({ message: `${type} ID is required for a ${type.toLowerCase()} request.` });
    }

    if (!duration) {
      return res.status(400).json({ message: 'Duration is required.' });
    }

    const qty = Number(quantityRequested) || 1;
    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const newRequestData = {
      type,
      lecturer: lecturerId,
      quantityRequested: qty,
      duration,
      itemOrDocument,
    };

    const newRequest = await Request.create(newRequestData);

    // 🔥 NEW: Send email notification to admin
    try {
      // Get lecturer details
      const lecturer = await User.findById(lecturerId);
      
      // Get item/document details
      let itemName = '';
      if (type === 'Item') {
        const item = await Item.findById(itemOrDocument);
        itemName = item ? item.name : 'Unknown Item';
      } else if (type === 'ExclusiveDocument') {
        const doc = await Document.findById(itemOrDocument);
        itemName = doc ? doc.title : 'Unknown Document';
      }

      // Send email to admin
      const emailResult = await emailService.notifyAdminOfNewRequest(
        lecturer.name,
        lecturer.email,
        itemName,
        qty,
        newRequest._id
      );

      if (!emailResult.success) {
        console.warn('⚠️ Failed to send admin notification email:', emailResult.error);
      } else {
        console.log('✅ Admin notification email sent successfully');
      }

    } catch (emailError) {
      console.error('❌ Error sending admin notification email:', emailError);
      // Don't fail the request creation if email fails
    }

    res.status(201).json({
      ...newRequest.toObject(),
      emailSent: true // You can track this if needed
    });

  } catch (err) {
    console.error('❌ Error in createRequest:', err.stack);
    res.status(500).json({ message: 'Error creating request', error: err.message });
  }
};

// Admin views all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('itemOrDocument')
      .populate('lecturer', 'name email');

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err.message });
  }
};

// Admin approves or declines a request
const updateRequestStatus = async (req, res) => {
  try {
    const { status, reason } = req.body; // Add reason for decline
    const request = await Request.findById(req.params.id)
      .populate('itemOrDocument')
      .populate('lecturer', 'name email');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Update request status
    request.status = status;
    if (reason) request.declineReason = reason; // Store decline reason if provided
    await request.save();

    // 🔥 NEW: Send email notification to lecturer
    try {
      // Get item/document name
      let itemName = '';
      if (request.type === 'Item') {
        itemName = request.itemOrDocument ? request.itemOrDocument.name : 'Unknown Item';
      } else if (request.type === 'ExclusiveDocument') {
        itemName = request.itemOrDocument ? request.itemOrDocument.title : 'Unknown Document';
      }

      // Send appropriate email based on status
      let emailResult;
      if (status === 'approved') {
        emailResult = await emailService.notifyLecturerRequestApproved(
          request.lecturer.name,
          request.lecturer.email,
          itemName,
          request.quantityRequested,
          request._id
        );
      } else if (status === 'declined') {
        emailResult = await emailService.notifyLecturerRequestDeclined(
          request.lecturer.name,
          request.lecturer.email,
          itemName,
          request.quantityRequested,
          request._id,
          reason
        );
      }

      if (emailResult && !emailResult.success) {
        console.warn('⚠️ Failed to send lecturer notification email:', emailResult.error);
      } else if (emailResult) {
        console.log(`✅ Lecturer notification email sent successfully (${status})`);
      }

    } catch (emailError) {
      console.error('❌ Error sending lecturer notification email:', emailError);
      // Don't fail the status update if email fails
    }

    res.status(200).json({ 
      message: `Request ${status}`,
      emailSent: true // You can track this
    });

  } catch (err) {
    res.status(500).json({ message: 'Error updating request', error: err.message });
  }
};

// Lecturer views their own requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ lecturer: req.user._id || req.user.id })
      .populate('itemOrDocument'); // use the correct field name

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your requests', error: err.message });
  }
};

const getReturnedItemRequests = async (req, res) => {
  try {
    const requests = await Request.find({ 
      type: 'Item',
      status: 'returned',
      returnedByStoreKeeper: true
    })
      .populate('itemOrDocument')
      .populate('lecturer', 'name email');

    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching returned item requests:', err);
    res.status(500).json({ message: 'Error fetching returned item requests' });
  }
};

// Storekeeper views approved item requests
const getApprovedItemRequests = async (req, res) => {
  try {
    const requests = await Request.find({ 
        type: 'Item', 
        status: 'approved', 
        issuedByStoreKeeper: false 
      })
      .populate('itemOrDocument') // ✅ Fix: use dynamic ref field
      .populate('lecturer', 'name email');

    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching approved item requests:', err.stack); // Better debug
    res.status(500).json({ message: 'Error fetching item requests', error: err.message });
  }
};

// Storekeeper issues item to lecturer
const markItemAsIssued = async (req, res) => {
  try {
    console.log("➡️ Marking item as issued for request ID:", req.params.id);

    const request = await Request.findById(req.params.id).populate('itemOrDocument');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved requests can be marked as issued' });
    }

    if (!request.itemOrDocument) {
      return res.status(400).json({ message: 'Associated item not found' });
    }

    if (request.itemOrDocument.quantity < request.quantityRequested) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Decrease available quantity
    request.itemOrDocument.quantity -= request.quantityRequested;
    await request.itemOrDocument.save();

    // Mark the request as issued
    request.status = 'issued';
    request.issuedByStoreKeeper = true;
    await request.save();

    res.status(200).json({ message: 'Item marked as issued successfully' });

  } catch (err) {
    console.error('❌ Error in markItemAsIssued:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all approved items that have been issued 
const getIssuedItemRequests = async (req, res) => {
  try {
    const requests = await Request.find({ 
        type: 'Item',   
        status: 'issued', 
        issuedByStoreKeeper: true 
      })
      .populate('itemOrDocument') // This should resolve to the actual item
      .populate('lecturer', 'name email');

    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching issued item requests:', err.stack);
    res.status(500).json({ message: 'Error fetching issued item requests', error: err.message });
  }
};

// Storekeeper marks item as returned
const markItemAsReturned = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('itemOrDocument');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'issued') {
      return res.status(400).json({ message: 'Only issued items can be marked as returned' });
    }

    if (!request.itemOrDocument) {
      return res.status(400).json({ message: 'Associated item not found' });
    }

    // Increase available quantity
    request.itemOrDocument.quantity += request.quantityRequested;
    await request.itemOrDocument.save();

    // Update request status and mark as returned by storekeeper
    request.status = 'returned';
    request.returnedByStoreKeeper = true;
    await request.save();

    res.status(200).json({ message: 'Item marked as returned successfully' });
  } catch (err) {
    console.error('❌ Error in markItemAsReturned:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  updateRequestStatus,
  getMyRequests,
  getApprovedItemRequests,
  markItemAsIssued,
  markItemAsReturned,
  getIssuedItemRequests,
  getReturnedItemRequests
};