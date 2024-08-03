const { mergeTypeDefs } = require('@graphql-tools/merge');

const userSchema = require('./userSchema');
const taskSchema = require('./taskSchema');

const typeDefs = mergeTypeDefs([userSchema, taskSchema]);

module.exports = typeDefs;
