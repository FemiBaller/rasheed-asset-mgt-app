





const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔍 DEBUG: Check what role is actually in the database
    console.log('User role from DB:', user.role);
    console.log('User name:', user.name);
    console.log('User email:', user.email);

    // Attach user object with role
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ✅ this is critical for role-based checks
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;







// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     // Attach user object with role
//     req.user = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role, // ✅ this is critical for role-based checks
//     };

//     next();
//   } catch (error) {
//     console.error('Token verification failed:', error.message);
//     res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// };

// module.exports = protect;
