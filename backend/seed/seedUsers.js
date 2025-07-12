const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
  try {
    await User.deleteMany();

    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    const storekeeper = new User({
      name: 'Store Keeper',
      email: 'store@example.com',
      password: 'store123',
      role: 'storekeeper',
    });

    await admin.save();
    await storekeeper.save();

    console.log('Admin and Storekeeper created!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
