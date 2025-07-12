// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter (using Gmail as example - adjust for your email provider)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your app password
  }
});

// Email templates
const emailTemplates = {
  // Email to admin when lecturer makes a request
  adminNotification: (lecturerName, lecturerEmail, itemName, quantity, requestId) => ({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL, // Admin's email
    subject: `New Item Request from ${lecturerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Item Request</h2>
        <p>A new item request has been submitted:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Lecturer:</strong> ${lecturerName}</p>
          <p><strong>Email:</strong> ${lecturerEmail}</p>
          <p><strong>Item:</strong> ${itemName}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>
        
        <p>Please review and take action on this request.</p>
        <p><a href="${process.env.FRONTEND_URL}/admin/requests" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Requests</a></p>
      </div>
    `
  }),

  // Email to lecturer when request is approved
  requestApproved: (lecturerName, lecturerEmail, itemName, quantity, requestId) => ({
    from: process.env.EMAIL_USER,
    to: lecturerEmail,
    subject: `Request Approved - ${itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Request Approved ✅</h2>
        <p>Hello ${lecturerName},</p>
        <p>Your item request has been approved!</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Item:</strong> ${itemName}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Status:</strong> Approved</p>
        </div>
        
        <p>You can now collect your item from the storekeeper.</p>
        <p><a href="${process.env.FRONTEND_URL}/lecturer/requests" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Requests</a></p>
      </div>
    `
  }),

  // Email to lecturer when request is declined
  requestDeclined: (lecturerName, lecturerEmail, itemName, quantity, requestId, reason = '') => ({
    from: process.env.EMAIL_USER,
    to: lecturerEmail,
    subject: `Request Declined - ${itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Request Declined ❌</h2>
        <p>Hello ${lecturerName},</p>
        <p>Unfortunately, your item request has been declined.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Item:</strong> ${itemName}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Status:</strong> Declined</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p>If you have any questions, please contact the administrator.</p>
        <p><a href="${process.env.FRONTEND_URL}/lecturer/requests" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Requests</a></p>
      </div>
    `
  })
};

// Function to send emails
const sendEmail = async (emailOptions) => {
  try {
    const info = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Main email functions
const emailService = {
  // Send notification to admin when lecturer makes a request
  notifyAdminOfNewRequest: async (lecturerName, lecturerEmail, itemName, quantity, requestId) => {
    const emailOptions = emailTemplates.adminNotification(lecturerName, lecturerEmail, itemName, quantity, requestId);
    return await sendEmail(emailOptions);
  },

  // Send notification to lecturer when request is approved
  notifyLecturerRequestApproved: async (lecturerName, lecturerEmail, itemName, quantity, requestId) => {
    const emailOptions = emailTemplates.requestApproved(lecturerName, lecturerEmail, itemName, quantity, requestId);
    return await sendEmail(emailOptions);
  },

  // Send notification to lecturer when request is declined
  notifyLecturerRequestDeclined: async (lecturerName, lecturerEmail, itemName, quantity, requestId, reason) => {
    const emailOptions = emailTemplates.requestDeclined(lecturerName, lecturerEmail, itemName, quantity, requestId, reason);
    return await sendEmail(emailOptions);
  }
};

module.exports = emailService;