const Task = require("../../models/task.model");
const User = require("../../models/user.modal");
const TaskHistory = require("../../models/taskHistory.model");
const asyncWrapper = require("../../utills/asyncWrapper");
const logger = require("../../config/appLogger");
const {
  createTaskSchema,
  updateTaskSchema,
} = require("../../validators/taskValidator");
const { authorizeRoles } = require("../../middlewares/authMiddleware");

// Helper function for logging History
const logTaskHistory = async (taskId, changes, changedBy) => {
  const historyEntry = {
    taskId,
    changes,
    changedBy,
  };

  await TaskHistory.create(historyEntry);
};

const fetchUsers = asyncWrapper(async (_, { role }, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - fetchUsers - start");
  authorizeRoles("admin")(user);

  const filters = {};
  if (role) filters.role = role;

  const users = await User.find(filters);
  logger.info("Graphql - Resolver - taskResolver - fetchUsers - end");
  return users;
});

const fetchUserDetails = asyncWrapper(async (_, { id }, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - fetchUserDetails - start");
  authorizeRoles("admin")(user);

  const userDetails = await User.findById(id);
  if (!userDetails) throw new Error("User not found");

  logger.info("Graphql - Resolver - taskResolver - fetchUserDetails - end");
  return userDetails;
})

const assignUsersToTask = asyncWrapper(async (_, { taskId, userIds }, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - assignUsersToTask - start");
  authorizeRoles("admin", "project-manager", "team-lead")(user);

  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  const assigningUser = await User.findById(user._id);
  const assigneeUsers = await User.find({ _id: { $in: userIds } });

  let validUserIds = [];

  if (assigningUser.role === "admin") {
    validUserIds = userIds;
  } else if (assigningUser.role === "project-manager") {
    validUserIds = assigneeUsers
      .filter(assignee => !["admin"].includes(assignee.role))
      .map(user => user._id.toString());
  } else if (assigningUser.role === "team-lead") {
    validUserIds = assigneeUsers
      .filter(assignee => ["team-member"].includes(assignee.role))
      .map(user => user._id.toString());
  } else {
    throw new Error("You do not have permission to assign tasks.");
  }

  if (validUserIds.length === 0) {
    throw new Error("No valid users to assign tasks to.");
  }

  const changes = [
    {
      field: "assignedUsers",
      oldValue: task.assignedUsers,
      newValue: validUserIds,
    },
  ];

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { assignedUsers: validUserIds },
    { new: true }
  ).populate("assignedUsers");

  await logTaskHistory(taskId, changes, user._id);

  logger.info("Graphql - Resolver - taskResolver - assignUsersToTask - end");
  return updatedTask;
})


module.exports = {
  fetchUsers,
  fetchUserDetails,
  assignUsersToTask,
};
