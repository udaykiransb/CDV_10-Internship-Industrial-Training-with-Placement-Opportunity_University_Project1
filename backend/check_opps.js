const mongoose = require('mongoose');
require('dotenv').config();

async function checkOpps() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Opportunity = mongoose.model('Opportunity', new mongoose.Schema({}, { strict: false }));
        const opps = await Opportunity.find({}).lean();
        
        console.log('Total Opportunities:', opps.length);
        opps.forEach(o => {
            console.log(`Opp: "${o.title}", Type: "${o.type}", Active: ${o.isActive}`);
        });
        
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkOpps();
