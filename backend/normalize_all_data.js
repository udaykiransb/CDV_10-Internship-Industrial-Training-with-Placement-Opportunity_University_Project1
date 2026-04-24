const mongoose = require('mongoose');
require('dotenv').config();

async function runMigration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('applications');

        console.log('Connected to MongoDB directly');

        // 1. Normalize Status to UPPERCASE
        const allApps = await collection.find({}).toArray();
        console.log(`Processing ${allApps.length} applications...`);

        for (const app of allApps) {
            const updates = {};
            
            if (app.status && typeof app.status === 'string') {
                const upperStatus = app.status.toUpperCase();
                if (app.status !== upperStatus) {
                    updates.status = upperStatus;
                }
            }

            if (!app.type || app.type === 'placement') {
                updates.type = 'Placement';
            } else if (app.type === 'internship') {
                updates.type = 'Internship';
            }

            if (Object.keys(updates).length > 0) {
                await collection.updateOne({ _id: app._id }, { $set: updates });
                console.log(`Updated ID: ${app._id}`, updates);
            }
        }

        console.log('Migration finished.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

runMigration();
