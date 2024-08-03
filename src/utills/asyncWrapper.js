const logger = require("../config/appLogger");

//this wrapper is only work for Graphql
const asyncWrapper = (resolver) => {
  return async (parent, args, context, info) => {
    try {
      return await resolver(parent, args, context, info);
    } catch (error) {
      logger.error("asyncWrapper - error - catch:", error.message);
      throw new Error(error.message);
    }
  };
};

module.exports = asyncWrapper;
