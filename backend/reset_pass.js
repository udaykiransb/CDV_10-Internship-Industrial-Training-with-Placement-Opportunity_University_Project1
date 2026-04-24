const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/modules/auth/auth.model');
const dotenv = require('dotenv');
dotenv.config();

async function reset() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ipportal');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const user = await User.findOneAndUpdate({ email: 'dean@gmail.com' }, { password: hashedPassword }, { new: true });
    if (user) {
        console.log(`Reset password for ${user.email}`);
    } else {
        console.log('User not found');
    }
    process.exit(0);
}

reset();
