const authResolvers = require('./authResolver');
const taskResolvers = require('./taskResolver');

const { mergeResolvers } = require('@graphql-tools/merge');

const resolvers = mergeResolvers([authResolvers, taskResolvers]);

module.exports = resolvers;
