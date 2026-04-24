const mongoose = require('mongoose');
const User = require('./src/modules/auth/auth.model');
const Faculty = require('./src/modules/faculty/faculty.model');
const dotenv = require('dotenv');
dotenv.config();

async function promote() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ipportal');
    const user = await User.findOneAndUpdate({ email: 'dean@gmail.com' }, { role: 'admin' }, { new: true });
    if (user) {
        console.log(`Promoted ${user.email} to ${user.role}`);
    } else {
        console.log('User not found');
    }
    process.exit(0);
}

promote();
