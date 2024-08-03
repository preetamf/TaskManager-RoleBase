const dotenv = require('dotenv');
dotenv.config({ path: './.env' }); // Load environment variables from .env file

const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./config/appLogger'); // Import the already created logger

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      logger.info(`⚙️ Server is running at http://localhost:${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    logger.error('MONGO db connection failed !!!', err);
  });
