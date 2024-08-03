const mongoose = require('mongoose');
const DB_NAME = require('../constants');
const logger = require('./appLogger'); 

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI , {
            autoIndex: true
        });
        logger.info(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("MONGODB connection FAILED ", error);
        throw err; // This should be caught in the calling code
        process.exit(1);
    }
};
module.exports = connectDB;


