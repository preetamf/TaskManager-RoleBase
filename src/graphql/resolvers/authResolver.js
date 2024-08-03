const {
  register,
  login,
  logout,
  refreshToken,
} = require("../../controllers/authControllers/authController");

const authResolvers = {
  Mutation: {
    register: register,

    login: login,

    logout: logout,

    refreshToken: refreshToken,
  },
};

module.exports = authResolvers;
