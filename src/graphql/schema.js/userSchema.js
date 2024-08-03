const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type StatusHistory {
    status: String
    timestamp: String
  }

  type Status {
    current: String
    history: [StatusHistory]
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    assignedTasks: [Task]
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: Status!
    assignedUsers: [User]
    subtasks: [Task]
    dependencies: [Task]
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    email: String!
    accessToken: String!
    refreshToken : String!
  }

  type Query {
    fetchTasks(status: String, assignee: ID, dueDate: String): [Task]
    fetchTaskDetails(id: ID!): Task
    fetchUsers(role: String): [User]
    fetchUserDetails(id: ID!): User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!, role: String): User
    login(email: String!, password: String!): AuthPayload
    logout(userId: ID!): Boolean
    refreshToken(token: String!): AuthPayload

    createTask(title: String!, description: String, status: String, assignedUsers: [ID], subtasks: [ID], dependencies: [ID]): Task
    updateTask(id: ID!, title: String, description: String, status: String, assignedUsers: [ID], subtasks: [ID], dependencies: [ID]): Task
    deleteTask(id: ID!): Boolean
    assignUsersToTask(taskId: ID!, userIds: [ID]!): Task
    updateTaskStatus(taskId: ID!, status: String!): Task
    addTaskDependencies(taskId: ID!, dependencyIds: [ID]!): Task
  }
`;

module.exports = typeDefs;
