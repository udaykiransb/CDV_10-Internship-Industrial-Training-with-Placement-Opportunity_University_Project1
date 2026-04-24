const mongoose = require('mongoose');
const Opportunity = require('../modules/opportunity/opportunity.model');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const opportunities = await Opportunity.find({});
        console.log(`Found ${opportunities.length} opportunities to migrate.`);

        for (const opp of opportunities) {
            const updates = {};
            
            // Normalize type
            if (opp.type && opp.type.toUpperCase() === 'INTERNSHIP') {
                updates.type = 'INTERNSHIP';
            } else if (opp.type && opp.type.toUpperCase() === 'PLACEMENT') {
                updates.type = 'PLACEMENT';
            }

            // Set default visibility
            if (!opp.visibility) {
                updates.visibility = 'campus';
            }

            // Set default minMatchPercentage
            if (opp.minMatchPercentage === undefined) {
                updates.minMatchPercentage = 0;
            }

            if (Object.keys(updates).length > 0) {
                await Opportunity.findByIdAndUpdate(opp._id, { $set: updates });
                console.log(`Migrated: ${opp.title}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
