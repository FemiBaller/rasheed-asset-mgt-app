const ExclusiveDocument = require('../models/ExclusiveDocument');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

exports.uploadDocument = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadsDir = 'uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const document = await ExclusiveDocument.create({
      title,
      description,
      fileUrl: req.file.path,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (err) {
    console.error('Upload error:', err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Upload failed', 
      error: err.message 
    });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await ExclusiveDocument.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error('Fetch documents error:', err);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await ExclusiveDocument.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ message: 'Error fetching document' });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    // Handle token from query params (for direct download links)
    let token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const doc = await ExclusiveDocument.findById(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.resolve(doc.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Increment download count
    await ExclusiveDocument.findByIdAndUpdate(req.params.id, { 
      $inc: { downloadCount: 1 } 
    });

    // Get file info
    const fileName = path.basename(doc.fileUrl);
    const fileExt = path.extname(fileName).toLowerCase();
    
    // Set proper content type based on file extension
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };

    const contentType = contentTypes[fileExt] || 'application/octet-stream';
    
    // Set headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.title}${fileExt}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error reading file' });
      }
    });

  } catch (err) {
    console.error('Download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Download failed', 
        error: err.message 
      });
    }
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const document = await ExclusiveDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update document
    const updatedDocument = await ExclusiveDocument.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (err) {
    console.error('Update document error:', err);
    res.status(500).json({ message: 'Error updating document' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await ExclusiveDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Delete the file from filesystem
    if (document.fileUrl && fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }

    // Delete from database
    await ExclusiveDocument.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting document',
      error: err.message 
    });
  }
};

exports.bulkDeleteDocuments = async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide valid document IDs' 
      });
    }

    // Get documents to delete their files
    const documents = await ExclusiveDocument.find({ _id: { $in: documentIds } });
    
    // Delete files from filesystem
    documents.forEach(doc => {
      if (doc.fileUrl && fs.existsSync(doc.fileUrl)) {
        fs.unlinkSync(doc.fileUrl);
      }
    });

    // Delete from database
    const result = await ExclusiveDocument.deleteMany({ _id: { $in: documentIds } });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} documents`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting documents',
      error: err.message 
    });
  }
};

exports.getDocumentStats = async (req, res) => {
  try {
    const totalDocuments = await ExclusiveDocument.countDocuments();
    const totalDownloads = await ExclusiveDocument.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: "$downloadCount" }
        }
      }
    ]);

    // Get documents by file type
    const documentsByType = await ExclusiveDocument.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $regexMatch: { input: "$fileUrl", regex: /\.pdf$/i } },
              then: "PDF",
              else: {
                $cond: {
                  if: { $regexMatch: { input: "$fileUrl", regex: /\.(doc|docx)$/i } },
                  then: "Word",
                  else: {
                    $cond: {
                      if: { $regexMatch: { input: "$fileUrl", regex: /\.(xls|xlsx)$/i } },
                      then: "Excel",
                      else: {
                        $cond: {
                          if: { $regexMatch: { input: "$fileUrl", regex: /\.(ppt|pptx)$/i } },
                          then: "PowerPoint",
                          else: "Other"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent uploads (last 7 days)
    const recentUploads = await ExclusiveDocument.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      stats: {
        totalDocuments,
        totalDownloads: totalDownloads[0]?.totalDownloads || 0,
        recentUploads,
        documentsByType
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics' 
    });
  }
};