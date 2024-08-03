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

const fetchTasks = asyncWrapper(
  async (_, { status, assignee, dueDate }, { user }) => {
    logger.info("Graphql - Resolver - taskResolver - fetchTasks - start");
    authorizeRoles(
      "admin",
      "project-manager",
      "team-lead",
      "team-member"
    )(user);

    const filters = {};
    if (status) filters["status.current"] = status;
    if (assignee) filters.assignedUsers = assignee;
    if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };

    const tasks = await Task.find(filters).populate(
      "assignedUsers subtasks dependencies"
    );
    logger.info("Graphql - Resolver - taskResolver - fetchTasks - end");
    return tasks;
  }
);

const fetchTaskDetails = asyncWrapper(async (_, { id }, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - fetchTaskDetails - start");
  authorizeRoles("admin", "project-manager", "team-lead", "team-member")(user);

  const task = await Task.findById(id).populate(
    "assignedUsers subtasks dependencies"
  );
  if (!task) throw new Error("Task not found");

  logger.info("Graphql - Resolver - taskResolver - fetchTaskDetails - end");
  return task;
});

const createTask = asyncWrapper(async (_, args, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - createTask - start");
  authorizeRoles("admin", "project-manager")(user);

  await createTaskSchema.validateAsync(args);

  const { title, description, status, assignedUsers, subtasks, dependencies } =
    args;
  const task = await Task.create({
    title,
    description,
    status: { current: status, history: [] },
    assignedUsers,
    subtasks,
    dependencies,
  });

  const changes = [{ field: "Task", newValue: task }];
  await logTaskHistory(task._id, changes, user._id);

  logger.info("Graphql - Resolver - taskResolver - createTask - end");
  return task.populate("assignedUsers subtasks dependencies");
});

const updateTask = asyncWrapper(async (_, args, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - updateTask - start");
  authorizeRoles("admin", "project-manager", "team-lead")(user);

  await updateTaskSchema.validateAsync(args);
  const {
    id,
    title,
    description,
    status,
    assignedUsers,
    subtasks,
    dependencies,
  } = args;
  const updates = {};
  const changes = [];

  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");

  if (title) {
    updates.title = title;
    changes.push({ field: "title", newValue: title });
  }
  if (description) {
    updates.description = description;
    changes.push({ field: "description", newValue: description });
  }
  if (status) {
    const previousStatus = task.status.current;
    updates["status.current"] = status;
    updates["status.history"] = [
      ...task.status.history,
      { status: previousStatus, timestamp: new Date() },
    ];
    changes.push({
      field: "status",
      oldValue: previousStatus,
      newValue: status,
    });
  }
  if (assignedUsers) {
    updates.assignedUsers = assignedUsers;
    changes.push({ field: "assignedUsers", newValue: assignedUsers });
  }
  if (subtasks) {
    updates.subtasks = subtasks;
    changes.push({ field: "subtasks", newValue: subtasks });
  }
  if (dependencies) {
    updates.dependencies = dependencies;
    changes.push({ field: "dependencies", newValue: dependencies });
  }

  const updatedTask = await Task.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate("assignedUsers subtasks dependencies");
  if (!updatedTask) throw new Error("Task not found");

  await logTaskHistory(id, changes, user._id);

  logger.info("Graphql - Resolver - taskResolver - updateTask - end");
  return updatedTask;
});

const deleteTask = asyncWrapper(async (_, { id }, { user }) => {
  logger.info("Graphql - Resolver - taskResolver - deleteTask - start");
  authorizeRoles("admin")(user);

  const deletedTask = await Task.findByIdAndDelete(id);
  if (!deletedTask) throw new Error("Task not found");

  const changes = [{ field: "Task", oldValue: deletedTask }];
  await logTaskHistory(id, changes, user._id);

  logger.info("Graphql - Resolver - taskResolver - deleteTask - end");
  return true;
});

const updateTaskStatus = asyncWrapper(
  async (_, { taskId, status }, { user }) => {
    logger.info("Graphql - Resolver - taskResolver - updateTaskStatus - start");
    authorizeRoles(
      "admin",
      "project-manager",
      "team-lead",
      "team-member"
    )(user);

    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    const previousStatus = task.status.current;
    const history = task.status.history || [];

    const changes = [
      { field: "status", oldValue: previousStatus, newValue: status },
    ];

    history.push({ status: previousStatus, timestamp: new Date() });

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { "status.current": status, "status.history": history },
      { new: true }
    ).populate("assignedUsers subtasks dependencies");

    await logTaskHistory(taskId, changes, user._id);

    logger.info("Graphql - Resolver - taskResolver - updateTaskStatus - end");
    return updatedTask;
  }
);

const addTaskDependencies = asyncWrapper(
  async (_, { taskId, dependencyIds }, { user }) => {
    logger.info(
      "Graphql - Resolver - taskResolver - addTaskDependencies - start"
    );
    authorizeRoles("admin", "project-manager", "team-lead")(user);

    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    const dependencies = await Task.find({ _id: { $in: dependencyIds } });
    if (dependencies.length !== dependencyIds.length)
      throw new Error("Some dependencies not found");

    const changes = [
      {
        field: "dependencies",
        oldValue: task.dependencies,
        newValue: dependencyIds,
      },
    ];

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { dependencies: dependencyIds },
      { new: true }
    ).populate("dependencies");

    await logTaskHistory(taskId, changes, user._id);

    logger.info(
      "Graphql - Resolver - taskResolver - addTaskDependencies - end"
    );
    return updatedTask;
  }
);

module.exports = {
  fetchTasks,
  fetchTaskDetails,
  fetchTaskDetails,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addTaskDependencies,
};
