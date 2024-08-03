require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema.js/schema");
const resolvers = require("./graphql/resolvers/resolver");
const logger = require('./config/appLogger')
const { authenticateJWT } = require('./middlewares/authMiddleware');
const rateLimit = require("express-rate-limit");

const app = express();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 1 minutes)
  message: "Too many requests from this IP, please try again after 1 minutes",
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${options.message}`);
    res.status(options.statusCode).send(options.message);
  },
});

// Apply the rate limit to all requests
app.use(apiLimiter);

// CORS setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", process.env.ALLOWED_METHODS);
  res.setHeader("Access-Control-Allow-Headers", process.env.ALLOWED_HEADERS);
  next();
});

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Initialize Apollo Server
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const operationName = req.body?.operationName || req.body?.query?.split('{')[1].split('(')[0].trim(); // Extract operation name
      try {
        authenticateJWT(req, operationName);
      } catch (error) {
        // Log the error and continue
        logger.warn("Authentication error: ", error);
      }
      return { user: req.user };
    },
  });
  await server.start();
  server.applyMiddleware({ app });
};

startApolloServer();

// Error handling middleware (ensure this is the last middleware)
app.use(errorHandler);

module.exports = app;
