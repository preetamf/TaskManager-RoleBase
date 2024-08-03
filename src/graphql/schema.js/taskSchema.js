const { gql } = require("apollo-server-express");

const taskSchema = gql`
  type StatusHistory {
    status: String
    timestamp: String
  }

  type Status {
    current: String
    history: [StatusHistory]
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

  extend type Mutation {
    createTask(
      title: String!
      description: String
      status: String
      assignedUsers: [ID]
      subtasks: [ID]
      dependencies: [ID]
    ): Task
    updateTask(
      id: ID!
      title: String
      description: String
      status: String
      assignedUsers: [ID]
      subtasks: [ID]
      dependencies: [ID]
    ): Task
    deleteTask(id: ID!): Boolean
    assignUsersToTask(taskId: ID!, userIds: [ID]!): Task
    updateTaskStatus(taskId: ID!, status: String!): Task
    addTaskDependencies(taskId: ID!, dependencyIds: [ID]!): Task
  }
`;

module.exports = taskSchema;
